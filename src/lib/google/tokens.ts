import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Thin wrapper over the scheduling_google_oauth_tokens table.
// All reads/writes go through service_role — RLS is deny-all.

export interface StoredTokens {
  id: string;
  adminEmail: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO
  scope: string;
  calendarId: string;
}

interface TokenRow {
  id: string;
  admin_email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
  calendar_id: string | null;
}

function rowToTokens(row: TokenRow): StoredTokens {
  return {
    id: row.id,
    adminEmail: row.admin_email,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scope: row.scope,
    calendarId: row.calendar_id ?? "primary",
  };
}

export async function getStoredTokens(
  adminEmail: string,
): Promise<StoredTokens | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("scheduling_google_oauth_tokens")
    .select("*")
    .eq("admin_email", adminEmail.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return rowToTokens(data);
}

export async function saveTokens(params: {
  adminEmail: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
  calendarId?: string;
}): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db.from("scheduling_google_oauth_tokens").upsert(
    {
      admin_email: params.adminEmail.toLowerCase(),
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
      expires_at: params.expiresAt,
      scope: params.scope,
      calendar_id: params.calendarId ?? "primary",
    },
    { onConflict: "admin_email" },
  );
  if (error) throw new Error(`saveTokens: ${error.message}`);
}

/**
 * After a successful access-token refresh, persist only the new access token
 * and expiry. Refresh token stays the same unless Google rotates it (rare).
 */
export async function updateAccessToken(
  adminEmail: string,
  accessToken: string,
  expiresAt: string,
): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("scheduling_google_oauth_tokens")
    .update({
      access_token: accessToken,
      expires_at: expiresAt,
    })
    .eq("admin_email", adminEmail.toLowerCase());
  if (error) throw new Error(`updateAccessToken: ${error.message}`);
}

export async function deleteTokens(adminEmail: string): Promise<void> {
  const db = createServiceRoleClient();
  const { error } = await db
    .from("scheduling_google_oauth_tokens")
    .delete()
    .eq("admin_email", adminEmail.toLowerCase());
  if (error) throw new Error(`deleteTokens: ${error.message}`);
}

export async function isConnected(adminEmail: string): Promise<boolean> {
  const tokens = await getStoredTokens(adminEmail);
  return tokens !== null;
}
