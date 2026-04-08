/**
 * One-time migration: read `content/blog/*.mdx` and insert each as a row in
 * `public.posts`. Idempotent — uses slug as the natural key (onConflict:slug).
 *
 * Usage:
 *   1. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   2. Run supabase/schema.sql in the Supabase SQL editor
 *   3. npx tsx scripts/migrate-mdx-to-supabase.ts
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  author?: string;
  category: string;
  tags?: string[];
  image?: string;
  published?: boolean;
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  if (files.length === 0) {
    console.log("No MDX files found. Nothing to migrate.");
    return;
  }

  console.log(`Migrating ${files.length} post(s)...`);

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Frontmatter;

    const row = {
      slug,
      title: fm.title,
      description: fm.description,
      content,
      category: fm.category,
      tags: fm.tags ?? [],
      cover_image: fm.image ?? null,
      author: fm.author ?? "Desmond Baker Jr",
      status: fm.published === false ? "draft" : "published",
      published_at: fm.published === false ? null : new Date(fm.date).toISOString(),
    };

    const { error } = await db
      .from("posts")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`  ✗ ${slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${slug}`);
    }
  }

  console.log("\n✅ Done. Visit /blog to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
