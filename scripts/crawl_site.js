#!/usr/bin/env node
/**
 * crawl_site.js
 * Crawl a bounce house rental site safely:
 *   1. Check robots.txt
 *   2. Discover URLs from sitemap(s)
 *   3. Separate inventory vs info URLs
 *   4. Download raw HTML to data/raw/<slug>/
 *   5. Parse: Company + RentalItem fields
 *   6. Output data/parsed/<slug>.json + _errors.log + _summary.md
 *
 * Usage:
 *   node scripts/crawl_site.js <base-url> [--slug=<site-slug>]
 *
 * Examples:
 *   node scripts/crawl_site.js https://norcaljump.com --slug=norcal-jump
 *   node scripts/crawl_site.js https://kidzzstarjumpers.com
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// ── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const baseUrlArg = args.find((a) => !a.startsWith("--"));
const slugArg = args.find((a) => a.startsWith("--slug="));

if (!baseUrlArg) {
  console.error(
    "Usage: node scripts/crawl_site.js <base-url> [--slug=<site-slug>]"
  );
  process.exit(1);
}

const BASE_URL = baseUrlArg.replace(/\/$/, "");
const base = new URL(BASE_URL);
const SITE_SLUG = slugArg
  ? slugArg.split("=")[1]
  : base.hostname.replace(/^www\./, "").replace(/\./g, "-");

const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "data", "raw", SITE_SLUG);
const PARSED_DIR = path.join(ROOT, "data", "parsed");

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(PARSED_DIR, { recursive: true });

const DELAY_MS = 1500; // polite crawl delay between requests
const TIMEOUT_MS = 12000;
const MAX_INVENTORY = 100; // cap to avoid runaway crawls
const USER_AGENT =
  "PlayBase-Crawler/1.0 (+https://github.com/lightspeed124/PlayBase)";

const errors = [];

// ── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(urlStr, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error("Too many redirects"));
    let parsed;
    try {
      parsed = new URL(urlStr);
    } catch (e) {
      return reject(new Error(`Invalid URL: ${urlStr}`));
    }
    const client = parsed.protocol === "https:" ? https : http;
    const req = client.get(
      urlStr,
      { headers: { "User-Agent": USER_AGENT }, timeout: TIMEOUT_MS },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectTarget = new URL(
            res.headers.location,
            urlStr
          ).toString();
          res.resume();
          return fetchUrl(redirectTarget, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: data, headers: res.headers })
        );
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${urlStr}`));
    });
  });
}

// ── robots.txt ───────────────────────────────────────────────────────────────

function parseRobots(text) {
  const sitemaps = [];
  const disallowed = [];
  let inRelevantBlock = false;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line.toLowerCase().startsWith("sitemap:")) {
      const loc = line.slice(line.indexOf(":") + 1).trim();
      if (loc) sitemaps.push(loc);
    }
    if (line.toLowerCase().startsWith("user-agent:")) {
      const agent = line.slice(line.indexOf(":") + 1).trim();
      inRelevantBlock = agent === "*" || agent.toLowerCase().includes("playbase");
    }
    if (inRelevantBlock && line.toLowerCase().startsWith("disallow:")) {
      const p = line.slice(line.indexOf(":") + 1).trim();
      if (p) disallowed.push(p);
    }
  }
  return { sitemaps, disallowed };
}

function isAllowed(urlStr, disallowed) {
  const pathname = new URL(urlStr).pathname;
  return !disallowed.some((d) => d !== "/" && pathname.startsWith(d));
}

// ── Sitemaps ─────────────────────────────────────────────────────────────────

async function fetchSitemap(sitemapUrl, depth = 0) {
  if (depth > 3) return [];
  const urls = [];
  try {
    const res = await fetchUrl(sitemapUrl);
    if (res.status !== 200) return urls;
    const xml = res.body;

    // Sitemap index — recurse into child sitemaps
    const indexLocs = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>/g)].map(
      (m) => m[1].trim()
    );
    for (const loc of indexLocs) {
      const sub = await fetchSitemap(loc, depth + 1);
      urls.push(...sub);
      await sleep(300);
    }

    // Regular URL entries
    const urlLocs = [...xml.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>/g)].map(
      (m) => m[1].trim()
    );
    urls.push(...urlLocs);
  } catch (e) {
    errors.push({ type: "sitemap_fetch", url: sitemapUrl, error: e.message });
  }
  return urls;
}

// ── URL Classification ────────────────────────────────────────────────────────

const INVENTORY_RE =
  /\/(product|item|rental|bounce|slide|combo|obstacle|game|inflatable|unit|package|jumper|water-slide|combo-unit|catalog|inventory|rent)/i;
const INFO_RE =
  /\/(about|contact|faq|blog|news|policy|privacy|terms|service-area|delivery|gallery|testimonial|review|areas-we-serve)/i;

function classifyUrls(urls) {
  const inventory = [];
  const info = [];

  for (const u of urls) {
    let parsed;
    try {
      parsed = new URL(u);
    } catch {
      continue;
    }
    // Stay on the same origin
    if (parsed.origin !== base.origin) continue;
    // Skip assets
    if (/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|pdf|xml|txt)$/i.test(parsed.pathname))
      continue;

    if (INVENTORY_RE.test(parsed.pathname)) inventory.push(u);
    else if (INFO_RE.test(parsed.pathname)) info.push(u);
  }

  return { inventory, info };
}

// ── HTML Parsing helpers ──────────────────────────────────────────────────────

function extractMeta(html, name) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function firstMatch(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return (m[1] || m[0]).trim();
  }
  return "";
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/water.?slide|waterslide/.test(t)) return "Water Slides";
  if (/obstacle/.test(t)) return "Obstacle Courses";
  if (/combo/.test(t)) return "Combos";
  if (/carnival|game/.test(t)) return "Games";
  if (/tent/.test(t)) return "Tents";
  if (/table|chair/.test(t)) return "Tables & Chairs";
  if (/popcorn|cotton candy|snow cone|concession/.test(t)) return "Concessions";
  return "Bounce Houses";
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// ── Parse Rental Item ─────────────────────────────────────────────────────────

function parseRentalItem(html, pageUrl) {
  const title = firstMatch(html, [
    /<h1[^>]*>([^<]{3,100})<\/h1>/i,
    /<title>([^<|–\-]{3,80})/i,
  ]) || extractMeta(html, "og:title") || "";

  const description = (
    extractMeta(html, "og:description") ||
    extractMeta(html, "description") ||
    firstMatch(html, [
      /<p[^>]*class="[^"]*(?:description|product-desc|summary)[^"]*"[^>]*>([\s\S]{20,600}?)<\/p>/i,
      /<div[^>]*class="[^"]*(?:description|product-desc|summary)[^"]*"[^>]*>([\s\S]{20,600}?)<\/div>/i,
    ])
  )
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Price — grab first dollar amount
  const priceMatch = html.match(/\$\s*(\d{2,4}(?:\.\d{2})?)/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

  // Dimensions — e.g. "15ft x 15ft x 14ft" or "15' x 15'"
  const dimMatch = html.match(
    /(\d{1,3})\s*(?:ft|'|feet)?\s*[xX×]\s*(\d{1,3})\s*(?:ft|'|feet)?(?:\s*[xX×]\s*(\d{1,3})\s*(?:ft|'|feet)?)?/
  );
  const dimensions = dimMatch
    ? dimMatch[0].replace(/\s+/g, " ").trim()
    : "";

  // Images — exclude logos/icons, prefer product photos
  const imgTags = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  const images = imgTags
    .map((m) => m[1])
    .filter(
      (src) =>
        src &&
        !/logo|icon|sprite|pixel|blank|placeholder/i.test(src) &&
        /\.(jpg|jpeg|png|webp)/i.test(src)
    )
    .map((src) => (src.startsWith("http") ? src : new URL(src, pageUrl).toString()))
    .slice(0, 6);

  const slug = slugify(title);
  const id = `${SITE_SLUG}-${slug}`.slice(0, 100);
  const category = detectCategory(title + " " + description);

  // Themes — simple keyword extraction
  const themes = [];
  const themeKeywords = {
    Princess: /princess|cinderella|fairy/i,
    Castle: /castle|palace/i,
    Tropical: /tropical|luau|island|palm/i,
    Sports: /sports|soccer|football|basketball/i,
    "Water Play": /water|splash|wet/i,
    Superhero: /super.?hero|batman|spider.?man|marvel/i,
    Toddler: /toddler|infant|little one/i,
    "Obstacle Course": /obstacle|ninja/i,
    Carnival: /carnival|circus|fair/i,
    Western: /western|cowboy/i,
    Tropical: /tropical/i,
  };
  for (const [theme, re] of Object.entries(themeKeywords)) {
    if (re.test(title + " " + description) && !themes.includes(theme))
      themes.push(theme);
  }

  return {
    id,
    companyId: SITE_SLUG,
    name: title,
    slug,
    category,
    themes,
    description,
    dimensions,
    capacity: 8,
    ageRange: "2–12 years",
    setupTime: 30,
    price,
    images,
    available: true,
    features: [],
    safetyNotes: "Adult supervision required at all times.",
    colors: [],
    _sourceUrl: pageUrl, // internal, stripped before data.ts append
  };
}

// ── Parse Company Info ────────────────────────────────────────────────────────

const BAY_AREA_CITIES = [
  "San Jose", "San Francisco", "Oakland", "Fremont", "Hayward", "Palo Alto",
  "Sunnyvale", "Santa Clara", "Mountain View", "Redwood City", "San Mateo",
  "Daly City", "Berkeley", "Richmond", "Concord", "Walnut Creek", "Pleasanton",
  "Livermore", "Dublin", "San Ramon", "Danville", "Antioch", "Vallejo",
  "San Rafael", "Petaluma", "Santa Rosa", "Napa", "Novato", "Mill Valley",
  "Fairfax", "Corte Madera", "Tiburon", "Sausalito", "Marin", "Sonoma",
  "East Palo Alto", "Menlo Park", "Los Altos", "Los Gatos", "Saratoga",
  "Campbell", "Milpitas", "Union City", "Newark", "San Leandro", "Alameda",
  "Emeryville", "Gilroy", "Morgan Hill", "Los Banos", "Stockton", "Modesto",
  "Sacramento", "San Jose", "Cupertino", "Los Altos Hills",
];

function parseCompanyInfo(html, pageUrl) {
  const name = (
    extractMeta(html, "og:site_name") ||
    firstMatch(html, [/<h1[^>]*>([^<]{3,60})<\/h1>/i]) ||
    extractMeta(html, "og:title") ||
    firstMatch(html, [/<title>([^<|–\-]{3,60})/i]) ||
    SITE_SLUG
  ).trim();

  const phone = firstMatch(html, [
    /(?:tel:|phone:|call us at)[:\s]*([\d()\-\s.+]{10,20})/i,
    /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,
  ]);

  const emailMatch = html.match(
    /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/
  );
  const email = emailMatch ? emailMatch[1] : "";

  const locationMatch = html.match(
    /(?:located in|based in|headquartered in|serving)\s+([A-Z][a-zA-Z\s]+,\s*CA)/i
  );
  const location = locationMatch ? locationMatch[1].trim() : "";

  const cityRe = new RegExp(`\\b(${BAY_AREA_CITIES.join("|")})\\b`, "gi");
  const cityMatches = html.match(cityRe) || [];
  const serviceArea = [
    ...new Set(cityMatches.map((c) => c.trim())),
  ].slice(0, 30);

  const yearsMatch = html.match(/(\d{1,2})\s*\+?\s*years?\s*(?:in business|of (?:experience|service))/i);
  const yearsInBusiness = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;

  const description = (
    extractMeta(html, "og:description") ||
    extractMeta(html, "description") ||
    ""
  ).trim();

  return {
    id: SITE_SLUG,
    name,
    slug: SITE_SLUG,
    logo: "",
    description,
    yearsInBusiness,
    rating: 5.0,
    reviewCount: 0,
    location,
    serviceArea,
    phone,
    email,
    website: base.origin,
    verified: false,
    insuranceCertified: false,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n PlayBase Crawler — ${SITE_SLUG}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Raw output: ${RAW_DIR}\n`);

  // 1. robots.txt
  console.log("[1/5] Checking robots.txt...");
  let sitemapUrls = [];
  let disallowed = [];
  try {
    const res = await fetchUrl(`${base.origin}/robots.txt`);
    if (res.status === 200) {
      const info = parseRobots(res.body);
      sitemapUrls = info.sitemaps;
      disallowed = info.disallowed;
      fs.writeFileSync(path.join(RAW_DIR, "robots.txt"), res.body);
      console.log(
        `  Found ${sitemapUrls.length} sitemap(s), ${disallowed.length} disallowed path(s)`
      );
    } else {
      console.log("  No robots.txt (HTTP " + res.status + ")");
    }
  } catch (e) {
    errors.push({ type: "robots_fetch", error: e.message });
    console.log("  Could not fetch robots.txt:", e.message);
  }

  // Fallback sitemap locations if none declared in robots.txt
  if (sitemapUrls.length === 0) {
    sitemapUrls = [
      `${base.origin}/sitemap.xml`,
      `${base.origin}/sitemap_index.xml`,
      `${base.origin}/sitemap/`,
    ];
  }

  // 2. Discover URLs
  console.log("\n[2/5] Fetching sitemaps...");
  let allUrls = [];
  for (const sm of sitemapUrls) {
    console.log(`  -> ${sm}`);
    const found = await fetchSitemap(sm);
    allUrls.push(...found);
    await sleep(500);
  }
  allUrls = [...new Set(allUrls)].filter((u) => isAllowed(u, disallowed));
  console.log(`  Discovered ${allUrls.length} URLs`);

  // 3. Classify
  console.log("\n[3/5] Classifying URLs...");
  const { inventory, info } = classifyUrls(allUrls);
  const inventoryCapped = inventory.slice(0, MAX_INVENTORY);
  console.log(`  Inventory URLs : ${inventory.length} (crawling up to ${MAX_INVENTORY})`);
  console.log(`  Info URLs      : ${info.length}`);

  fs.writeFileSync(
    path.join(RAW_DIR, "urls.json"),
    JSON.stringify({ inventory, info, all: allUrls }, null, 2)
  );

  // 4. Download raw HTML
  console.log("\n[4/5] Downloading pages...");
  const pagesToFetch = [
    BASE_URL,
    ...info.slice(0, 5),
    ...inventoryCapped,
  ];

  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < pagesToFetch.length; i++) {
    const pageUrl = pagesToFetch[i];
    const filename =
      pageUrl.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 150) + ".html";
    const filePath = path.join(RAW_DIR, filename);

    if (fs.existsSync(filePath)) {
      skipped++;
      process.stdout.write(
        `\r  [${i + 1}/${pagesToFetch.length}] ${fetched} fetched, ${skipped} cached, ${failed} failed`
      );
      continue;
    }

    try {
      const res = await fetchUrl(pageUrl);
      if (res.status === 200) {
        fs.writeFileSync(filePath, res.body);
        fetched++;
      } else {
        errors.push({ type: "http_error", url: pageUrl, status: res.status });
        failed++;
      }
    } catch (e) {
      errors.push({ type: "fetch_error", url: pageUrl, error: e.message });
      failed++;
    }

    process.stdout.write(
      `\r  [${i + 1}/${pagesToFetch.length}] ${fetched} fetched, ${skipped} cached, ${failed} failed`
    );
    await sleep(DELAY_MS);
  }
  console.log();

  // 5. Parse
  console.log("\n[5/5] Parsing HTML...");

  // Company — parse homepage first, then enrich from info pages
  const homepageFile = path.join(
    RAW_DIR,
    BASE_URL.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 150) + ".html"
  );
  let company = null;
  const tryParseCompany = (filePath, pageUrl) => {
    if (!fs.existsSync(filePath)) return null;
    return parseCompanyInfo(fs.readFileSync(filePath, "utf8"), pageUrl);
  };

  company = tryParseCompany(homepageFile, BASE_URL);
  if (company) {
    for (const infoUrl of info.slice(0, 4)) {
      const f = path.join(
        RAW_DIR,
        infoUrl.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 150) + ".html"
      );
      const enriched = tryParseCompany(f, infoUrl);
      if (!enriched) continue;
      if (!company.phone && enriched.phone) company.phone = enriched.phone;
      if (!company.email && enriched.email) company.email = enriched.email;
      if (!company.location && enriched.location) company.location = enriched.location;
      if (enriched.serviceArea.length > company.serviceArea.length)
        company.serviceArea = enriched.serviceArea;
      if (!company.yearsInBusiness && enriched.yearsInBusiness)
        company.yearsInBusiness = enriched.yearsInBusiness;
    }
  }

  // Rental items
  const items = [];
  const seenIds = new Set();
  const missingFieldsLog = [];

  for (const inventoryUrl of inventoryCapped) {
    const f = path.join(
      RAW_DIR,
      inventoryUrl.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 150) + ".html"
    );
    if (!fs.existsSync(f)) {
      errors.push({ type: "missing_raw", url: inventoryUrl });
      continue;
    }

    let item;
    try {
      item = parseRentalItem(fs.readFileSync(f, "utf8"), inventoryUrl);
    } catch (e) {
      errors.push({ type: "parse_error", url: inventoryUrl, error: e.message });
      continue;
    }

    if (!item.name || item.name.length < 3) {
      errors.push({ type: "missing_title", url: inventoryUrl });
      continue;
    }
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);

    const missing = [];
    if (!item.price) missing.push("price");
    if (!item.description) missing.push("description");
    if (!item.dimensions) missing.push("dimensions");
    if (!item.images.length) missing.push("images");
    if (missing.length)
      missingFieldsLog.push({ item: item.name, url: inventoryUrl, missing });

    items.push(item);
  }

  // Save output
  const output = {
    company,
    items,
    meta: {
      siteSlug: SITE_SLUG,
      crawledAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      urlsDiscovered: allUrls.length,
      inventoryUrls: inventory.length,
      infoUrls: info.length,
      pagesFetched: fetched,
      errors: errors.length,
    },
    errors,
  };

  fs.writeFileSync(
    path.join(PARSED_DIR, `${SITE_SLUG}.json`),
    JSON.stringify(output, null, 2)
  );
  fs.writeFileSync(
    path.join(PARSED_DIR, `${SITE_SLUG}_errors.log`),
    errors.map((e) => JSON.stringify(e)).join("\n")
  );

  // Summary markdown
  const summaryLines = [
    `# Crawl Summary: ${SITE_SLUG}`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Source:** ${BASE_URL}`,
    ``,
    `## URLs`,
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total discovered | ${allUrls.length} |`,
    `| Inventory/product | ${inventory.length} |`,
    `| Info/company | ${info.length} |`,
    `| Pages downloaded | ${fetched + skipped} |`,
    ``,
    `## Parsed`,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Company | ${company?.name || "NOT FOUND"} |`,
    `| Items parsed | ${items.length} |`,
    `| Total errors | ${errors.length} |`,
    ``,
    `## Items with Missing Fields`,
    missingFieldsLog.length
      ? missingFieldsLog
          .map((m) => `- **${m.item}**: missing ${m.missing.join(", ")}`)
          .join("\n")
      : "- None",
    ``,
    `## Failures`,
    errors.filter((e) => e.type !== "missing_fields").length
      ? errors
          .filter((e) => e.type !== "missing_fields")
          .map(
            (e) =>
              `- \`${e.type}\` ${e.url ? `[${e.url.slice(0, 60)}]` : ""} ${e.error || e.status || ""}`
          )
          .join("\n")
      : "- None",
    ``,
    `## Items Parsed`,
    items.length
      ? items
          .map(
            (i) =>
              `- **${i.name}** (${i.category})${i.price ? ` — $${i.price}` : ""}`
          )
          .join("\n")
      : "- None",
  ];

  fs.writeFileSync(
    path.join(PARSED_DIR, `${SITE_SLUG}_summary.md`),
    summaryLines.join("\n")
  );

  console.log(`\n  Company : ${company?.name || "NOT FOUND"}`);
  console.log(`  Items   : ${items.length}`);
  console.log(`  Errors  : ${errors.length}`);
  console.log(`\nOutput:`);
  console.log(`  data/parsed/${SITE_SLUG}.json`);
  console.log(`  data/parsed/${SITE_SLUG}_errors.log`);
  console.log(`  data/parsed/${SITE_SLUG}_summary.md`);
  console.log(`\nNext step:`);
  console.log(`  node scripts/append_to_data.js ${SITE_SLUG}`);
}

main().catch((e) => {
  console.error("\nFatal:", e.message);
  process.exit(1);
});
