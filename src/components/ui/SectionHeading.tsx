"use client";

import { motion } from "framer-motion";

// Usage examples:
// <SectionHeading title="What We Teach" subtitle="Courses for creative professionals." />
// <SectionHeading title="About" align="left" accent={false} />

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accent?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  accent = true,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <motion.h2
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      >
        {title}
      </motion.h2>

      {accent && (
        // The bar animates from 0 → 80px width on scroll entry.
        // `width` as a motion value works here because framer-motion
        // interpolates numeric style values directly.
        <motion.div
          className={`mt-4 h-1 rounded-full bg-gradient-to-r from-da-indigo to-da-purple ${
            align === "center" ? "mx-auto" : ""
          }`}
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 80, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
            delay: 0.2,
          }}
        />
      )}

      {subtitle && (
        <motion.p
          className="mt-4 max-w-2xl text-lg text-da-muted mx-auto"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
            delay: 0.3,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
