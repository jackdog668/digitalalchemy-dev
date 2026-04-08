// Client-safe blog constants and types. No fs, no supabase — can be imported
// from client components.

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
