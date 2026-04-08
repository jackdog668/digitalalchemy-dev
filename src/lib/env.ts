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
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().default("desi@digitalalchemy.dev"),
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

export function requireResend(): { apiKey: string; fromEmail: string } {
  const env = parseServerEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY in .env.local.",
    );
  }
  return { apiKey: env.RESEND_API_KEY, fromEmail: env.RESEND_FROM_EMAIL };
}
