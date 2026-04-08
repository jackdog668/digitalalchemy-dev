import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return new NextResponse("Newsletter not configured", { status: 503 });
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
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
