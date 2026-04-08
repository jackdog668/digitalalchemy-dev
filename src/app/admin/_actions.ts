"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createServiceRoleClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { serverEnv, isResendConfigured } from "@/lib/env";
import { sendNewPostEmail } from "@/lib/email/send-new-post";

// Every server action runs this guard first. Returns the admin user's email
// on success, throws on failure. Per CLAUDE.md: never trust client-supplied
// identity, always verify on the server.
async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = serverEnv().ADMIN_EMAIL.toLowerCase();
  if (!user || user.email?.toLowerCase() !== adminEmail) {
    throw new Error("Unauthorized");
  }
  return user.email!;
}

const postInput = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
    title: z.string().min(1).max(300),
    description: z.string().min(1).max(500),
    content: z.string().min(1),
    category: z.string().min(1).max(100),
    tags: z.array(z.string().max(50)).max(20).default([]),
    cover_image: z.string().url().optional().or(z.literal("")),
    status: z.enum(["draft", "published", "scheduled"]),
    published_at: z.string().optional().or(z.literal("")),
  })
  .strict();

export type PostInput = z.infer<typeof postInput>;

function normalizeInput(input: PostInput) {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    content: input.content,
    category: input.category,
    tags: input.tags,
    cover_image: input.cover_image || null,
    status: input.status,
    published_at:
      input.status === "published"
        ? input.published_at || new Date().toISOString()
        : input.published_at || null,
  };
}

export async function createPost(raw: unknown) {
  await assertAdmin();
  const input = postInput.parse(raw);
  const db = createServiceRoleClient();

  const { data, error } = await db
    .from("posts")
    .insert(normalizeInput(input))
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");

  if (input.status === "published" && isResendConfigured()) {
    try {
      await sendNewPostEmail(data);
    } catch (err) {
      console.error("Newsletter fanout failed:", err);
    }
  }

  redirect("/admin");
}

export async function updatePost(id: string, raw: unknown) {
  await assertAdmin();
  const input = postInput.parse(raw);
  const db = createServiceRoleClient();

  // Fetch previous status so we only fire the newsletter on draft→published
  const { data: prev } = await db
    .from("posts")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await db
    .from("posts")
    .update(normalizeInput(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");

  const becamePublished =
    prev?.status !== "published" && input.status === "published";
  if (becamePublished && isResendConfigured()) {
    try {
      await sendNewPostEmail(data);
    } catch (err) {
      console.error("Newsletter fanout failed:", err);
    }
  }

  redirect("/admin");
}

export async function deletePost(id: string) {
  await assertAdmin();
  const db = createServiceRoleClient();
  const { data: existing } = await db
    .from("posts")
    .select("slug")
    .eq("id", id)
    .single();
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/blog");
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");

  redirect("/admin");
}
