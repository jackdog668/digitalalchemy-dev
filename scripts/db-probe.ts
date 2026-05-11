// Directly inspect what tables exist in the Supabase project.
// Works around PostgREST schema cache issues by querying pg_catalog.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // Try direct queries on each expected table
  const expected = [
    "posts",
    "subscribers",
    "scheduling_event_types",
    "scheduling_bookings",
    "scheduling_availability_rules",
    "scheduling_google_oauth_tokens",
  ];
  console.log(`Supabase: ${url}\n`);
  for (const t of expected) {
    const { error, count } = await sb
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`✗ ${t.padEnd(25)} — ${error.message}`);
    } else {
      console.log(`✓ ${t.padEnd(25)} — ${count ?? 0} rows`);
    }
  }

  // If event_types is reachable, enumerate them
  const { data: ev } = await sb
    .from("scheduling_event_types")
    .select("slug,title,status,duration_minutes,price_cents")
    .order("created_at");
  if (ev) {
    console.log("\nEvent types:");
    for (const e of ev) console.log(`  /book/${e.slug}  [${e.status}]  ${e.title}  (${e.duration_minutes}min, ${e.price_cents}¢)`);
  }
}

main();
