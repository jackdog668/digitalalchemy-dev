import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens, GOOGLE_SCOPES } from "@/lib/google/client";
import { saveTokens } from "@/lib/google/tokens";
import { isGoogleOAuthConfigured, serverEnv } from "@/lib/env";

// Google redirects here after the admin grants (or denies) consent.
// Verifies the CSRF state cookie, exchanges the code for tokens, persists
// them, then redirects back to /admin/scheduling.
export async function GET(req: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/scheduling?google=notconfigured", req.url),
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/scheduling?google=denied`, req.url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/admin/scheduling?google=missing`, req.url),
    );
  }

  const cookieState = req.cookies.get("g_oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(
      new URL(`/admin/scheduling?google=badstate`, req.url),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const adminEmail = serverEnv().ADMIN_EMAIL;
    await saveTokens({
      adminEmail,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(tokens.expiryDate).toISOString(),
      scope: tokens.scope ?? GOOGLE_SCOPES.join(" "),
      calendarId: "primary",
    });
  } catch (err) {
    console.error("[google] callback exchange failed:", err);
    return NextResponse.redirect(
      new URL(`/admin/scheduling?google=exchangefailed`, req.url),
    );
  }

  const res = NextResponse.redirect(
    new URL("/admin/scheduling?google=connected", req.url),
  );
  res.cookies.delete("g_oauth_state");
  return res;
}
