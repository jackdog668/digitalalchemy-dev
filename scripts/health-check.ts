// Health check: verifies the critical infra powering the booking flow
// WITHOUT creating real bookings. Run with:
//   npx tsx --env-file=.env.local scripts/health-check.ts
//
// Checks:
//   1. Env vars are all present
//   2. Resend API key is valid + sends a real test email to ADMIN_EMAIL
//   3. Supabase service_role connects + scheduling_event_types table is reachable
//   4. Google OAuth creds present (can't verify token without user action)

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
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
function info(msg: string) {
  console.log(`${CYAN}ℹ${RESET} ${msg}`);
}

let fatalCount = 0;

async function checkEnv() {
  console.log(`\n${CYAN}━━ ENV VARS ━━${RESET}`);
  const required = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "ADMIN_EMAIL",
  ] as const;
  const optional = [
    "ADMIN_NOTIFICATION_EMAILS",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "CRON_SECRET",
  ] as const;
  for (const k of required) {
    if (process.env[k]) pass(`${k} set`);
    else {
      fail(`${k} MISSING (required)`);
      fatalCount++;
    }
  }
  for (const k of optional) {
    if (process.env[k]) pass(`${k} set`);
    else warn(`${k} unset (optional)`);
  }
}

async function checkResend() {
  console.log(`\n${CYAN}━━ RESEND (email) ━━${RESET}`);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !from || !to) {
    fail("Missing Resend env vars — skip");
    fatalCount++;
    return;
  }
  info(`Sending probe: from=${from}  to=${to}`);
  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from: `Digital Alchemy Health Check <${from}>`,
      to: [to],
      subject: `🟢 Health check — ${new Date().toLocaleString()}`,
      html: `<p>This is a probe from <code>scripts/health-check.ts</code>.</p>
             <p>If you got this, Resend delivery is working. Booking confirmations will go out.</p>
             <p style="color:#666;font-size:12px">Sent at ${new Date().toISOString()}</p>`,
    });
    if (result.error) {
      fail(`Resend API error: ${result.error.name}: ${result.error.message}`);
      fatalCount++;
      return;
    }
    if (result.data?.id) {
      pass(`Email queued — Resend message id: ${result.data.id}`);
      info(`Check inbox at ${to}. Also check Resend dashboard → Logs.`);
    } else {
      warn("Resend returned no id and no error — unexpected");
    }
  } catch (err) {
    fail(`Resend exception: ${err instanceof Error ? err.message : String(err)}`);
    fatalCount++;
  }
}

async function checkSupabase() {
  console.log(`\n${CYAN}━━ SUPABASE ━━${RESET}`);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    fail("Missing Supabase env vars — skip");
    fatalCount++;
    return;
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  // Check scheduling_event_types table
  const { data: events, error: evErr } = await sb
    .from("scheduling_event_types")
    .select("id,slug,title,status")
    .order("created_at", { ascending: true });
  if (evErr) {
    fail(`scheduling_event_types query failed: ${evErr.message}`);
    fatalCount++;
  } else {
    pass(`scheduling_event_types table reachable — ${events?.length ?? 0} rows`);
    const active = events?.filter((e) => e.status === "active") ?? [];
    if (active.length === 0) {
      warn("No ACTIVE event types. Bookings will 404. Activate one in /admin/scheduling.");
    } else {
      for (const e of active) {
        info(`  active: /book/${e.slug}  (${e.title})`);
      }
    }
  }

  // Check bookings table exists
  const { error: bkErr, count } = await sb
    .from("scheduling_bookings")
    .select("id", { count: "exact", head: true });
  if (bkErr) {
    fail(`bookings query failed: ${bkErr.message}`);
    fatalCount++;
  } else {
    pass(`bookings table reachable — ${count ?? 0} rows total`);
  }

  // Recent bookings (sanity check for past flows)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: rErr } = await sb
    .from("scheduling_bookings")
    .select("id,invitee_email,start_time,created_at,status")
    .gte("created_at", oneWeekAgo)
    .order("created_at", { ascending: false })
    .limit(5);
  if (rErr) {
    warn(`recent bookings query failed: ${rErr.message}`);
  } else if (recent && recent.length > 0) {
    info(`${recent.length} booking(s) in last 7 days:`);
    for (const b of recent) {
      console.log(
        `    ${DIM}${b.created_at?.slice(0, 19)}  ${b.invitee_email}  status=${b.status}${RESET}`,
      );
    }
  } else {
    info("No bookings in last 7 days");
  }
}

async function checkGoogle() {
  console.log(`\n${CYAN}━━ GOOGLE CALENDAR (optional) ━━${RESET}`);
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    warn("Google OAuth not configured — Meet links will be missing");
    return;
  }
  pass("Google OAuth client creds present");
  // Can't verify token without user action — report that connection status lives in admin UI
  info("Connect/disconnect status is in /admin/scheduling → GoogleCalendarCard");
}

async function main() {
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${CYAN}  Digital Alchemy — Booking Flow Health Check${RESET}`);
  console.log(`${CYAN}  ${new Date().toISOString()}${RESET}`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);

  await checkEnv();
  if (fatalCount > 0) {
    console.log(`\n${RED}Abort: missing required env vars — fix .env.local and re-run.${RESET}`);
    process.exit(1);
  }
  await checkResend();
  await checkSupabase();
  await checkGoogle();

  console.log(`\n${CYAN}━━ SUMMARY ━━${RESET}`);
  if (fatalCount === 0) {
    console.log(`${GREEN}✓ All critical checks passed.${RESET}`);
    console.log(`  → Check your inbox for the probe email.`);
    console.log(`  → If it doesn't arrive within 60s, check the Resend dashboard Logs tab.`);
  } else {
    console.log(`${RED}✗ ${fatalCount} fatal issue(s). Fix and re-run.${RESET}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`${RED}Unexpected error:${RESET}`, err);
  process.exit(1);
});
