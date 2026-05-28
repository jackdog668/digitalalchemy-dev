import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServiceRoleClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { listFreebies, getFreebie } from "@/lib/freebies";
import { renderBroadcastEmail, interpolateMergeTags } from "@/lib/email/templates/broadcast-wrapper";
import { sendEmail } from "@/lib/email/send";
import { serverEnv } from "@/lib/env";

const requestSchema = z
  .object({
    subject: z.string().min(1).max(200),
    bodyHtml: z.string().min(1).max(50000),
    testEmail: z.string().email().max(254).optional().nullable(),
    freebieSlug: z.string().optional().nullable(),
  })
  .strict();

export async function POST(req: NextRequest) {
  // 1. Double check authentication (Middleware gates this path, but safety first)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // 2. Validate input fields
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
  }

  const { subject, bodyHtml, testEmail, freebieSlug } = parsed.data;
  const siteUrl = serverEnv().NEXT_PUBLIC_SITE_URL;

  // Find targeted freebie download URL
  const catalog = listFreebies();
  const targetProduct = freebieSlug ? getFreebie(freebieSlug) : catalog[0];
  const downloadUrl = `${siteUrl}${targetProduct?.fileUrl ?? "/portfolio"}`;

  // ── Case A: Dispatch a single Test Preview ──
  if (testEmail) {
    try {
      console.log(`[broadcast] Sending test email preview to ${testEmail}`);
      const compiledHtml = renderBroadcastEmail({
        content: bodyHtml,
        subject,
        customerEmail: testEmail,
        downloadUrl,
        siteUrl,
      });

      const personalizedSubject = interpolateMergeTags(subject, {
        customerEmail: testEmail,
        downloadUrl,
        siteUrl,
      });

      await sendEmail({
        to: testEmail,
        subject: personalizedSubject,
        html: compiledHtml,
      });

      return NextResponse.json({ ok: true, isTest: true, sentCount: 1 });
    } catch (err) {
      console.error("[broadcast] Test email failed to send:", err);
      return NextResponse.json({ error: `Test email failed: ${(err as Error).message}` }, { status: 500 });
    }
  }

  // ── Case B: Dispatch Bulk Campaign Blast ──
  const db = createServiceRoleClient();
  
  // Fetch captures
  let query = db.from("freebie_captures").select("email, freebie_slug");
  if (freebieSlug && freebieSlug !== "all") {
    query = query.eq("freebie_slug", freebieSlug);
  }

  const { data: rawLeads, error: leadsError } = await query;
  if (leadsError) {
    console.error("[broadcast] failed to fetch recipients:", leadsError);
    return NextResponse.json({ error: "Failed to load database recipients" }, { status: 500 });
  }

  if (!rawLeads || rawLeads.length === 0) {
    return NextResponse.json({ ok: true, sentCount: 0, message: "No subscribers matching search filter" });
  }

  // Deduplicate emails to ensure we never double-blast anyone
  const recipientsMap = new Map<string, string>();
  for (const lead of rawLeads) {
    const email = lead.email.toLowerCase().trim();
    // Default to the claimed resource slug or fall back
    recipientsMap.set(email, lead.freebie_slug);
  }

  console.log(`[broadcast] Deduped audience from ${rawLeads.length} records down to ${recipientsMap.size} unique emails`);

  const results = {
    total: recipientsMap.size,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Dispatch campaign in parallel chunks
  const dispatchPromises = Array.from(recipientsMap.entries()).map(async ([email, slug]) => {
    try {
      const product = getFreebie(slug) ?? targetProduct;
      const personalizedDownloadUrl = `${siteUrl}${product?.fileUrl ?? "/portfolio"}`;

      const compiledHtml = renderBroadcastEmail({
        content: bodyHtml,
        subject,
        customerEmail: email,
        downloadUrl: personalizedDownloadUrl,
        siteUrl,
      });

      const personalizedSubject = interpolateMergeTags(subject, {
        customerEmail: email,
        downloadUrl: personalizedDownloadUrl,
        siteUrl,
      });

      await sendEmail({
        to: email,
        subject: personalizedSubject,
        html: compiledHtml,
      });

      results.success++;
    } catch (err) {
      console.error(`[broadcast] dispatch failed for ${email}:`, err);
      results.failed++;
      results.errors.push(`${email}: ${(err as Error).message}`);
    }
  });

  await Promise.all(dispatchPromises);

  return NextResponse.json({
    ok: true,
    isTest: false,
    sentCount: results.success,
    failedCount: results.failed,
    errors: results.errors.slice(0, 10), // Limit error log returned to UI
  });
}
