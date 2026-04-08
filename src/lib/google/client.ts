import "server-only";
import { google, type calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { requireGoogleOAuth, serverEnv } from "@/lib/env";
import {
  getStoredTokens,
  updateAccessToken,
  type StoredTokens,
} from "./tokens";

// Minimal scopes: read busy intervals, create/delete events we own.
// Not requesting full `calendar` scope — principle of least privilege.
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

export function getOAuth2Client(): OAuth2Client {
  const { clientId, clientSecret, redirectUri } = requireGoogleOAuth();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Build the Google consent screen URL.
 * `access_type: 'offline'` + `prompt: 'consent'` ensures we always get a
 * refresh token back on the first exchange, even if the user has granted
 * permission before.
 */
export function generateAuthUrl(state: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
}> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error(
      "Google OAuth exchange did not return a full token set. If you've connected before, revoke access at https://myaccount.google.com/permissions and try again to force a fresh refresh token.",
    );
  }
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date,
    scope: tokens.scope ?? GOOGLE_SCOPES.join(" "),
  };
}

/**
 * Returns a Calendar v3 client authed as the admin, with auto-refreshed
 * access token. Throws if no tokens stored or refresh fails — callers
 * should catch and soft-fail.
 */
export async function getAuthedCalendarClient(): Promise<{
  calendar: calendar_v3.Calendar;
  tokens: StoredTokens;
}> {
  const adminEmail = serverEnv().ADMIN_EMAIL;
  const stored = await getStoredTokens(adminEmail);
  if (!stored) {
    throw new Error("Google Calendar not connected for admin");
  }

  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expiry_date: new Date(stored.expiresAt).getTime(),
  });

  // Refresh proactively if the access token expires within 60s.
  const now = Date.now();
  const expiresMs = new Date(stored.expiresAt).getTime();
  if (expiresMs - now < 60_000) {
    const { credentials } = await oauth2.refreshAccessToken();
    if (credentials.access_token && credentials.expiry_date) {
      await updateAccessToken(
        adminEmail,
        credentials.access_token,
        new Date(credentials.expiry_date).toISOString(),
      );
      oauth2.setCredentials(credentials);
    }
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2 });
  return { calendar, tokens: stored };
}
