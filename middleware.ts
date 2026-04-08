import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Gates /admin/** and /api/admin/** — requires an authenticated session
// whose email matches ADMIN_EMAIL. Everything else passes through.
// Non-matching paths are excluded via `config.matcher` for zero perf cost.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login is public so the user can actually sign in.
  if (pathname === "/admin/login" || pathname === "/admin/auth/callback") {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? "desibaker54@gmail.com";

  // If Supabase isn't configured yet, admin is unreachable — 404.
  if (!supabaseUrl || !supabaseAnon) {
    return new NextResponse("Admin unavailable: Supabase not configured.", {
      status: 503,
    });
  }

  const res = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    // API routes get 401, pages redirect to login.
    if (pathname.startsWith("/api/")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
