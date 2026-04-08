import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin is noindex and intentionally bare — no site navbar/footer.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-da-dark text-da-text">
      <header className="border-b border-da-border bg-da-surface/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display text-lg font-bold">
            <span className="text-da-indigo">DA</span> Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm text-da-muted">
            <Link href="/admin" className="hover:text-da-text">
              Posts
            </Link>
            <Link href="/" className="hover:text-da-text">
              ← View site
            </Link>
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
