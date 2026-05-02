import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  isResendConfigured,
  serverEnv,
} from "@/lib/env";
import { renderConfirmEmail } from "@/lib/email/templates/confirm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";

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

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "subscribe",
    identifier: ip,
    max: 5,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
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
    const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
    const confirmUrl = `${siteUrl}/api/subscribe/confirm?token=${confirmToken}`;

    await sendEmail({
      to: email,
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
