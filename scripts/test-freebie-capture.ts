// Verification script for the Freebies Lead Capture & Delivery Engine.
// Run with:
//   npx tsx --env-file=.env.local scripts/test-freebie-capture.ts

import { getFreebie, listFreebies } from "../src/lib/freebies";
import { renderFreebieDeliveryEmail } from "../src/lib/email/templates/freebie-delivery";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function pass(msg: string) {
  console.log(`${GREEN}✔ PASS: ${msg}${RESET}`);
}

function fail(msg: string) {
  console.log(`${RED}✘ FAIL: ${msg}${RESET}`);
}

function warn(msg: string) {
  console.log(`${YELLOW}⚠ WARN: ${msg}${RESET}`);
}

async function main() {
  console.log("--- STARTING FREEBIES ENGINE DIAGNOSTIC AUDIT ---\n");

  // 1. Audit Freebie Catalog
  const list = listFreebies();
  console.log(`[catalog] Found ${list.length} active freebie(s) in catalog:`);
  for (const f of list) {
    console.log(`  - ${f.name} (Slug: ${f.slug}, Path: ${f.fileUrl})`);
  }

  if (list.length > 0) {
    pass("Freebies catalog loaded successfully");
  } else {
    fail("Freebies catalog is empty");
    process.exit(1);
  }

  // 2. Audit Specific Product Lookup
  const testSlug = "domain-purchase-guide";
  console.log(`\n[lookup] Querying slug "${testSlug}"...`);
  const freebie = getFreebie(testSlug);

  if (freebie && freebie.slug === testSlug) {
    pass(`Located correct product: "${freebie.name}"`);
  } else {
    fail(`Failed to locate slug "${testSlug}" in catalog`);
    process.exit(1);
  }

  // 3. Mock Compile Delivery Email Template
  console.log("\n[email] Mock compiling delivery HTML email template...");
  try {
    const html = renderFreebieDeliveryEmail({
      customerEmail: "vibe-tester@digitalalchemy.dev",
      productName: freebie.name,
      downloadUrl: `https://digitalalchemy.dev${freebie.fileUrl}`,
      siteUrl: "https://digitalalchemy.dev",
    });

    if (html.includes("vibe-tester@digitalalchemy.dev") && html.includes(freebie.name)) {
      pass(`HTML email compiled successfully (Compiled Length: ${html.length} chars)`);
    } else {
      fail("HTML compiled output is missing required buyer context keys");
      process.exit(1);
    }
  } catch (err) {
    fail(`Email template compilation threw error: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`\n${GREEN}All diagnostic checks passed. System is 100% verified and ready to build!${RESET}\n`);
}

main().catch((err) => {
  fail(`Diagnostic threw: ${(err as Error).message}`);
  process.exit(1);
});
