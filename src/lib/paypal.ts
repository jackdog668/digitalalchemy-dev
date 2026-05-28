import "server-only";

// PayPal server client + product allowlist + thin wrappers around the
// Orders v2 API. This file is the ONLY place that talks to PayPal — all
// other server code (create-order route, capture route, webhook) goes
// through these helpers.
//
// Why a hand-rolled REST client instead of @paypal/paypal-server-sdk?
// The official SDK ships ESM + bundler-unfriendly subpath exports that
// drag in a lot of weight for the four endpoints we actually need
// (token, create-order, capture-order, verify-webhook-signature). A
// tight fetch wrapper keeps the surface auditable and avoids version
// churn risk on a security-critical path. We can swap in the SDK later
// without changing callers.

import { requirePayPal } from "@/lib/env";

// ============================================================
// Product allowlist — SERVER-SIDE PRICE OF TRUTH
// ============================================================
// CLAUDE.md rule #1: prices are NEVER accepted from the client. The
// client posts a `product_slug` only; the server looks up the canonical
// product from this map. Changing a price here is the only way to
// charge a different amount.

export interface PaymentProduct {
  slug: string;
  name: string;
  amountCents: number;
  currency: "USD";
  /** Short blurb shown on the checkout page above the PayPal buttons. */
  blurb: string;
  /** Used in the PayPal order description (shows up on receipts). */
  description: string;
  /** Where to send the buyer after a successful capture. */
  successUrl: string;
}

const PRODUCT_LIST: PaymentProduct[] = [
  {
    slug: "bootcamp",
    name: "Vibe Coding Bootcamp",
    amountCents: 14700,
    currency: "USD",
    blurb:
      "Build your first real, deployed AI app in one focused cohort — start to finish.",
    description: "Digital Alchemy — Vibe Coding Bootcamp (one-time)",
    successUrl: "/checkout/success?product=bootcamp",
  },
  {
    slug: "bootcamp-v2",
    name: "Vibe Coding Bootcamp V2",
    amountCents: 14700,
    currency: "USD",
    blurb:
      "Build your first real, deployed AI app in one focused cohort — start to finish. Version 2.0 with all-new modules!",
    description: "Digital Alchemy — Vibe Coding Bootcamp V2 (one-time)",
    successUrl: "/checkout/success?product=bootcamp-v2",
  },
  {
    slug: "portfolio-building",
    name: "Portfolio Building (1-on-1)",
    amountCents: 50000,
    currency: "USD",
    blurb:
      "Production-quality multi-medium portfolio with full commercial rights — art, music, apps, video.",
    description: "Digital Alchemy — Portfolio Building Session",
    successUrl: "/checkout/success?product=portfolio-building",
  },
];

// Assert slugs are unique BEFORE constructing the lookup map. JavaScript's
// Map silently keeps the last entry on key collision, which would mean a
// duplicate slug in PRODUCT_LIST quietly overwrites the earlier product's
// price/name. Throwing at module load catches this on `next build` or first
// import in dev — long before money moves.
function assertUniqueProductSlugs(list: readonly PaymentProduct[]): void {
  const seen = new Set<string>();
  for (const p of list) {
    if (seen.has(p.slug)) {
      throw new Error(
        `[paypal] duplicate product slug "${p.slug}" in PRODUCT_LIST — slugs must be unique`,
      );
    }
    seen.add(p.slug);
  }
}
assertUniqueProductSlugs(PRODUCT_LIST);

const PRODUCTS_BY_SLUG: ReadonlyMap<string, PaymentProduct> = new Map(
  PRODUCT_LIST.map((p) => [p.slug, p]),
);

/** All buyable products. Order is the display order. */
export function listProducts(): readonly PaymentProduct[] {
  return PRODUCT_LIST;
}

/** Returns the product or null. Never throws — callers decide on 404 vs 400. */
export function getProduct(slug: string): PaymentProduct | null {
  return PRODUCTS_BY_SLUG.get(slug) ?? null;
}

/** Format amount_cents as "147.00" for the PayPal amount.value field. */
export function formatPayPalAmount(amountCents: number): string {
  const dollars = Math.floor(amountCents / 100);
  const cents = amountCents % 100;
  return `${dollars}.${cents.toString().padStart(2, "0")}`;
}

// ============================================================
// REST client
// ============================================================

function apiBase(env: "sandbox" | "live"): string {
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

let tokenCache: CachedToken | null = null;

/**
 * OAuth2 client-credentials grant. Tokens are cached in-process until
 * 60s before expiry; PayPal hands out tokens valid for ~9 hours. On
 * Vercel each cold start re-fetches, which is fine — the endpoint is
 * cheap and the cache is just a hot-path optimization.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs - 60_000 > now) {
    return tokenCache.accessToken;
  }
  const { clientId, clientSecret, environment } = requirePayPal();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase(environment)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(
      `PayPal token fetch failed: ${res.status} ${body.slice(0, 200)}`,
    );
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    accessToken: json.access_token,
    expiresAtMs: now + json.expires_in * 1000,
  };
  return json.access_token;
}

async function paypalFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const { environment } = requirePayPal();
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${apiBase(environment)}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

// ============================================================
// Orders v2 — narrow types we actually use
// ============================================================

export interface PayPalOrderResult {
  id: string;
  status: string;
}

export interface PayPalPayer {
  email_address?: string;
  name?: { given_name?: string; surname?: string };
  payer_id?: string;
}

export interface PayPalCapture {
  id: string;
  status: string;
  amount: { currency_code: string; value: string };
  /**
   * PayPal echoes the `custom_id` we set on the purchase_unit back onto
   * the capture object itself. This is the AUTHORITATIVE location per
   * PayPal v2 Orders API docs — the top-level `purchase_units[].custom_id`
   * is sometimes blank on the capture response even though it was set on
   * creation. Always prefer this field; fall back to purchase_unit level.
   */
  custom_id?: string;
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  payer?: PayPalPayer;
  purchase_units?: Array<{
    payments?: { captures?: PayPalCapture[] };
    custom_id?: string;
  }>;
}

/**
 * Create a PayPal order for the given product. `customId` is echoed back
 * to us on capture / webhook so we can correlate without trusting the
 * client. We use the product slug as custom_id.
 */
export async function createOrder(
  product: PaymentProduct,
): Promise<PayPalOrderResult> {
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: product.slug,
          description: product.description,
          amount: {
            currency_code: product.currency,
            value: formatPayPalAmount(product.amountCents),
          },
        },
      ],
      application_context: {
        brand_name: "Digital Alchemy",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(
      `PayPal createOrder failed: ${res.status} ${body.slice(0, 300)}`,
    );
  }
  return (await res.json()) as PayPalOrderResult;
}

/**
 * Capture a previously-approved order. Returns the full capture payload
 * including payer details and the capture_id we persist for idempotency.
 */
export async function captureOrder(
  orderId: string,
): Promise<PayPalCaptureResult> {
  const res = await paypalFetch(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      // Empty body required by PayPal; SDK quirks aside, sending {} is safe.
      body: "{}",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(
      `PayPal captureOrder failed: ${res.status} ${body.slice(0, 300)}`,
    );
  }
  return (await res.json()) as PayPalCaptureResult;
}

/** Pull the first capture object out of a capture response (we only ever have one). */
export function firstCapture(result: PayPalCaptureResult): PayPalCapture | null {
  return result.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
}

/**
 * Pull the product slug we tagged on creation.
 *
 * PayPal v2 Orders API quirk: when you set `custom_id` on the purchase_unit
 * at order creation, the capture response surfaces it on the CAPTURE object
 * (`purchase_units[0].payments.captures[0].custom_id`) — NOT on the
 * purchase_unit itself. The purchase_unit's `custom_id` field is often
 * blank on the capture response even though it was populated on creation.
 *
 * We check both locations, preferring the capture-level field (which
 * matches what the webhook handler sees on PAYMENT.CAPTURE.COMPLETED).
 */
export function customIdFromCapture(result: PayPalCaptureResult): string | null {
  const captureLevel = result.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
  if (captureLevel) return captureLevel;
  return result.purchase_units?.[0]?.custom_id ?? null;
}

// ============================================================
// Webhook signature verification
// ============================================================
// Uses PayPal's /v1/notifications/verify-webhook-signature endpoint. We
// pass the raw event body (parsed as JSON) plus the five PAYPAL-* headers
// and the configured webhook_id. PayPal returns either VERIFIED or
// FAILURE — we treat anything other than VERIFIED as a hard reject.

export interface VerifyWebhookInput {
  headers: Headers;
  webhookId: string;
  eventBody: unknown;
}

export async function verifyWebhookSignature(
  input: VerifyWebhookInput,
): Promise<boolean> {
  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ] as const;
  const collected: Record<string, string> = {};
  for (const h of required) {
    const v = input.headers.get(h);
    if (!v) {
      console.warn(`[paypal] webhook missing header: ${h}`);
      return false;
    }
    collected[h] = v;
  }
  const payload = {
    auth_algo: collected["paypal-auth-algo"],
    cert_url: collected["paypal-cert-url"],
    transmission_id: collected["paypal-transmission-id"],
    transmission_sig: collected["paypal-transmission-sig"],
    transmission_time: collected["paypal-transmission-time"],
    webhook_id: input.webhookId,
    webhook_event: input.eventBody,
  };
  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    console.error(
      `[paypal] verify-webhook-signature returned ${res.status}: ${body.slice(0, 200)}`,
    );
    return false;
  }
  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === "SUCCESS";
}
