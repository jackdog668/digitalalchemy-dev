"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PostCard } from "./PostCard";
import type { BlogPost, BlogCategory } from "@/lib/blog";

interface CategoryFilterProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function CategoryFilter({ posts, categories }: CategoryFilterProps) {
  const [active, setActive] = useState<BlogCategory>("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Filter buttons — mirrors portfolio page pattern */}
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              active === cat
                ? "bg-da-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                : "bg-da-surface text-da-muted hover:bg-da-surface-light hover:text-da-text border border-da-border"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-center text-da-muted py-12">
          No posts in this category yet. Check back soon.
        </p>
      )}
    </>
  );
}
