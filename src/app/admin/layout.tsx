import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Force dynamic so the session check runs on every request — otherwise
// stale cached HTML can show admin chrome to a signed-out user, which is
// exactly the confusing state Desi hit on mobile ("Log out" visible while
// the page was still asking for a magic link).
export const dynamic = "force-dynamic";

// Admin is noindex and intentionally bare — no site navbar/footer.
//
// The layout double-checks the session (middleware already does it for
// /admin/**, but the login + callback pages live under /admin too and
// are intentionally PUBLIC, so we need a per-render check here to decide
// whether to show the admin chrome).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let signedInEmail: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      signedInEmail = user?.email ?? null;
    } catch {
      // Treat any auth error as signed-out so login UI still renders.
      signedInEmail = null;
    }
  }

  // Signed-out → bare shell. This is what /admin/login + /admin/auth/callback
  // render as. Crucially, no "Log out" button on a page that hasn't logged
  // anyone in yet.
  if (!signedInEmail) {
    return (
      <div className="min-h-screen bg-da-dark text-da-text">
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-da-dark text-da-text">
      <header className="border-b border-da-border bg-da-surface/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display text-lg font-bold">
            <span className="text-da-indigo">DA</span> Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm text-da-muted sm:gap-6">
            <Link href="/admin" className="hover:text-da-text">
              Posts
            </Link>
            <Link href="/admin/scheduling" className="hover:text-da-text">
              Scheduling
            </Link>
            <Link href="/" className="hover:text-da-text">
              ← View site
            </Link>
            <span
              className="hidden rounded-full border border-da-border bg-da-dark px-2 py-0.5 text-xs text-da-muted sm:inline"
              title="Signed in as"
            >
              {signedInEmail}
            </span>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="text-da-muted hover:text-da-text"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
