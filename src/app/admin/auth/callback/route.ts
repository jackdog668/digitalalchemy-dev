import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Supabase magic-link callback. Exchanges the OTP code in the URL for a
// session cookie, then redirects into /admin. If the email on the session
// isn't the admin, we immediately sign them out.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const adminEmail = (
    process.env.ADMIN_EMAIL ?? "desibaker54@gmail.com"
  ).toLowerCase();

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user || data.user.email?.toLowerCase() !== adminEmail) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=unauthorized", req.url),
    );
  }

  return NextResponse.redirect(new URL(next, req.url));
}
