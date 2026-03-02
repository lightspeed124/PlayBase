#!/usr/bin/env node
/**
 * export_existing_to_parsed.js
 * Back-fill data/parsed/<slug>.json for companies already in src/lib/data.ts
 * so the crawl pipeline has a complete audit trail from day one.
 *
 * Usage:
 *   node scripts/export_existing_to_parsed.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const dataPath = path.join(ROOT, "src", "lib", "data.ts");
const parsedDir = path.join(ROOT, "data", "parsed");

fs.mkdirSync(parsedDir, { recursive: true });

// ── Load data.ts by stripping TypeScript syntax and evaluating ────────────────

let code = fs.readFileSync(dataPath, "utf8");

// Remove import statement(s)
code = code.replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*\n/gm, "");

// Remove TypeScript type annotations on const declarations
// e.g.  ": Company[]"  ": RentalItem[]"  ": Category"
code = code.replace(/:\s*(?:Company|RentalItem|Category)\s*(?:\[\])?/g, "");

// Remove "export" keyword from const/function declarations
code = code.replace(/^export\s+/gm, "");

// Chop off everything from the first function declaration onward —
// we only need the companies[] and rentalItems[] arrays.
const fnIdx = code.search(/^function\s+\w+/m);
if (fnIdx !== -1) code = code.slice(0, fnIdx);

// const/let are block-scoped and not exposed on the vm sandbox —
// replace top-level const/let declarations with var.
code = code.replace(/^const\s+/gm, "var ").replace(/^let\s+/gm, "var ");

// Evaluate in a sandbox
const sandbox = {};
try {
  vm.runInNewContext(code, sandbox);
} catch (e) {
  console.error("Failed to evaluate data.ts:", e.message);
  process.exit(1);
}

const { companies, rentalItems } = sandbox;

if (!companies || !rentalItems) {
  console.error("Could not find companies or rentalItems in data.ts");
  process.exit(1);
}

console.log(`\nFound ${companies.length} companies, ${rentalItems.length} total items in data.ts\n`);

// ── Group items by companyId ──────────────────────────────────────────────────

const itemsByCompany = {};
for (const item of rentalItems) {
  if (!itemsByCompany[item.companyId]) itemsByCompany[item.companyId] = [];
  itemsByCompany[item.companyId].push(item);
}

// ── Write one parsed JSON per company ────────────────────────────────────────

for (const company of companies) {
  const items = itemsByCompany[company.id] || [];
  const outPath = path.join(parsedDir, `${company.slug}.json`);

  // Don't overwrite if a proper crawl already produced this file
  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
    // Existing file was produced by the crawler if it has a meta.crawledAt field
    if (existing.meta?.crawledAt) {
      console.log(`  SKIP  ${company.slug}.json  (already has crawl metadata)`);
      continue;
    }
  }

  const output = {
    company,
    items,
    meta: {
      siteSlug: company.slug,
      crawledAt: null, // null = backfilled from data.ts, not from a live crawl
      sourceUrl: company.website,
      note: "Backfilled from src/lib/data.ts by export_existing_to_parsed.js",
      urlsDiscovered: 0,
      inventoryUrls: items.length,
      infoUrls: 0,
      pagesFetched: 0,
      errors: 0,
    },
    errors: [],
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");

  // Summary markdown
  const summaryLines = [
    `# Parsed Data: ${company.name}`,
    ``,
    `**Source:** Backfilled from \`src/lib/data.ts\``,
    `**Note:** Not from a live crawl — this is existing hand-curated data.`,
    ``,
    `## Company`,
    `| Field | Value |`,
    `|-------|-------|`,
    `| ID | \`${company.id}\` |`,
    `| Website | ${company.website} |`,
    `| Phone | ${company.phone} |`,
    `| Email | ${company.email} |`,
    `| Location | ${company.location} |`,
    `| Service Area | ${company.serviceArea.join(", ")} |`,
    ``,
    `## Items (${items.length})`,
    items.map((i) => `- **${i.name}** (\`${i.category}\`) — $${i.price}`).join("\n"),
  ];

  fs.writeFileSync(
    path.join(parsedDir, `${company.slug}_summary.md`),
    summaryLines.join("\n"),
    "utf8"
  );

  console.log(
    `  WROTE ${company.slug}.json  (${items.length} items)`
  );
}

console.log(`\nDone. Files written to data/parsed/`);
