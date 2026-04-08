import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { DeletePostButton } from "./_components/DeletePostButton";

export const dynamic = "force-dynamic";

interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  published_at: string | null;
  updated_at: string;
}

export default async function AdminHome() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-da-border bg-da-surface p-6">
        <h1 className="font-display text-2xl font-bold">
          Supabase not configured
        </h1>
        <p className="mt-2 text-sm text-da-muted">
          Set the Supabase env vars in <code>.env.local</code> and restart the
          dev server. See <code>SETUP.md</code> for the checklist.
        </p>
      </div>
    );
  }

  const db = createServiceRoleClient();
  const { data: posts, error } = await db
    .from("posts")
    .select("id, slug, title, status, category, published_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <p className="text-red-400">Error loading posts: {error.message}</p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-da-indigo px-4 py-2 text-sm font-semibold text-white"
        >
          + New post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-da-border">
        <table className="w-full text-sm">
          <thead className="bg-da-surface text-left text-xs uppercase tracking-wider text-da-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-da-border">
            {(posts ?? []).map((p: AdminPostRow) => (
              <tr key={p.id} className="bg-da-dark hover:bg-da-surface/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="font-medium hover:text-da-indigo"
                  >
                    {p.title}
                  </Link>
                  <div className="text-xs text-da-muted">/{p.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-da-muted">{p.category}</td>
                <td className="px-4 py-3 text-da-muted">
                  {new Date(p.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeletePostButton id={p.id} title={p.title} />
                </td>
              </tr>
            ))}
            {(posts ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-da-muted">
                  No posts yet. Click &ldquo;New post&rdquo; to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-500/10 text-green-400 border-green-500/30",
    draft: "bg-da-muted/10 text-da-muted border-da-border",
    scheduled: "bg-da-indigo/10 text-da-indigo border-da-indigo/30",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${styles[status] ?? styles.draft}`}
    >
      {status}
    </span>
  );
}
