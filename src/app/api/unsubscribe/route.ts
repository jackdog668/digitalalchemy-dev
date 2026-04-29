import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// unsubscribe_token defaults to gen_random_uuid()::text in supabase/schema.sql
// — i.e. a standard UUID. Any other shape is malformed and rejected before
// the DB lookup, killing token-enumeration attempts.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return new NextResponse("Newsletter not configured", { status: 503 });
  }

  const ip = getClientIp(req);
  const rl = await rateLimit({
    key: "unsubscribe",
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
  if (!token || !UUID_RE.test(token)) {
    return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));
  }

  const db = createServiceRoleClient();
  const { error } = await db
    .from("subscribers")
    .delete()
    .eq("unsubscribe_token", token);

  if (error) {
    return NextResponse.redirect(new URL("/unsubscribe?error=1", req.url));
  }

  return NextResponse.redirect(new URL("/unsubscribe?ok=1", req.url));
}
