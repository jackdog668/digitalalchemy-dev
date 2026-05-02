// Audit recent bookings — shows email addresses so we can see who probably
// never got a confirmation (because Resend is in test mode).

import { createClient } from "@supabase/supabase-js";

async function main() {
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const { data, error } = await sb
  .from("scheduling_bookings")
  .select("invitee_name,invitee_email,start_time,status,google_calendar_event_id,created_at")
  .order("created_at", { ascending: false })
  .limit(20);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`\nBookings (newest first):\n`);
console.log("created              | invitee email                 | start                 | status     | google?");
console.log("-".repeat(120));
for (const b of data ?? []) {
  console.log(
    `${b.created_at?.slice(0, 19)}  | ${(b.invitee_email || "").padEnd(28)}  | ${b.start_time?.slice(0, 19)}  | ${(b.status || "").padEnd(10)} | ${b.google_calendar_event_id ? "yes" : "no"}`,
  );
}

const ownerEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
const external = (data ?? []).filter(
  (b) => b.invitee_email && b.invitee_email.toLowerCase() !== ownerEmail,
);
console.log(`\nTotal: ${data?.length ?? 0}  |  External (non-admin) invitees: ${external.length}`);
if (external.length > 0) {
  console.log(`\n⚠ These ${external.length} invitee(s) likely NEVER got a confirmation email`);
  console.log(`  because RESEND_FROM_EMAIL=onboarding@resend.dev only delivers to the`);
  console.log(`  Resend account owner's verified email.`);
}
}
main();
