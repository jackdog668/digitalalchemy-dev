import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// confirm_token is generated as crypto.randomBytes(32).toString("hex") in
// /api/subscribe — exactly 64 hex chars. Anything else is malformed and
// gets rejected before we even hit the DB. This kills brute-force /
// enumeration attempts cheaply.
const CONFIRM_TOKEN_RE = /^[a-f0-9]{64}$/i;

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return new NextResponse("Newsletter not configured", { status: 503 });
  }

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "subscribe:confirm",
    identifier: ip,
    max: 10,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSec) },
    });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token || !CONFIRM_TOKEN_RE.test(token)) {
    return NextResponse.redirect(new URL("/blog?subscribed=error", req.url));
  }

  const db = createServiceRoleClient();
  const { data: row } = await db
    .from("subscribers")
    .select("id")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(new URL("/blog?subscribed=error", req.url));
  }

  await db
    .from("subscribers")
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      confirm_token: null,
    })
    .eq("id", row.id);

  return NextResponse.redirect(new URL("/blog?subscribed=1", req.url));
}
