"use client";

/**
 * TextReveal — word-by-word entrance animation with blur dissolve.
 *
 * Each word fades in and rises from a slight offset while blurring
 * into focus. Words are staggered sequentially for a typewriter-like
 * feel that is smoother and more premium than a character-by-character
 * or full-block approach.
 *
 * Usage:
 *   <TextReveal
 *     text="Turning Ideas Into Digital Gold"
 *     className="text-4xl font-bold glow-text"
 *     delay={200}
 *     staggerDelay={0.07}
 *   />
 *
 * Notes:
 *   - Renders as a <span> so it is safe inside <h1>, <p>, etc.
 *   - Each word gets a stable key using index to handle duplicate words.
 *   - The inline-block + mr-[0.25em] approach preserves natural word spacing.
 */

import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  /** Entrance delay in milliseconds (converted to seconds internally) */
  delay?: number;
  /** Seconds between each word's entrance */
  staggerDelay?: number;
}

export function TextReveal({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
}: TextRevealProps) {
  const words = text.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay / 1000, // ms → seconds
          },
        },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          // Index suffix handles repeated words without React key conflicts
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
