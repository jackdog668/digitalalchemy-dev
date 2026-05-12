import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Supabase magic-link callback. Exchanges the OTP code in the URL for a
// session cookie, then redirects into /admin (or the original `next` deep
// link). If the email on the session isn't the admin, we immediately sign
// them out and bounce back to the login page with a clear error code.

// Force Node.js runtime + dynamic so the cookie write from
// exchangeCodeForSession actually persists. Edge runtime + static caching
// have both produced silent session-loss bugs in the wild.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only allow internal paths so a tampered ?next= param can't bounce the
// user (still authenticated) to an external site.
function safeNext(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/admin";
  return raw;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "desibaker54@gmail.com"
  ).toLowerCase();

  // Some Supabase email-template variants surface OTP errors directly in
  // the URL (?error=...&error_description=...). Surface them so the user
  // sees something useful instead of silently bouncing.
  const supabaseError = url.searchParams.get("error");
  if (supabaseError) {
    return NextResponse.redirect(
      new URL("/admin/login?error=callback_failed", req.url),
      { status: 303 },
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_code", req.url),
      { status: 303 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    // Don't sign out here — there's nothing to sign out of yet — just
    // surface the failure.
    return NextResponse.redirect(
      new URL("/admin/login?error=callback_failed", req.url),
      { status: 303 },
    );
  }

  if (data.user.email?.toLowerCase() !== adminEmail) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=unauthorized", req.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(new URL(next, req.url), { status: 303 });
}
