"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SocialIcons } from "@/components/ui/SocialIcons";

interface HeroSocialRevealProps {
  /** How many social platforms to surface. Matches SocialIcons' `limit`. */
  limit?: number;
  className?: string;
}

// Click-to-reveal trigger for the hero social strip.
//
// Why this exists separately from SocialIcons: the hero needs the row to
// (1) stay collapsed by default so the hero stays clean, and (2) be
// visible immediately on every phone size. The existing FadeInOnScroll
// wrapper used `whileInView` which kept icons invisible below the fold on
// small phones (iPhone SE / 12 mini). This component animates on mount
// so the pill is always rendered the moment the page paints.
export function HeroSocialReveal({
  limit = 5,
  className = "",
}: HeroSocialRevealProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 25,
        delay: 0.4,
      }}
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={[
          "group inline-flex min-h-[44px] items-center gap-2 rounded-full",
          "border border-da-border/70 bg-da-surface/40 px-4 py-2",
          "font-mono text-xs uppercase tracking-[0.18em] text-da-muted",
          "backdrop-blur-sm transition-colors duration-200",
          "hover:border-da-indigo/50 hover:text-da-text",
        ].join(" ")}
      >
        <span className="text-da-cyan">//</span>
        <span>follow</span>
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-da-muted group-hover:text-da-cyan"
        >
          <path
            d="M2 4 L5 7 L8 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="social-panel"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 24,
              opacity: { duration: 0.18 },
            }}
            className="overflow-hidden"
          >
            <SocialIcons variant="hero" limit={limit} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
