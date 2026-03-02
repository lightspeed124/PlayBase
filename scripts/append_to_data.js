#!/usr/bin/env node
/**
 * append_to_data.js
 * Merge crawled data from data/parsed/<slug>.json into src/lib/data.ts
 * Skips duplicates. Never removes existing data.
 *
 * Usage:
 *   node scripts/append_to_data.js <site-slug>
 *
 * Example:
 *   node scripts/append_to_data.js norcal-jump
 */

const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/append_to_data.js <site-slug>");
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const parsedPath = path.join(ROOT, "data", "parsed", `${slug}.json`);
const dataPath = path.join(ROOT, "src", "lib", "data.ts");

if (!fs.existsSync(parsedPath)) {
  console.error(`No parsed data at: ${parsedPath}`);
  console.error("Run crawl_site.js first.");
  process.exit(1);
}

// ── Load inputs ───────────────────────────────────────────────────────────────

const parsed = JSON.parse(fs.readFileSync(parsedPath, "utf8"));
const { company, items } = parsed;

if (!company) {
  console.error("Parsed JSON has no company data. Check crawl output.");
  process.exit(1);
}

let dataTs = fs.readFileSync(dataPath, "utf8");

// ── Deduplicate ───────────────────────────────────────────────────────────────

const companyExists = dataTs.includes(`id: "${company.id}"`);
const newItems = items.filter((item) => !dataTs.includes(`id: "${item.id}"`));

console.log(`\nAppending to src/lib/data.ts:`);
console.log(
  `  Company : ${company.name} ${companyExists ? "(already exists — skipping)" : "(NEW)"}`
);
console.log(
  `  Items   : ${newItems.length} new / ${items.length - newItems.length} duplicate(s) skipped`
);

if (companyExists && newItems.length === 0) {
  console.log("\nNothing to add — data.ts is already up to date.");
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a JS value as TypeScript source, indented by `indent` spaces */
function formatValue(value, indent) {
  const pad = " ".repeat(indent);
  const pad2 = " ".repeat(indent + 2);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every((v) => typeof v === "string")) {
      const items = value.map((v) => JSON.stringify(v)).join(`, `);
      const oneLine = `[${items}]`;
      if (oneLine.length < 80) return oneLine;
      return `[\n${value.map((v) => `${pad2}${JSON.stringify(v)}`).join(",\n")},\n${pad}]`;
    }
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
}

/** Format a Company object as a TypeScript object literal */
function formatCompany(c) {
  return `  {
    id: ${JSON.stringify(c.id)},
    name: ${JSON.stringify(c.name)},
    slug: ${JSON.stringify(c.slug)},
    logo: ${JSON.stringify(c.logo || "")},
    description: ${JSON.stringify(c.description)},
    yearsInBusiness: ${c.yearsInBusiness},
    rating: ${c.rating},
    reviewCount: ${c.reviewCount},
    location: ${JSON.stringify(c.location)},
    serviceArea: ${formatValue(c.serviceArea, 4)},
    phone: ${JSON.stringify(c.phone)},
    email: ${JSON.stringify(c.email)},
    website: ${JSON.stringify(c.website)},
    verified: ${c.verified},
    insuranceCertified: ${c.insuranceCertified},
  },`;
}

/** Format a RentalItem object as a TypeScript object literal */
function formatItem(item) {
  // Strip internal crawl metadata before writing to data.ts
  const { _sourceUrl, ...clean } = item;
  return `  {
    id: ${JSON.stringify(clean.id)},
    companyId: ${JSON.stringify(clean.companyId)},
    name: ${JSON.stringify(clean.name)},
    slug: ${JSON.stringify(clean.slug)},
    category: ${JSON.stringify(clean.category)},
    themes: ${formatValue(clean.themes, 4)},
    description: ${JSON.stringify(clean.description)},
    dimensions: ${JSON.stringify(clean.dimensions)},
    capacity: ${clean.capacity},
    ageRange: ${JSON.stringify(clean.ageRange)},
    setupTime: ${clean.setupTime},
    price: ${clean.price},
    images: ${formatValue(clean.images, 4)},
    available: ${clean.available},
    features: ${formatValue(clean.features, 4)},
    safetyNotes: ${JSON.stringify(clean.safetyNotes)},
    colors: ${formatValue(clean.colors, 4)},
  },`;
}

// ── Insert company ────────────────────────────────────────────────────────────

if (!companyExists) {
  // Find the closing marker of the companies array
  const marker = "];\n\nexport const rentalItems";
  const idx = dataTs.indexOf(marker);
  if (idx === -1) {
    console.error('Could not find "];\n\nexport const rentalItems" in data.ts');
    process.exit(1);
  }
  const companyBlock = `\n  // ─── ${company.name.toUpperCase()} ${"─".repeat(
    Math.max(0, 56 - company.name.length)
  )}\n\n${formatCompany(company)}\n`;
  dataTs = dataTs.slice(0, idx) + companyBlock + dataTs.slice(idx);
  console.log(`  + Inserted company: ${company.name}`);
}

// ── Insert rental items ───────────────────────────────────────────────────────

if (newItems.length > 0) {
  const header = `\n  // ─── ${company.name.toUpperCase()} ${"─".repeat(
    Math.max(0, 56 - company.name.length)
  )}\n\n`;
  const itemsBlock = newItems.map(formatItem).join("\n\n");

  // Insert before the last ]; in the file (end of rentalItems array)
  const lastBracketIdx = dataTs.lastIndexOf("];\n");
  if (lastBracketIdx === -1) {
    console.error('Could not find closing "];" of rentalItems in data.ts');
    process.exit(1);
  }
  dataTs =
    dataTs.slice(0, lastBracketIdx) +
    header +
    itemsBlock +
    "\n\n" +
    dataTs.slice(lastBracketIdx);
  console.log(`  + Inserted ${newItems.length} item(s)`);
}

// ── Write ─────────────────────────────────────────────────────────────────────

fs.writeFileSync(dataPath, dataTs, "utf8");

console.log(`\nsrc/lib/data.ts updated.`);
console.log(`Verify with: npm run build`);
console.log(`Then commit: git add src/lib/data.ts && git commit -m "feat: add ${company.name} catalog"`);
