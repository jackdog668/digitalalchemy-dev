import { z } from "zod";

// Zod-validated environment variables. Per CLAUDE.md security rule #9.
//
// Supabase/Resend vars are OPTIONAL so the project builds before Desi has
// set up the external services. Code that needs them should call
// `requireServerEnv()` which throws if any are missing. Blog reads gracefully
// fall back to file-system MDX when Supabase is not configured.

const serverSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://digitalalchemy.dev"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().default("desibaker54@gmail.com"),
  // Public mirror of ADMIN_EMAIL so the client-side login form can
  // pre-check the entered address. Middleware + server actions remain
  // the source of truth; this just gives a nicer UX. MUST match
  // ADMIN_EMAIL or login will silently reject valid admins.
  NEXT_PUBLIC_ADMIN_EMAIL: z
    .string()
    .email()
    .default("desibaker54@gmail.com"),
  // Comma-separated list of addresses that receive admin notification
  // emails (new bookings, cancellations, reminders failures). Defaults to
  // ADMIN_EMAIL if unset. Kept SEPARATE from ADMIN_EMAIL because that var
  // also gates admin login + Google OAuth identity, which must stay single.
  ADMIN_NOTIFICATION_EMAILS: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().default("desi@digitalalchemy.dev"),
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
  // Phase 4 — shared secret between Vercel Cron and /api/scheduling/reminders.
  // Vercel auto-injects it as `Authorization: Bearer <CRON_SECRET>` when set.
  CRON_SECRET: z.string().min(1).optional(),
  // PostHog analytics — public, client-safe. Both are optional; if unset
  // the PostHogProvider becomes a no-op and nothing is tracked. Sign up
  // at https://app.posthog.com and paste your project's API key.
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default("https://us.i.posthog.com"),
  // Upstash Redis — used by the unified rate limiter in lib/rate-limit.ts.
  // Optional: when unset, the limiter falls back to an in-process Map
  // (fine for local dev, useless on Vercel because each cold start clears
  // it). Set both in production. Free tier covers tens of thousands of
  // requests/day. https://console.upstash.com → Redis → REST API.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

function parseServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(`❌ Invalid environment variables:\n  ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function serverEnv(): ServerEnv {
  return parseServerEnv();
}

/** True when all Supabase vars are set — safe to read/write the DB. */
export function isSupabaseConfigured(): boolean {
  const env = parseServerEnv();
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** True when Resend is configured — safe to send emails. */
export function isResendConfigured(): boolean {
  return Boolean(parseServerEnv().RESEND_API_KEY);
}

/**
 * Throws if a required var is missing. Call from code paths that absolutely
 * need the DB or email (e.g. admin server actions, subscribe route).
 */
export function requireSupabase(): {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
} {
  const env = parseServerEnv();
  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Returns the list of addresses to CC on admin notification emails.
 * Falls back to [ADMIN_EMAIL] if ADMIN_NOTIFICATION_EMAILS is unset.
 * Comma-separated in the env var; whitespace is trimmed. De-duplicated
 * case-insensitively so adding ADMIN_EMAIL to the list is a no-op.
 */
export function getAdminNotificationEmails(): string[] {
  const env = parseServerEnv();
  const raw = env.ADMIN_NOTIFICATION_EMAILS?.trim();
  if (!raw) return [env.ADMIN_EMAIL];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (list.length === 0) return [env.ADMIN_EMAIL];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const addr of list) {
    const key = addr.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(addr);
    }
  }
  return out;
}

export function requireResend(): { apiKey: string; fromEmail: string } {
  const env = parseServerEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY in .env.local.",
    );
  }
  return { apiKey: env.RESEND_API_KEY, fromEmail: env.RESEND_FROM_EMAIL };
}

/** True when both Google OAuth env vars are set — safe to call Google APIs. */
export function isGoogleOAuthConfigured(): boolean {
  const env = parseServerEnv();
  return Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
}

export function requireGoogleOAuth(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const env = parseServerEnv();
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local.",
    );
  }
  return {
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: `${env.NEXT_PUBLIC_SITE_URL}/api/scheduling/google/callback`,
  };
}

/**
 * Constant-time comparison of a request's Authorization header against the
 * configured CRON_SECRET. Returns false if the secret is unset — fail-closed.
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically.
 */
export function verifyCronAuth(authHeader: string | null): boolean {
  const expected = parseServerEnv().CRON_SECRET;
  if (!expected) return false;
  if (!authHeader) return false;
  const expectedHeader = `Bearer ${expected}`;
  if (authHeader.length !== expectedHeader.length) return false;
  // Timing-safe equality
  let diff = 0;
  for (let i = 0; i < authHeader.length; i++) {
    diff |= authHeader.charCodeAt(i) ^ expectedHeader.charCodeAt(i);
  }
  return diff === 0;
}
