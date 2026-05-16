import { z } from "zod";

// Zod-validated environment variables. Per CLAUDE.md security rule #9.
//
// Supabase/Resend vars are OPTIONAL so the project builds before Desi has
// set up the external services. Code that needs them should call
// `requireServerEnv()` which throws if any are missing. Blog reads gracefully
// fall back to file-system MDX when Supabase is not configured.

/**
 * Treat blank `.env.local` lines (`KEY=`) as if the key were absent.
 * Used as the first arg to `z.preprocess()` on optional vars where a literal
 * empty string would otherwise trip `.min(N)` and tank the whole schema
 * parse — taking every server route that calls `serverEnv()` down with it.
 */
function emptyToUndef(v: unknown): unknown {
  return typeof v === "string" && v.trim() === "" ? undefined : v;
}

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
  // Telegram bot for booking alerts. Both vars optional — if unset, the
  // booking flow silently skips Telegram (logs `[telegram] skipping ...`).
  // Bot token is from @BotFather. Chat ID is your personal chat with the
  // bot — `scripts/telegram-setup.ts` will fetch it after you message the
  // bot once.
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),
  // PayPal — Phase 1 checkout (Bootcamp + Portfolio Building). All optional
  // so the project builds before sandbox creds are wired. Server code that
  // hits PayPal calls `requirePayPal()` which throws if any are missing.
  //   PAYPAL_ENV: 'sandbox' (default) for developer.paypal.com test creds,
  //               'live' once we cut over to the real DB Creations account.
  //   PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET: from your sandbox/live app at
  //               developer.paypal.com → Apps & Credentials.
  //   NEXT_PUBLIC_PAYPAL_CLIENT_ID: public mirror of CLIENT_ID — PayPal's
  //               JS SDK takes the client_id in the browser to render the
  //               Smart Buttons. PayPal docs confirm this is safe to expose;
  //               the SECRET stays server-side only.
  //   PAYPAL_WEBHOOK_ID: the webhook id PayPal hands back when you register
  //               a webhook URL in the dashboard. Required to verify event
  //               signatures via PayPal's `verify-webhook-signature` API.
  //   PAYPAL_WEBHOOK_PATH_TOKEN: random string Desi generates (e.g.
  //               `openssl rand -hex 32`) — included in the webhook URL path
  //               so it's unguessable in addition to PayPal's signature.
  // `emptyToUndef` coerces blank `.env.local` lines (e.g. `PAYPAL_WEBHOOK_ID=`)
  // into `undefined` before the inner schema runs. Without it, `.optional()`
  // doesn't help — `.min(N)` fires on the empty string and the whole parse
  // throws, taking down every route that calls `serverEnv()`.
  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  PAYPAL_CLIENT_SECRET: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  PAYPAL_WEBHOOK_ID: z.preprocess(emptyToUndef, z.string().min(1).optional()),
  PAYPAL_WEBHOOK_PATH_TOKEN: z.preprocess(emptyToUndef, z.string().min(16).optional()),
});

type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

function parseServerEnv(): ServerEnv {
  // In dev, bust the cache on every call so editing `.env.local` while
  // `npm run dev` is running picks up immediately. The module-level cache
  // is a hot-path optimization for prod where env is immutable. We hit
  // the "edit .env.local and nothing updates" footgun once already this
  // build; rather make dev slightly slower than have it keep biting.
  if (process.env.NODE_ENV === "development") cached = null;
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

/** True when all PayPal vars are set — safe to create/capture orders. */
export function isPayPalConfigured(): boolean {
  const env = parseServerEnv();
  return Boolean(
    env.PAYPAL_CLIENT_ID &&
      env.PAYPAL_CLIENT_SECRET &&
      env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  );
}

/**
 * Throws if any required PayPal var is missing. Call from server-side
 * payment routes (create-order, capture). The webhook ID + path token are
 * required separately by the webhook route via `requirePayPalWebhook()`.
 */
export function requirePayPal(): {
  clientId: string;
  clientSecret: string;
  publicClientId: string;
  environment: "sandbox" | "live";
} {
  const env = parseServerEnv();
  if (
    !env.PAYPAL_CLIENT_ID ||
    !env.PAYPAL_CLIENT_SECRET ||
    !env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  ) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env.local.",
    );
  }
  return {
    clientId: env.PAYPAL_CLIENT_ID,
    clientSecret: env.PAYPAL_CLIENT_SECRET,
    publicClientId: env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    environment: env.PAYPAL_ENV,
  };
}

/**
 * Throws if webhook vars are missing. Separate from `requirePayPal()` so
 * the create-order/capture routes can run even before the webhook is
 * registered (useful during early sandbox setup).
 */
export function requirePayPalWebhook(): {
  webhookId: string;
  pathToken: string;
} {
  const env = parseServerEnv();
  if (!env.PAYPAL_WEBHOOK_ID || !env.PAYPAL_WEBHOOK_PATH_TOKEN) {
    throw new Error(
      "PayPal webhook is not configured. Set PAYPAL_WEBHOOK_ID and PAYPAL_WEBHOOK_PATH_TOKEN in .env.local.",
    );
  }
  return {
    webhookId: env.PAYPAL_WEBHOOK_ID,
    pathToken: env.PAYPAL_WEBHOOK_PATH_TOKEN,
  };
}

/**
 * Timing-safe compare of the URL-supplied webhook path token against the
 * configured PAYPAL_WEBHOOK_PATH_TOKEN. Fail-closed if either side is
 * empty. Model: `verifyCronAuth` below.
 */
export function verifyPayPalPathToken(supplied: string | null): boolean {
  const env = parseServerEnv();
  const expected = env.PAYPAL_WEBHOOK_PATH_TOKEN;
  if (!expected) return false;
  if (!supplied) return false;
  if (supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < supplied.length; i++) {
    diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
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
