import { NextResponse, type NextRequest } from "next/server";
import {
  isPayPalConfigured,
  isSupabaseConfigured,
  requirePayPalWebhook,
  verifyPayPalPathToken,
} from "@/lib/env";
import {
  customIdFromCapture,
  getProduct,
  verifyWebhookSignature,
  type PayPalCaptureResult,
} from "@/lib/paypal";
import {
  markOrderRefunded,
  notifyCapturedOrder,
  notifySecurityEvent,
  recordCapturedOrder,
  recordWebhookEvent,
  recordWebhookHandlerError,
} from "@/lib/payments";

// POST /api/payments/webhook/[token]
//
// Two-layer auth:
//   1. URL path token must match PAYPAL_WEBHOOK_PATH_TOKEN (timing-safe).
//      Defense in depth on top of #2, in case PayPal certs were ever leaked.
//   2. PayPal signature verification via /v1/notifications/verify-webhook-signature.
//
// Then we dedup on the PayPal event id (PayPal can replay events) and
// dispatch on event_type. Only PAYMENT.CAPTURE.COMPLETED and
// PAYMENT.CAPTURE.REFUNDED are wired in Phase 1; everything else is
// logged + accepted (return 200 so PayPal stops retrying).

interface CaptureCompletedResource {
  id: string;
  status: string;
  amount: { currency_code: string; value: string };
  supplementary_data?: {
    related_ids?: { order_id?: string };
  };
  payer?: PayPalCaptureResult["payer"];
  custom_id?: string;
}

interface CaptureRefundedResource {
  id: string; // refund id
  status: string;
  amount: { currency_code: string; value: string };
  links?: Array<{ rel: string; href: string }>;
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: Record<string, unknown>;
  create_time?: string;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  // Layer 1: URL path token
  const { token } = await ctx.params;
  if (!verifyPayPalPathToken(token)) {
    // Pretend the route doesn't exist — don't leak that this is a real path.
    return new NextResponse("Not found", { status: 404 });
  }

  if (!isPayPalConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Payments not configured" },
      { status: 503 },
    );
  }

  let webhookId: string;
  try {
    ({ webhookId } = requirePayPalWebhook());
  } catch {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  let body: PayPalWebhookEvent;
  try {
    body = (await req.json()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Layer 2: PayPal signature verification — uses PayPal's own API to
  // validate the cert chain + signature against our webhook_id.
  const verified = await verifyWebhookSignature({
    headers: req.headers,
    webhookId,
    eventBody: body,
  });
  if (!verified) {
    void notifySecurityEvent({
      kind: "webhook-signature-invalid",
      detail: "PayPal webhook signature verification FAILED — request rejected",
      context: { eventId: body?.id, eventType: body?.event_type },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Dedup on PayPal's event id. Replays return 200 OK without re-processing.
  let firstTime: boolean;
  try {
    firstTime = await recordWebhookEvent({
      eventId: body.id,
      eventType: body.event_type,
      resourceId:
        (body.resource as { id?: string })?.id ?? null,
      payload: body,
    });
  } catch (err) {
    console.error("[paypal] webhook ledger insert failed:", err);
    // Don't 5xx — PayPal will retry forever. Better to swallow + log.
    return NextResponse.json({ ok: true, dedup: "error" });
  }
  if (!firstTime) {
    return NextResponse.json({ ok: true, dedup: "replay" });
  }

  try {
    switch (body.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handleCaptureCompleted(body);
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
        await handleCaptureRefunded(body);
        break;
      default:
        console.log(`[paypal] webhook ignored: ${body.event_type}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[paypal] webhook handler failed for ${body.event_type}:`,
      err,
    );
    void notifySecurityEvent({
      kind: "webhook-handler-exception",
      detail: `webhook handler threw for ${body.event_type}: ${msg}`,
      context: { eventId: body.id, eventType: body.event_type },
    });
    // Stamp the ledger row so a deterministic handler bug is visible in
    // Supabase (handler_error_count > 0) instead of only living in logs.
    await recordWebhookHandlerError(body.id, msg);
    // Return 200 anyway — we've logged the event, retrying won't help if
    // the handler bug is deterministic. We'll fix forward via the ledger.
  }

  return NextResponse.json({ ok: true });
}

async function handleCaptureCompleted(event: PayPalWebhookEvent): Promise<void> {
  const resource = event.resource as unknown as CaptureCompletedResource;
  const slug = resource.custom_id ?? null;
  if (!slug) {
    void notifySecurityEvent({
      kind: "missing-custom-id",
      detail: `webhook capture event has no custom_id — cannot map to product`,
      context: { eventId: event.id, captureId: resource.id },
    });
    return;
  }
  const product = getProduct(slug);
  if (!product) {
    void notifySecurityEvent({
      kind: "unknown-slug",
      detail: `webhook capture event for unknown product slug "${slug}"`,
      context: { slug, eventId: event.id, captureId: resource.id },
    });
    return;
  }

  // Amount sanity check against the allowlist. Integer cents compare —
  // matches the capture-route pattern; never trust string .toFixed(2) for money.
  const expectedCents = product.amountCents;
  const gotCents = Math.round(Number.parseFloat(resource.amount.value) * 100);
  if (expectedCents !== gotCents) {
    void notifySecurityEvent({
      kind: "amount-mismatch",
      detail: `webhook amount mismatch — refusing to record`,
      context: {
        slug,
        expectedCents,
        gotCents,
        rawValue: resource.amount.value,
        eventId: event.id,
        captureId: resource.id,
      },
    });
    return;
  }

  const payer = resource.payer ?? {};
  const fullName = [payer.name?.given_name, payer.name?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const recorded = await recordCapturedOrder({
    product,
    paypalOrderId:
      resource.supplementary_data?.related_ids?.order_id ?? resource.id,
    paypalCaptureId: resource.id,
    paypalPayerId: payer.payer_id ?? null,
    customerEmail: payer.email_address ?? "(unknown)",
    customerName: fullName || null,
    amountCents: product.amountCents,
    currency: product.currency,
    metadata: { webhook_event_id: event.id, capture: resource as unknown as Record<string, unknown> },
  });

  if (recorded.isNew) {
    notifyCapturedOrder(recorded).catch((err) => {
      console.error("[payments] webhook notify threw:", err);
    });
  }
}

async function handleCaptureRefunded(event: PayPalWebhookEvent): Promise<void> {
  const resource = event.resource as unknown as CaptureRefundedResource;
  // The refund resource references the original capture via the `links`
  // collection (rel: "up"). Parse the capture_id out of the URL.
  const upLink = resource.links?.find((l) => l.rel === "up")?.href ?? "";
  const m = upLink.match(/\/captures\/([A-Z0-9]+)/);
  const captureId = m?.[1];
  if (!captureId) {
    console.error(`[paypal] refund event ${resource.id} has no up link`);
    return;
  }
  const updated = await markOrderRefunded(captureId, {
    refund_id: resource.id,
    amount: resource.amount,
    webhook_event_id: event.id,
  });
  if (!updated) {
    console.warn(
      `[paypal] refund for capture ${captureId} matched no order row`,
    );
  }
}
