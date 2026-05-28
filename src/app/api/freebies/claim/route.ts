import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getFreebie } from "@/lib/freebies";
import { renderFreebieDeliveryEmail } from "@/lib/email/templates/freebie-delivery";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { serverEnv } from "@/lib/env";
import fs from "fs";
import path from "path";

const bodySchema = z
  .object({
    email: z.string().email().max(254),
    slug: z.string().min(1),
    websiteUrl: z.string().optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  // 1. Zod Body Validation
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input fields" }, { status: 400 });
  }

  const { email: rawEmail, slug, websiteUrl } = parsed.data;
  const email = rawEmail.toLowerCase().trim();

  // 2. Fetch Freebie Product Metadata
  const freebie = getFreebie(slug);
  if (!freebie) {
    return NextResponse.json({ error: "Freebie product not found" }, { status: 404 });
  }

  // 3. IP Rate Limiting (Prevent script spammers)
  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "freebie-claim",
    identifier: ip,
    max: 5,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  // 3.5 Honeypot Check (Silently drop spam bots)
  if (websiteUrl && websiteUrl.trim() !== "") {
    console.log(`[freebies] Spam bot honeypot triggered by email: ${email}`);
    const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
    const downloadUrl = `${siteUrl}${freebie.fileUrl}`;
    return NextResponse.json({ ok: true, downloadUrl });
  }

  // 4. Secure Database Log (Bypass RLS on Server)
  const db = createServiceRoleClient();
  const { error: insertErr } = await db
    .from("freebie_captures")
    .insert({
      email,
      freebie_slug: slug,
    });

  if (insertErr) {
    console.error("[freebies] database logging failed:", insertErr);
    return NextResponse.json({ error: "Logging lead failed" }, { status: 500 });
  }

  // 5. Build Delivery Assets
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;
  const downloadUrl = `${siteUrl}${freebie.fileUrl}`;

  // Read file from disk to attach directly to the email as a double safety net
  let fileAttachment: Array<{ filename: string; content: Buffer }> = [];
  try {
    const filePath = path.join(process.cwd(), "public", freebie.fileUrl);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const filename = freebie.fileUrl.split("/").pop() ?? `${freebie.slug}.html`;
      fileAttachment = [
        {
          filename,
          content: fileBuffer,
        },
      ];
    }
  } catch (err) {
    console.error("[freebies] failed to read guide file for attachment:", err);
  }

  // 6. Resend automated delivery (Fire-and-forget to avoid blocking the spinner)
  void sendEmail({
    to: email,
    subject: freebie.subject,
    html: renderFreebieDeliveryEmail({
      customerEmail: email,
      productName: freebie.name,
      downloadUrl: downloadUrl,
      siteUrl: siteUrl,
    }),
    attachments: fileAttachment,
  }).catch((err) => {
    console.error("[freebies] Resend automated delivery failed:", err);
  });

  // 7. Instant UI download payload
  return NextResponse.json({ ok: true, downloadUrl });
}
