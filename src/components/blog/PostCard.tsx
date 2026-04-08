"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import type { BlogPost } from "@/lib/blog";

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card variant="feature" className="group h-full">
          {/* Optional cover image */}
          {post.image && (
            <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-da-surface-light to-da-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          {/* Category + reading time */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-da-indigo">
              {post.category}
            </span>
            <span className="text-xs text-da-muted">{post.readingTime}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-semibold text-da-text group-hover:text-da-indigo transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-da-muted leading-relaxed line-clamp-2">
            {post.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-da-surface px-2 py-1 text-xs text-da-muted border border-da-border"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Date */}
          <div className="mt-4 text-xs text-da-muted">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
