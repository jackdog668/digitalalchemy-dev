// Remove specific scheduling_bookings rows (test data). Requires explicit
// targets so production rows are never wiped by accident.
//
// Does NOT delete Google Calendar events — if a row had sync, delete or
// decline the meeting in Calendar, or orphan events may remain.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/delete-test-scheduling-bookings.ts
//       → lists recent bookings (newest first) with ids
//
//   npx tsx --env-file=.env.local scripts/delete-test-scheduling-bookings.ts \
//       --emails=test@example.com,you+spam@gmail.com --execute
//       → deletes rows whose invitee_email matches (case-insensitive)
//
//   npx tsx --env-file=.env.local scripts/delete-test-scheduling-bookings.ts \
//       --ids=uuid1,uuid2 --execute
//       → deletes those booking ids

import { createClient } from "@supabase/supabase-js";

function parseCsvArg(flagPrefix: string, argv: string[]): string[] {
  const raw = argv.find((a) => a.startsWith(flagPrefix));
  if (!raw) return [];
  const body = raw.slice(flagPrefix.length);
  return body
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. --env-file=.env.local)",
    );
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const execute = argv.includes("--execute");
  const emails = parseCsvArg("--emails=", argv).map((e) => e.toLowerCase());
  const ids = parseCsvArg("--ids=", argv);

  const sb = createClient(url, key, { auth: { persistSession: false } });

  if (emails.length === 0 && ids.length === 0) {
    const { data, error } = await sb
      .from("scheduling_bookings")
      .select(
        "id,invitee_name,invitee_email,start_time,status,google_calendar_event_id,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log("\nRecent bookings (newest first). Use --emails= or --ids= with --execute to delete:\n");
    for (const b of data ?? []) {
      const gcal = b.google_calendar_event_id ? "gcal=yes" : "gcal=no";
      console.log(
        `${b.id}  |  ${(b.invitee_email || "").padEnd(36)}  |  ${(b.status || "").padEnd(10)}  |  ${gcal}  |  start ${String(b.start_time).slice(0, 16)}  |  ${b.invitee_name}`,
      );
    }
    console.log(
      `\nExample: ... --emails="${(data ?? [])[0]?.invitee_email ?? "your@test.com"}" --execute`,
    );
    return;
  }

  if (!execute) {
    console.error(
      "Dry run only: pass --execute to permanently delete matched rows.",
    );
    const base = sb.from("scheduling_bookings").select("id,invitee_email,start_time");
    const { data, error } =
      ids.length > 0
        ? await base.in("id", ids)
        : await base.in("invitee_email", emails);
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`Would delete ${data?.length ?? 0} row(s):`);
    for (const r of data ?? []) {
      console.log(`  ${r.id}  ${r.invitee_email}  ${r.start_time}`);
    }
    return;
  }

  const del =
    ids.length > 0
      ? sb.from("scheduling_bookings").delete().in("id", ids)
      : sb.from("scheduling_bookings").delete().in("invitee_email", emails);

  const { data: deletedRows, error } = await del.select(
    "id,invitee_email,start_time",
  );
  if (error) {
    console.error("Delete failed:", error);
    process.exit(1);
  }
  console.log(`Deleted ${deletedRows?.length ?? 0} row(s).`);
  for (const r of deletedRows ?? []) {
    console.log(`  ${r.id}  ${r.invitee_email}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
