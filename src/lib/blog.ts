import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { BlogPost, BlogCategory } from "@/lib/blog-constants";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

// Re-export for existing callers
export { BLOG_CATEGORIES };
export type { BlogPost, BlogCategory };

// ============================================================
// MDX file-system source (fallback when Supabase is not configured)
// ============================================================
const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function parseMdxFile(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, "");
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "Desmond Baker Jr",
    category: data.category ?? "Tutorials",
    tags: data.tags ?? [],
    image: data.image ?? undefined,
    published: data.published !== false,
    readingTime: stats.text,
    content,
  };
}

function getAllPostsFromMdx(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parseMdxFile)
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ============================================================
// Supabase source (primary when configured)
// ============================================================
interface SupabasePostRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[] | null;
  cover_image: string | null;
  author: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPost(row: SupabasePostRow): BlogPost {
  const stats = readingTime(row.content);
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.published_at ?? row.created_at,
    author: row.author,
    category: row.category as Exclude<BlogCategory, "All">,
    tags: row.tags ?? [],
    image: row.cover_image ?? undefined,
    published: row.status === "published",
    readingTime: stats.text,
    content: row.content,
  };
}

async function getAllPostsFromSupabase(): Promise<BlogPost[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Supabase getAllPosts error:", error);
    return [];
  }
  return (data ?? []).map(rowToPost);
}

async function getPostBySlugFromSupabase(
  slug: string,
): Promise<BlogPost | undefined> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToPost(data);
}

// ============================================================
// Public API — dual-source, same signatures as before
// ============================================================

export async function getAllPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    return getAllPostsFromSupabase();
  }
  return getAllPostsFromMdx();
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  if (isSupabaseConfigured()) {
    return getPostBySlugFromSupabase(slug);
  }
  const filename = `${slug}.mdx`;
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) return undefined;
  return parseMdxFile(filename);
}

export async function getPostsByCategory(
  category: Exclude<BlogCategory, "All">,
): Promise<BlogPost[]> {
  const all = await getAllPosts();
  return all.filter((post) => post.category === category);
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  const posts = await getAllPosts();
  const used = new Set(posts.map((p) => p.category));
  return [
    "All",
    ...BLOG_CATEGORIES.filter(
      (c) => c !== "All" && used.has(c as Exclude<BlogCategory, "All">),
    ),
  ] as BlogCategory[];
}
