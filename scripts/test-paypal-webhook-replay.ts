// Sandbox webhook dedup verification.
//
// Run with:
//   npx tsx --env-file=.env.local scripts/test-paypal-webhook-replay.ts
//
// What it does:
//   1. POSTs a captured sandbox PAYMENT.CAPTURE.COMPLETED webhook payload
//      to /api/payments/webhook/{PAYPAL_WEBHOOK_PATH_TOKEN}.
//   2. POSTs the SAME payload a second time.
//   3. Asserts the first response is { ok: true } and the second is
//      { ok: true, dedup: "replay" }.
//   4. Optionally asserts payment_webhook_events has exactly one row for
//      that event_id (if Supabase service role creds are available).
//
// IMPORTANT: This script POSTS WITHOUT valid PayPal signature headers, so
// it WILL fail signature verification in production. To use it, EITHER:
//
//   (a) Run against a local dev server (`npm run dev`) where you've
//       commented out the signature verification block temporarily, OR
//   (b) Capture real sandbox webhook headers from PayPal's webhook
//       simulator (developer.paypal.com → Webhooks Simulator) and put
//       them in test-webhook-fixture.json next to this script.
//
// The fixture path is git-ignored on purpose — never commit real PayPal
// payloads, signatures, or event IDs.

import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function pass(msg: string) {
  console.log(`${GREEN}✓${RESET} ${msg}`);
}
function fail(msg: string) {
  console.log(`${RED}✗${RESET} ${msg}`);
}
function warn(msg: string) {
  console.log(`${YELLOW}⚠${RESET} ${msg}`);
}

interface Fixture {
  body: {
    id: string; // event id
    event_type: string;
    resource: { id: string; [k: string]: unknown };
    [k: string]: unknown;
  };
  /** Optional captured headers (PAYPAL-AUTH-ALGO etc.) for signature verification mode. */
  headers?: Record<string, string>;
}

async function loadFixture(): Promise<Fixture> {
  const fixturePath = path.join(
    process.cwd(),
    "scripts",
    "test-webhook-fixture.json",
  );
  try {
    const raw = await fs.readFile(fixturePath, "utf8");
    return JSON.parse(raw) as Fixture;
  } catch (err) {
    fail(`Could not load ${fixturePath}: ${(err as Error).message}`);
    console.log(
      `\n${YELLOW}Create scripts/test-webhook-fixture.json with shape:${RESET}`,
    );
    console.log(
      JSON.stringify(
        {
          body: {
            id: "WH-EVENT-ID-FROM-SANDBOX",
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource: {
              id: "CAPTURE-ID-FROM-SANDBOX",
              custom_id: "bootcamp",
              amount: { value: "147.00", currency_code: "USD" },
            },
          },
          headers: {
            "PAYPAL-AUTH-ALGO": "...",
            "PAYPAL-CERT-URL": "...",
            "PAYPAL-TRANSMISSION-ID": "...",
            "PAYPAL-TRANSMISSION-SIG": "...",
            "PAYPAL-TRANSMISSION-TIME": "...",
          },
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
}

async function main() {
  const baseUrl = process.env.WEBHOOK_TEST_BASE_URL ?? "http://localhost:3000";
  const pathToken = process.env.PAYPAL_WEBHOOK_PATH_TOKEN;
  if (!pathToken) {
    fail("PAYPAL_WEBHOOK_PATH_TOKEN not set in env");
    process.exit(1);
  }

  const fixture = await loadFixture();
  const url = `${baseUrl}/api/payments/webhook/${pathToken}`;
  console.log(`\nPOSTing to ${url}\n`);
  console.log(`Event ID: ${fixture.body.id}`);
  console.log(`Event Type: ${fixture.body.event_type}\n`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fixture.headers ?? {}),
  };

  // First POST — expect { ok: true }
  const r1 = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(fixture.body),
  });
  const j1 = (await r1.json()) as { ok?: boolean; dedup?: string; error?: string };
  console.log(`First POST  → ${r1.status} ${JSON.stringify(j1)}`);
  if (r1.status !== 200 || !j1.ok || j1.dedup === "replay") {
    fail("First POST should be a fresh 200 { ok: true } (no dedup)");
    if (j1.error) console.log(`  Server error: ${j1.error}`);
    process.exit(1);
  }
  pass("First POST recorded as fresh event");

  // Second POST — expect { ok: true, dedup: "replay" }
  const r2 = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(fixture.body),
  });
  const j2 = (await r2.json()) as { ok?: boolean; dedup?: string; error?: string };
  console.log(`Second POST → ${r2.status} ${JSON.stringify(j2)}`);
  if (r2.status !== 200 || j2.dedup !== "replay") {
    fail('Second POST should return { ok: true, dedup: "replay" }');
    if (j2.error) console.log(`  Server error: ${j2.error}`);
    process.exit(1);
  }
  pass("Second POST short-circuited via dedup ledger");

  // Optional DB-side verification
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supaUrl && supaKey) {
    const db = createClient(supaUrl, supaKey);
    const { data, error } = await db
      .from("payment_webhook_events")
      .select("id")
      .eq("paypal_event_id", fixture.body.id);
    if (error) {
      warn(`DB check skipped: ${error.message}`);
    } else if ((data?.length ?? 0) === 1) {
      pass(`Ledger has exactly 1 row for event_id (UNIQUE constraint held)`);
    } else {
      fail(`Expected 1 ledger row, got ${data?.length ?? 0}`);
      process.exit(1);
    }
  } else {
    warn("Skipping DB row count check (Supabase service role creds not set)");
  }

  console.log(`\n${GREEN}All checks passed.${RESET}\n`);
}

main().catch((err) => {
  fail(`Test threw: ${(err as Error).message}`);
  process.exit(1);
});
