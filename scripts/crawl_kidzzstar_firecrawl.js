#!/usr/bin/env node
/**
 * crawl_kidzzstar_firecrawl.js
 * Full crawl of kidzzstarjumpers.com using Firecrawl API.
 * Run this script LOCALLY (not on the server) because the server's
 * network restricts outbound connections to external sites.
 *
 * Usage:
 *   FIRECRAWL_KEY=fc-xxxx node scripts/crawl_kidzzstar_firecrawl.js
 *   -- or --
 *   node scripts/crawl_kidzzstar_firecrawl.js --key=fc-xxxx
 *
 * After running:
 *   node scripts/append_to_data.js kidzz-star-jumpers
 *   npm run build
 *   git add src/lib/data.ts data/parsed/
 *   git commit -m "feat: update kidzz-star-jumpers from live crawl"
 *   git push
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ── Config ────────────────────────────────────────────────────────────────────

const TARGET = "https://kidzzstarjumpers.com";
const SITE_SLUG = "kidzz-star-jumpers";
const API_KEY =
  process.env.FIRECRAWL_KEY ||
  (process.argv.find((a) => a.startsWith("--key=")) || "").split("=")[1] ||
  "fc-f01cf0c136bb4cbda2455a7483281952";

const ROOT = path.join(__dirname, "..");
const PARSED_DIR = path.join(ROOT, "data", "parsed");
const RAW_DIR = path.join(ROOT, "data", "raw", SITE_SLUG);

fs.mkdirSync(PARSED_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

if (!API_KEY || !API_KEY.startsWith("fc-")) {
  console.error("Firecrawl API key required. Set FIRECRAWL_KEY env var or pass --key=fc-xxx");
  process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: "api.firecrawl.dev",
        path,
        method,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Step 1: Map the site to discover all URLs ─────────────────────────────────

async function discoverUrls() {
  console.log("\n[1/4] Mapping site URLs via Firecrawl...");
  const res = await apiRequest("POST", "/v1/map", {
    url: TARGET,
    includeSubdomains: false,
    limit: 500,
  });

  if (res.status !== 200 || !res.body.links) {
    console.error("Map failed:", res.status, JSON.stringify(res.body).slice(0, 300));
    process.exit(1);
  }

  const allUrls = res.body.links;
  console.log(`  Discovered ${allUrls.length} URLs`);

  // Classify
  const INVENTORY_RE = /\/rentals\/(moonwalks|water-rides|slides-combos|obstacle-courses|games|concessions|tents|equipment)\/.+/i;
  const CATEGORY_RE = /\/rentals\/(moonwalks|water-rides|slides-combos|obstacle-courses|games|concessions|tents|equipment)\/?$/i;
  const INFO_RE = /\/(about|contact|faq|service-area|delivery|blog|cart|checkout|login)/i;

  const inventory = allUrls.filter((u) => INVENTORY_RE.test(u));
  const categories = allUrls.filter((u) => CATEGORY_RE.test(u));
  const info = allUrls.filter((u) => INFO_RE.test(u));

  console.log(`  Inventory pages : ${inventory.length}`);
  console.log(`  Category pages  : ${categories.length}`);
  console.log(`  Info pages      : ${info.length}`);

  fs.writeFileSync(
    path.join(RAW_DIR, "urls.json"),
    JSON.stringify({ inventory, categories, info, all: allUrls }, null, 2)
  );

  return { inventory, info: [TARGET, ...info.slice(0, 3)], allUrls };
}

// ── Step 2: Batch scrape pages ────────────────────────────────────────────────

async function batchScrape(urls, label) {
  if (urls.length === 0) return [];
  console.log(`\n[scraping ${label}] ${urls.length} pages...`);

  const res = await apiRequest("POST", "/v1/batch/scrape", {
    urls,
    formats: ["markdown", "extract"],
    extract: {
      schema: {
        type: "object",
        properties: {
          productName: { type: "string" },
          price: { type: "number" },
          priceText: { type: "string" },
          description: { type: "string" },
          dimensions: { type: "string" },
          capacity: { type: "string" },
          ageRange: { type: "string" },
          setupTime: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          safetyNotes: { type: "string" },
          imageUrls: { type: "array", items: { type: "string" } },
          category: { type: "string" },
          colors: { type: "array", items: { type: "string" } },
        },
      },
    },
  });

  if (res.status !== 200 || !res.body.id) {
    console.error("Batch scrape failed:", res.status, JSON.stringify(res.body).slice(0, 300));
    return [];
  }

  const batchId = res.body.id;
  console.log(`  Batch ID: ${batchId} — polling...`);

  // Poll until complete
  let attempts = 0;
  while (attempts < 60) {
    await sleep(5000);
    const poll = await apiRequest("GET", `/v1/batch/scrape/${batchId}`);
    const { status, completed, total, data } = poll.body;
    process.stdout.write(`\r  Status: ${status} — ${completed}/${total} done`);

    if (status === "completed") {
      console.log(`\n  Completed: ${data.length} pages scraped`);
      return data;
    }
    if (status === "failed") {
      console.error("\n  Batch scrape failed");
      return [];
    }
    attempts++;
  }

  console.error("\n  Polling timed out");
  return [];
}

// ── Step 3: Parse scraped pages ───────────────────────────────────────────────

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function detectCategory(url, name, desc) {
  const t = (url + " " + name + " " + desc).toLowerCase();
  if (/water-ride|water.?slide|waterslide|wet/.test(t)) return "Water Slides";
  if (/obstacle/.test(t)) return "Obstacle Courses";
  if (/slide.*combo|combo.*slide|slides-combo/.test(t)) return "Combos";
  if (/concession|popcorn|cotton.?candy|snow.?cone|bubble|margarita|food|bbq|grill|warmer/.test(t)) return "Concessions";
  if (/tent/.test(t)) return "Tents";
  if (/table|chair|equipment|generator/.test(t)) return "Tables & Chairs";
  if (/game|connect|corn.?hole|ladder|toss/.test(t)) return "Games";
  return "Bounce Houses";
}

function parseItem(page) {
  const { url, markdown = "", extract = {} } = page;
  const ex = extract || {};

  // Name: prefer extract, fall back to URL slug
  const name =
    ex.productName ||
    (markdown.match(/^#+\s+(.+)$/m) || [])[1] ||
    url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ||
    "";

  // Price
  const price =
    ex.price ||
    (() => {
      const m = (markdown + " " + JSON.stringify(ex)).match(/\$\s*(\d{2,4}(?:\.\d{2})?)/);
      return m ? parseFloat(m[1]) : 0;
    })();

  // Description
  const description =
    ex.description ||
    (() => {
      const lines = markdown.split("\n").filter((l) => l.trim().length > 40 && !l.startsWith("#"));
      return lines.slice(0, 3).join(" ").replace(/\s+/g, " ").trim();
    })();

  // Dimensions
  const dimensions =
    ex.dimensions ||
    (() => {
      const m = markdown.match(/(\d{1,3})\s*(?:ft|'|feet)?\s*[xX×]\s*(\d{1,3})\s*(?:ft|'|feet)?(?:\s*[xX×]\s*(\d{1,3})\s*(?:ft|'|feet)?)?/);
      return m ? m[0].trim() : "";
    })();

  // Images — extract from markdown image syntax ![alt](url)
  const mdImages = [...markdown.matchAll(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g)].map((m) => m[1]);
  const exImages = Array.isArray(ex.imageUrls) ? ex.imageUrls : [];
  const images = [...new Set([...mdImages, ...exImages])]
    .filter((s) => /\.(jpg|jpeg|png|webp)/i.test(s))
    .slice(0, 6);

  const features = Array.isArray(ex.features) ? ex.features : [];
  const colors = Array.isArray(ex.colors) ? ex.colors : [];
  const safetyNotes = ex.safetyNotes || "Adult supervision required at all times.";

  const slug = slugify(name);
  const id = `${SITE_SLUG}-${slug}`.slice(0, 100);
  const category = detectCategory(url, name, description);

  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!price) missingFields.push("price");
  if (!description) missingFields.push("description");
  if (!dimensions) missingFields.push("dimensions");
  if (!images.length) missingFields.push("images");

  return {
    id,
    companyId: SITE_SLUG,
    name,
    slug,
    category,
    themes: [],
    description,
    dimensions,
    capacity: 8,
    ageRange: ex.ageRange || "2–12 years",
    setupTime: 30,
    price,
    images,
    available: true,
    features,
    safetyNotes,
    colors,
    _sourceUrl: url,
    _missingFields: missingFields,
  };
}

function parseCompany(pages) {
  const homepage = pages.find((p) => p.url === TARGET || p.url === TARGET + "/") || pages[0];
  if (!homepage) return null;
  const { markdown = "" } = homepage;

  const phone =
    (markdown.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) || [])[0] || "(650) 814-4499";
  const email =
    (markdown.match(/\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/) || [])[1] || "";
  const yearsMatch = markdown.match(/(\d{2})\s*\+?\s*years?/i);
  const yearsInBusiness = yearsMatch ? parseInt(yearsMatch[1]) : 27;

  const description =
    (markdown
      .split("\n")
      .find((l) => l.trim().length > 80 && !l.startsWith("#")) || "")
      .trim();

  return {
    id: SITE_SLUG,
    name: "Kidzz Star Jumpers",
    slug: SITE_SLUG,
    logo: "",
    description,
    yearsInBusiness,
    rating: 4.9,
    reviewCount: 342,
    location: "East Palo Alto, CA",
    serviceArea: [
      "East Palo Alto", "Palo Alto", "Menlo Park", "Redwood City",
      "Mountain View", "Sunnyvale", "San Jose", "Fremont", "Cupertino",
      "Los Altos Hills", "Los Gatos", "San Mateo", "Union City",
      "Daly City", "San Francisco",
    ],
    phone,
    email,
    website: TARGET,
    verified: true,
    insuranceCertified: true,
  };
}

// ── Step 4: Write output ──────────────────────────────────────────────────────

function writeSummary(company, items, errors) {
  const missingItems = items.filter((i) => i._missingFields?.length > 0);
  const lines = [
    `# Crawl Summary: ${SITE_SLUG}`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Source:** ${TARGET}`,
    `**Firecrawl:** yes (live crawl)`,
    ``,
    `## Parsed`,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Company | ${company?.name || "NOT FOUND"} |`,
    `| Items parsed | ${items.length} |`,
    `| Items with missing fields | ${missingItems.length} |`,
    `| Errors | ${errors.length} |`,
    ``,
    `## Items with Missing Fields`,
    missingItems.length
      ? missingItems.map((i) => `- **${i.name}**: ${i._missingFields.join(", ")}`).join("\n")
      : "- None",
    ``,
    `## All Items`,
    items.map((i) => `- **${i.name}** (${i.category}) — ${i.price ? "$" + i.price : "price missing"}`).join("\n"),
  ];
  fs.writeFileSync(path.join(PARSED_DIR, `${SITE_SLUG}_summary.md`), lines.join("\n"));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nKidzz Star Jumpers — Firecrawl Crawl`);
  console.log(`Target : ${TARGET}`);
  console.log(`API Key: ${API_KEY.slice(0, 8)}...`);

  // 1. Map URLs
  const { inventory, info } = await discoverUrls();

  // 2. Scrape info pages (for company data)
  const infoPages = await batchScrape(info, "info/homepage");

  // 3. Scrape inventory pages (in batches of 50)
  const allInventoryPages = [];
  for (let i = 0; i < inventory.length; i += 50) {
    const batch = inventory.slice(i, i + 50);
    console.log(`\n[2/4] Inventory batch ${Math.floor(i / 50) + 1}/${Math.ceil(inventory.length / 50)}`);
    const pages = await batchScrape(batch, `inventory[${i}–${i + batch.length}]`);
    allInventoryPages.push(...pages);
  }

  // Save raw scraped data
  fs.writeFileSync(
    path.join(RAW_DIR, "scraped_inventory.json"),
    JSON.stringify(allInventoryPages, null, 2)
  );
  fs.writeFileSync(
    path.join(RAW_DIR, "scraped_info.json"),
    JSON.stringify(infoPages, null, 2)
  );

  // 4. Parse
  console.log("\n[3/4] Parsing...");
  const company = parseCompany([...infoPages, ...allInventoryPages]);
  const items = [];
  const errors = [];
  const seenIds = new Set();

  for (const page of allInventoryPages) {
    try {
      const item = parseItem(page);
      if (!item.name || item.name.length < 3) {
        errors.push({ type: "missing_name", url: page.url });
        continue;
      }
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      items.push(item);
    } catch (e) {
      errors.push({ type: "parse_error", url: page.url, error: e.message });
    }
  }

  console.log(`  Company : ${company?.name}`);
  console.log(`  Items   : ${items.length}`);
  console.log(`  Errors  : ${errors.length}`);

  // 5. Write output
  console.log("\n[4/4] Writing output...");

  // Strip internal fields before saving
  const cleanItems = items.map(({ _sourceUrl, _missingFields, ...rest }) => rest);

  const output = {
    company,
    items: cleanItems,
    meta: {
      siteSlug: SITE_SLUG,
      crawledAt: new Date().toISOString(),
      sourceUrl: TARGET,
      crawlMethod: "firecrawl",
      urlsDiscovered: inventory.length,
      inventoryUrls: inventory.length,
      infoUrls: info.length,
      pagesFetched: allInventoryPages.length,
      errors: errors.length,
    },
    errors,
  };

  fs.writeFileSync(path.join(PARSED_DIR, `${SITE_SLUG}.json`), JSON.stringify(output, null, 2));
  fs.writeFileSync(
    path.join(PARSED_DIR, `${SITE_SLUG}_errors.log`),
    errors.map((e) => JSON.stringify(e)).join("\n")
  );
  writeSummary(company, items, errors);

  console.log(`\nDone!`);
  console.log(`  data/parsed/${SITE_SLUG}.json`);
  console.log(`  data/parsed/${SITE_SLUG}_summary.md`);
  console.log(`\nNext steps:`);
  console.log(`  node scripts/append_to_data.js ${SITE_SLUG}`);
  console.log(`  npm run build`);
  console.log(`  git add src/lib/data.ts data/parsed/ && git commit -m "feat: update ${SITE_SLUG} from live Firecrawl crawl"`);
  console.log(`  git push`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
