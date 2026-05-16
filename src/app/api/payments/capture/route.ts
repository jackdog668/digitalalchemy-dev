import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isPayPalConfigured, isSupabaseConfigured } from "@/lib/env";
import {
  captureOrder,
  customIdFromCapture,
  firstCapture,
  getProduct,
} from "@/lib/paypal";
import {
  notifyCapturedOrder,
  notifySecurityEvent,
  recordCapturedOrder,
} from "@/lib/payments";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/payments/capture
// Body: { order_id: string }   // PayPal order ID returned from create-order
// Returns: { ok: true, productSlug: string, orderId: string }
//
// Flow:
//   1. Capture the PayPal order (move the money)
//   2. Look up the product from the custom_id we tagged on creation —
//      do NOT trust any product info from the client.
//   3. Verify the captured amount matches the server-side allowlist price
//      (paranoia: catches any tampering between create and capture).
//   4. Record the order row (idempotent on capture_id).
//   5. Send buyer receipt + admin email + Telegram alert (soft-fail).
//
// The webhook is the backstop — if anything in steps 4–5 fails after
// money moved, the PAYMENT.CAPTURE.COMPLETED event will retry the record
// + notify path independently.

const bodySchema = z
  .object({
    order_id: z.string().min(1).max(128).regex(/^[A-Z0-9]+$/),
  })
  .strict();

export async function POST(req: NextRequest) {
  if (!isPayPalConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Payments not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "payments:capture",
    identifier: ip,
    max: 5,
    windowMs: 60 * 60 * 1000,
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
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const captureResult = await captureOrder(parsed.data.order_id);

    const slug = customIdFromCapture(captureResult);
    if (!slug) {
      void notifySecurityEvent({
        kind: "missing-custom-id",
        detail: "capture response had no custom_id — refusing to record order",
        context: { captureResponseId: captureResult.id },
      });
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }
    const product = getProduct(slug);
    if (!product) {
      void notifySecurityEvent({
        kind: "unknown-slug",
        detail: `capture for unknown product slug "${slug}" — refusing to record`,
        context: { slug, captureResponseId: captureResult.id },
      });
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }

    const capture = firstCapture(captureResult);
    if (!capture) {
      console.error("[payments] capture response missing capture object");
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }

    // Server-side amount verification — if PayPal echoes back a different
    // amount than our allowlist, something is very wrong. Refuse to record.
    //
    // We compare integer cents (not .toFixed(2) strings). Float compare on
    // money values is dangerous in general; even .toFixed(2) banker's-rounds
    // a hypothetical "10.005" to "10.00" and silently masks a half-cent
    // mismatch. parseFloat → round → integer compare is the textbook pattern.
    const expectedCents = product.amountCents;
    const gotCents = Math.round(
      Number.parseFloat(capture.amount.value) * 100,
    );
    if (expectedCents !== gotCents) {
      void notifySecurityEvent({
        kind: "amount-mismatch",
        detail: `capture amount mismatch — refusing to record`,
        context: {
          slug,
          expectedCents,
          gotCents,
          rawValue: capture.amount.value,
          captureId: capture.id,
        },
      });
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }

    const payer = captureResult.payer ?? {};
    const fullName = [payer.name?.given_name, payer.name?.surname]
      .filter(Boolean)
      .join(" ")
      .trim();

    const recorded = await recordCapturedOrder({
      product,
      paypalOrderId: captureResult.id,
      paypalCaptureId: capture.id,
      paypalPayerId: payer.payer_id ?? null,
      customerEmail: payer.email_address ?? "(unknown)",
      customerName: fullName || null,
      amountCents: product.amountCents,
      currency: product.currency,
      metadata: { capture: captureResult as unknown as Record<string, unknown> },
    });

    if (recorded.isNew) {
      // Soft-fail notification: order is already in the DB.
      notifyCapturedOrder(recorded).catch((err) => {
        console.error("[payments] notifyCapturedOrder threw:", err);
      });
    } else {
      console.log(
        `[payments] capture ${capture.id} already recorded — skipping notify`,
      );
    }

    return NextResponse.json({
      ok: true,
      productSlug: product.slug,
      orderId: recorded.id,
    });
  } catch (err) {
    console.error("[payments] capture failed:", err);
    return NextResponse.json(
      { error: "Payment failed. Please try again or contact support." },
      { status: 500 },
    );
  }
}
