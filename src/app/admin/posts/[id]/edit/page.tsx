import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PostEditor } from "@/app/admin/_components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createServiceRoleClient();
  const { data: post } = await db
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const publishedLocal = post.published_at
    ? new Date(post.published_at).toISOString().slice(0, 16)
    : "";

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Edit post</h1>
      <PostEditor
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          category: post.category,
          tags: post.tags ?? [],
          cover_image: post.cover_image ?? "",
          status: post.status,
          published_at: publishedLocal,
        }}
      />
    </div>
  );
}
