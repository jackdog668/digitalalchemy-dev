import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  isResendConfigured,
  requireResend,
  serverEnv,
} from "@/lib/env";
import { renderConfirmEmail } from "@/lib/email/templates/confirm";
import { SITE } from "@/lib/constants";

// Very simple in-memory rate limiter. 5 requests per minute per IP.
// Sufficient for a small blog; swap for @upstash/ratelimit when you scale.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 5;
const bucket = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || entry.resetAt < now) {
    bucket.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  if (entry.count >= RL_MAX) return false;
  entry.count += 1;
  return true;
}

const bodySchema = z
  .object({
    email: z.string().email().max(254),
  })
  .strict();

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !isResendConfigured()) {
    return NextResponse.json(
      { error: "Newsletter not configured" },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const confirmToken = crypto.randomBytes(32).toString("hex");

  const db = createServiceRoleClient();
  const { error: upsertErr } = await db
    .from("subscribers")
    .upsert(
      {
        email,
        confirmed: false,
        confirm_token: confirmToken,
      },
      { onConflict: "email" },
    );

  if (upsertErr) {
    console.error("Subscribe upsert error:", upsertErr);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }

  // Send confirmation email
  try {
    const { apiKey, fromEmail } = requireResend();
    const resend = new Resend(apiKey);
    const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
    const confirmUrl = `${siteUrl}/api/subscribe/confirm?token=${confirmToken}`;

    await resend.emails.send({
      from: `${SITE.name} <${fromEmail}>`,
      to: [email],
      subject: "Confirm your Digital Alchemy subscription",
      html: renderConfirmEmail({ confirmUrl }),
    });
  } catch (err) {
    console.error("Confirm email send failed:", err);
    // Row is saved; user can be re-sent later. Return success so we don't
    // leak the failure to clients.
  }

  return NextResponse.json({ ok: true });
}
