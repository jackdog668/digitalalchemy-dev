import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return new NextResponse("Newsletter not configured", { status: 503 });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
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
