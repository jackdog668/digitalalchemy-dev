import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Force Node runtime so the cookie clear from `signOut()` actually
// persists in the response. Edge has previously eaten cookie writes
// inside auth helpers depending on adapter version.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Logs the admin out and redirects back to /admin/login.
//
// IMPORTANT: must respond with `303 See Other` (not the default 307).
// 307 preserves the original method, so the browser would follow with
// `POST /admin/login` — that's a page route, not a POST handler, which
// caused mobile browsers to receive an unexpected response and prompt
// to download it as a text file. 303 forces a clean GET on follow-up.
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", req.url), {
    status: 303,
  });
}
