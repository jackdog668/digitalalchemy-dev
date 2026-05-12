// One-off diagnostic: inspect the Google OAuth token row for the admin.
// Shows whether tokens exist, when they were last refreshed, and whether
// the access token is currently expired. Also tries a live refresh so we
// know if the refresh_token has been revoked.
//
//   npx tsx --env-file=.env.local scripts/google-token-probe.ts

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = (process.env.ADMIN_EMAIL ?? "desibaker54@gmail.com").toLowerCase();
const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

async function main() {
  console.log("─".repeat(60));
  console.log("Google OAuth Token Probe");
  console.log("─".repeat(60));
  console.log(`Supabase: ${url}`);
  console.log(`Admin:    ${adminEmail}`);
  console.log(`Client:   ${clientId ? clientId.slice(0, 20) + "..." : "MISSING"}`);
  console.log(`Secret:   ${clientSecret ? "set" : "MISSING"}`);
  console.log("");

  if (!clientId || !clientSecret) {
    console.log("✗ GOOGLE_OAUTH_CLIENT_ID/SECRET missing in env.");
    console.log("  Code path silently skips event creation when these are unset.");
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("scheduling_google_oauth_tokens")
    .select("*")
    .eq("admin_email", adminEmail)
    .maybeSingle();

  if (error) {
    console.log(`✗ Query failed: ${error.message}`);
    process.exit(1);
  }
  if (!data) {
    console.log("✗ NO TOKEN ROW for this admin email in production Supabase.");
    console.log("  → Go to /admin/scheduling and click 'Connect Google Calendar'.");
    process.exit(1);
  }

  const now = Date.now();
  const expiresAt = new Date(data.expires_at).getTime();
  const expiredMin = Math.round((now - expiresAt) / 60_000);
  console.log("✓ Token row found.");
  console.log(`  created:        ${data.created_at}`);
  console.log(`  scope:          ${data.scope}`);
  console.log(`  calendar_id:    ${data.calendar_id ?? "primary"}`);
  console.log(`  access expires: ${data.expires_at}`);
  console.log(`  state:          ${now > expiresAt ? `EXPIRED ${expiredMin}min ago` : `valid for ${-expiredMin}min`}`);
  console.log(`  refresh token:  ${data.refresh_token ? "present" : "MISSING"}`);
  console.log("");

  // Try a live refresh
  console.log("Attempting live refresh against Google...");
  const oauth = new google.auth.OAuth2(clientId, clientSecret);
  oauth.setCredentials({
    refresh_token: data.refresh_token,
  });

  try {
    const { credentials } = await oauth.refreshAccessToken();
    console.log("✓ Refresh succeeded.");
    console.log(`  new access token: ${credentials.access_token?.slice(0, 20)}...`);
    console.log(`  expires in:       ${credentials.expiry_date ? Math.round((credentials.expiry_date - now) / 60_000) + "min" : "?"}`);
    console.log("");

    // Try listing calendars as a sanity check
    oauth.setCredentials(credentials);
    const cal = google.calendar({ version: "v3", auth: oauth });
    const list = await cal.calendarList.list({ maxResults: 5 });
    console.log("✓ Calendar list reachable:");
    for (const c of list.data.items ?? []) {
      console.log(`  - ${c.id}  ${c.summary}${c.primary ? "  (primary)" : ""}`);
    }
  } catch (err) {
    console.log(`✗ Refresh FAILED: ${(err as Error).message}`);
    console.log("  → Refresh token has been revoked (user removed app, password changed, or 6+ months unused).");
    console.log("  → Fix: go to /admin/scheduling, Disconnect, then Connect again.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
