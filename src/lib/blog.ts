import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export const BLOG_CATEGORIES = [
  "All",
  "Vibe Coding",
  "AI Art",
  "AI Music",
  "Tutorials",
  "Behind the Build",
  "Industry News",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: Exclude<BlogCategory, "All">;
  tags: string[];
  image?: string;
  published: boolean;
  readingTime: string;
  content: string;
}

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

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parseMdxFile)
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const filename = `${slug}.mdx`;
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) return undefined;
  return parseMdxFile(filename);
}

export function getPostsByCategory(
  category: Exclude<BlogCategory, "All">
): BlogPost[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getAllCategories(): BlogCategory[] {
  const posts = getAllPosts();
  const used = new Set(posts.map((p) => p.category));
  return ["All", ...BLOG_CATEGORIES.filter((c) => c !== "All" && used.has(c as Exclude<BlogCategory, "All">))] as BlogCategory[];
}
