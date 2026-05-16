import "server-only";

import * as Sentry from "@sentry/nextjs";

// Payment side-effects: record orders in Supabase, send the buyer a
// receipt, ping admin (email + Telegram). Mirrors the structure of
// `lib/scheduling-emails.ts` + `lib/scheduling-telegram.ts` so we stay
// consistent with the existing booking flow.
//
// All functions soft-fail on notification errors — once the row is in
// the database the sale is real. A Resend or Telegram outage must not
// retroactively un-charge the buyer.

import { Resend } from "resend";
import {
  requireResend,
  serverEnv,
  getAdminNotificationEmails,
  isResendConfigured,
} from "@/lib/env";
import { SITE } from "@/lib/constants";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  sendTelegramAlert,
  escapeHtml,
  escapeHtmlAttr,
  isTelegramConfigured,
} from "@/lib/telegram";
import {
  renderPaymentReceiptEmail,
  renderPaymentAdminNotificationEmail,
} from "@/lib/email/templates/payment-receipt";
import type { PaymentProduct } from "@/lib/paypal";

export interface RecordOrderInput {
  product: PaymentProduct;
  paypalOrderId: string;
  paypalCaptureId: string;
  paypalPayerId: string | null;
  customerEmail: string;
  customerName: string | null;
  amountCents: number;
  currency: string;
  metadata: Record<string, unknown>;
}

export interface RecordedOrder {
  id: string;
  productSlug: string;
  productName: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  customerName: string | null;
  paypalOrderId: string;
  paypalCaptureId: string;
  status: string;
  createdAt: string;
  /** True if this call inserted the row; false if a prior insert already
   *  recorded the same capture_id (webhook + return-flow race). Callers
   *  use this to decide whether to send buyer/admin notifications. */
  isNew: boolean;
}

interface PaymentOrderRow {
  id: string;
  product_slug: string;
  product_name: string;
  amount_cents: number;
  currency: string;
  customer_email: string;
  customer_name: string | null;
  paypal_order_id: string;
  paypal_capture_id: string;
  paypal_payer_id: string | null;
  status: string;
  fulfilled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function rowToOrder(row: PaymentOrderRow, isNew: boolean): RecordedOrder {
  return {
    id: row.id,
    productSlug: row.product_slug,
    productName: row.product_name,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    paypalOrderId: row.paypal_order_id,
    paypalCaptureId: row.paypal_capture_id,
    status: row.status,
    createdAt: row.created_at,
    isNew,
  };
}

/**
 * Insert a captured order. Idempotent on `paypal_capture_id`: if a row
 * already exists for the same capture (because the webhook beat us, or
 * the buyer double-clicked), the existing row is returned with
 * `isNew: false` and no notifications should be sent.
 */
export async function recordCapturedOrder(
  input: RecordOrderInput,
): Promise<RecordedOrder> {
  const supabase = createServiceRoleClient();

  // Try insert first; on conflict, fall through to a select. We don't use
  // `.upsert()` because that would let a later call overwrite metadata,
  // and we want strict first-write-wins semantics.
  const insertResult = await supabase
    .from("payment_orders")
    .insert({
      product_slug: input.product.slug,
      product_name: input.product.name,
      amount_cents: input.amountCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      customer_name: input.customerName,
      paypal_order_id: input.paypalOrderId,
      paypal_capture_id: input.paypalCaptureId,
      paypal_payer_id: input.paypalPayerId,
      status: "captured",
      metadata: input.metadata,
    })
    .select()
    .single();

  if (!insertResult.error && insertResult.data) {
    return rowToOrder(insertResult.data as PaymentOrderRow, true);
  }

  // Unique-violation on paypal_capture_id (code 23505) → fetch existing.
  if (insertResult.error?.code === "23505") {
    const existing = await supabase
      .from("payment_orders")
      .select("*")
      .eq("paypal_capture_id", input.paypalCaptureId)
      .single();
    if (existing.error || !existing.data) {
      throw new Error(
        `payment_orders unique conflict but row not found for capture ${input.paypalCaptureId}`,
      );
    }
    return rowToOrder(existing.data as PaymentOrderRow, false);
  }

  throw new Error(
    `payment_orders insert failed: ${insertResult.error?.message ?? "unknown"}`,
  );
}

/**
 * Look up an order by its internal UUID. Returns null if the id is malformed,
 * the row doesn't exist, or Supabase is misconfigured. Used by the success
 * page to confirm the URL's `?order=` param actually points at a real
 * recorded order before showing the reference code (so people can't share
 * fake "receipt" URLs that look legitimate).
 *
 * Soft-fail by design — the success page should never crash on a malformed
 * URL param. It just shows the generic "processing — check your email" copy.
 */
export async function lookupOrderById(
  orderId: string,
): Promise<{ id: string; productSlug: string; status: string } | null> {
  // Cheap shape check — UUID is 36 chars with dashes. Rejecting early avoids
  // a DB round trip on obvious junk like `?order=FAKE123`.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return null;
  }
  try {
    const supabase = createServiceRoleClient();
    const result = await supabase
      .from("payment_orders")
      .select("id, product_slug, status")
      .eq("id", orderId)
      .maybeSingle();
    if (result.error || !result.data) return null;
    return {
      id: result.data.id as string,
      productSlug: result.data.product_slug as string,
      status: result.data.status as string,
    };
  } catch (err) {
    console.error("[payments] lookupOrderById swallowed:", err);
    return null;
  }
}

/**
 * Mark an order refunded. Driven by the PAYMENT.CAPTURE.REFUNDED webhook.
 * No-op if no row matches (refund of an order we never recorded — likely
 * a sandbox test against a webhook URL pointed at an empty DB).
 */
export async function markOrderRefunded(
  paypalCaptureId: string,
  refundMetadata: Record<string, unknown>,
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const result = await supabase
    .from("payment_orders")
    .update({
      status: "refunded",
      metadata: { refund: refundMetadata },
    })
    .eq("paypal_capture_id", paypalCaptureId)
    .select("id")
    .maybeSingle();
  if (result.error) {
    throw new Error(`payment_orders refund update failed: ${result.error.message}`);
  }
  return Boolean(result.data);
}

/**
 * Webhook dedup ledger. Returns true if this event_id was new (insert
 * succeeded); false if PayPal is replaying a prior event. Caller should
 * short-circuit on false.
 */
export async function recordWebhookEvent(input: {
  eventId: string;
  eventType: string;
  resourceId: string | null;
  payload: unknown;
}): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const result = await supabase
    .from("payment_webhook_events")
    .insert({
      paypal_event_id: input.eventId,
      event_type: input.eventType,
      resource_id: input.resourceId,
      payload: input.payload as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (!result.error) return true;
  if (result.error.code === "23505") return false;
  throw new Error(
    `payment_webhook_events insert failed: ${result.error.message}`,
  );
}

/**
 * Record that the handler threw for a given webhook event id. The webhook
 * route returns 200 to PayPal regardless (so PayPal doesn't infinite-retry
 * a deterministic bug), but we still want a counter so a broken handler
 * doesn't silently swallow 47 real payment events in a row.
 *
 * Soft-fail: never throws — the route is already in its outer catch block
 * when this runs, and we don't want to mask the original handler error.
 */
export async function recordWebhookHandlerError(
  eventId: string,
  errorMessage: string,
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const truncated = errorMessage.slice(0, 2000);
    // Read-modify-write because Supabase JS lacks a `column = column + 1`
    // primitive. Race-safe enough: PayPal retries the same event_id
    // sequentially, not concurrently. Worst case under contention is an
    // off-by-one in the counter — acceptable for a debugging signal.
    const current = await supabase
      .from("payment_webhook_events")
      .select("handler_error_count")
      .eq("paypal_event_id", eventId)
      .single();
    const nextCount = (current.data?.handler_error_count ?? 0) + 1;
    await supabase
      .from("payment_webhook_events")
      .update({
        handler_error_count: nextCount,
        handler_error_message: truncated,
      })
      .eq("paypal_event_id", eventId);
  } catch (err) {
    console.error("[payments] recordWebhookHandlerError swallowed:", err);
  }
}

// ============================================================
// Notifications
// ============================================================

function priceLabel(amountCents: number, currency: string): string {
  const dollars = (amountCents / 100).toFixed(2);
  return `$${dollars} ${currency}`;
}

/**
 * Send the buyer's receipt + admin email + Telegram ping, all in
 * parallel. All three soft-fail individually; we log but never throw,
 * so a notification outage can't corrupt a real-money state transition.
 */
export async function notifyCapturedOrder(order: RecordedOrder): Promise<void> {
  const env = serverEnv();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const priceFormatted = priceLabel(order.amountCents, order.currency);

  const tasks: Array<Promise<unknown>> = [];

  if (isResendConfigured()) {
    const { apiKey, fromEmail } = requireResend();
    const resend = new Resend(apiKey);

    // Buyer receipt
    tasks.push(
      resend.emails
        .send({
          from: `${SITE.name} <${fromEmail}>`,
          to: [order.customerEmail],
          subject: `You're in: ${order.productName}`,
          html: renderPaymentReceiptEmail({
            customerName: order.customerName ?? "friend",
            productName: order.productName,
            priceLabel: priceFormatted,
            orderId: order.id,
            siteUrl,
          }),
          replyTo: env.ADMIN_EMAIL,
        })
        .then((r) => {
          if ("error" in r && r.error) {
            console.error("[payments] buyer receipt failed:", r.error);
          } else {
            console.log("[payments] buyer receipt sent OK");
          }
        })
        .catch((err) => {
          console.error("[payments] buyer receipt threw:", err);
        }),
    );

    // Admin notification
    const adminRecipients = getAdminNotificationEmails();
    tasks.push(
      resend.emails
        .send({
          from: `${SITE.name} <${fromEmail}>`,
          to: adminRecipients,
          subject: `💰 ${order.customerName ?? order.customerEmail} bought ${order.productName}`,
          html: renderPaymentAdminNotificationEmail({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            productName: order.productName,
            priceLabel: priceFormatted,
            orderId: order.id,
            paypalCaptureId: order.paypalCaptureId,
            siteUrl,
          }),
        })
        .then((r) => {
          if ("error" in r && r.error) {
            console.error("[payments] admin email failed:", r.error);
          } else {
            console.log("[payments] admin email sent OK");
          }
        })
        .catch((err) => {
          console.error("[payments] admin email threw:", err);
        }),
    );
  } else {
    console.error(
      "[payments] RESEND_API_KEY not set — skipping buyer + admin emails. " +
        "Order recorded but no one was notified.",
    );
  }

  if (isTelegramConfigured()) {
    const lines = [
      `<b>💰 PAYMENT</b>`,
      `<b>${escapeHtml(order.customerName ?? "Anonymous")}</b> — ${escapeHtml(order.productName)}`,
      `${escapeHtml(priceFormatted)}`,
      `${escapeHtml(order.customerEmail)}`,
      "",
      `<i>capture:</i> <code>${escapeHtml(order.paypalCaptureId)}</code>`,
      `<a href="${escapeHtmlAttr(`${siteUrl}/admin/payments/${order.id}`)}">View in admin</a>`,
    ];
    tasks.push(
      sendTelegramAlert(lines.join("\n")).catch((err) => {
        console.error("[payments] telegram alert threw:", err);
      }),
    );
  }

  await Promise.allSettled(tasks);
}

// ============================================================
// Security events
// ============================================================

/**
 * Kind of security-relevant event we'd want to be paged on. Each maps to a
 * specific tripwire in the payments code path; using a closed string union
 * (vs free-form `kind: string`) keeps the call sites greppable.
 */
export type PaymentSecurityEventKind =
  | "amount-mismatch"
  | "unknown-slug"
  | "missing-custom-id"
  | "webhook-signature-invalid"
  | "webhook-handler-exception";

/**
 * Fire-and-forget security alert for payments tripwires (amount mismatch,
 * signature invalid, handler exception, etc.). Posts to Telegram if
 * configured. Soft-fail in all cases — the caller is usually in an error
 * path already and a notification outage must never mask the original
 * issue or block a money-movement response.
 *
 * WS6 wires this to Sentry.captureException too; until that lands, this
 * is Telegram-only. Callers pass `void notifySecurityEvent(...)` or
 * `notifySecurityEvent(...).catch(() => {})` — never await it in a
 * critical path.
 */
export async function notifySecurityEvent(input: {
  kind: PaymentSecurityEventKind;
  detail: string;
  /** Optional context — slug, capture id, event id. Stringified into the alert. */
  context?: Record<string, string | number | null | undefined>;
}): Promise<void> {
  const { kind, detail, context } = input;
  // Always log — Telegram may be unconfigured, Sentry DSN may be unset.
  console.error(`[payments-security] ${kind}: ${detail}`, context ?? {});

  // Sentry capture is a no-op if SENTRY_DSN is unset (the SDK's init()
  // was never called, so .captureMessage() silently does nothing).
  Sentry.captureMessage(`payments-security: ${kind}`, {
    level: "error",
    tags: { area: "payments", kind },
    extra: { detail, ...(context ?? {}) },
  });

  if (!isTelegramConfigured()) return;

  const contextLines = context
    ? Object.entries(context)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([k, v]) =>
            `<i>${escapeHtml(k)}:</i> <code>${escapeHtml(String(v))}</code>`,
        )
    : [];

  const lines = [
    `<b>🚨 PAYMENTS SECURITY</b>`,
    `<b>${escapeHtml(kind)}</b>`,
    escapeHtml(detail),
    ...(contextLines.length ? ["", ...contextLines] : []),
  ];

  try {
    await sendTelegramAlert(lines.join("\n"));
  } catch (err) {
    console.error("[payments-security] telegram alert threw:", err);
  }
}
