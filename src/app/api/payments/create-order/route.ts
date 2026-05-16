import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isPayPalConfigured, isSupabaseConfigured } from "@/lib/env";
import { createOrder, getProduct } from "@/lib/paypal";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/payments/create-order
// Body: { product_slug: 'bootcamp' | 'portfolio-building' }
// Returns: { orderId: string }
//
// Security:
//   - Zod .strict() rejects unexpected fields (no `amount`, no `email`, no
//     `user_id` — buyer info comes from PayPal after approval).
//   - product_slug is validated against the server-side allowlist; the
//     price is looked up from lib/paypal.ts, never accepted from client.
//   - Rate-limited 3/hr per IP (payments tier per CLAUDE.md rule #5).

const bodySchema = z
  .object({
    product_slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  })
  .strict();

export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "Payments not configured" },
      { status: 503 },
    );
  }
  if (!isSupabaseConfigured()) {
    // Even though we don't write a row at create-order time, we WILL on
    // capture — fail fast here so the buyer doesn't get an approved order
    // we can't persist.
    return NextResponse.json(
      { error: "Payments not configured" },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "payments:create-order",
    identifier: ip,
    max: 3,
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

  const product = getProduct(parsed.data.product_slug);
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  try {
    const order = await createOrder(product);
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[payments] createOrder failed:", err);
    return NextResponse.json(
      { error: "Payment failed. Please try again or contact support." },
      { status: 500 },
    );
  }
}
