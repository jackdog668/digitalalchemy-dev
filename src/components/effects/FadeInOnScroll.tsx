"use client";

/**
 * FadeInOnScroll — framer-motion scroll-triggered entrance animations.
 *
 * Exports:
 *   FadeInOnScroll    — single element fade-in with directional offset
 *   StaggerContainer  — orchestrates child animation timing
 *   StaggerItem       — individual item inside a StaggerContainer
 *
 * Usage:
 *   // Basic fade up
 *   <FadeInOnScroll direction="up" delay={200}>
 *     <MyCard />
 *   </FadeInOnScroll>
 *
 *   // Staggered list
 *   <StaggerContainer staggerDelay={0.12}>
 *     {items.map(item => (
 *       <StaggerItem key={item.id}>
 *         <MyCard {...item} />
 *       </StaggerItem>
 *     ))}
 *   </StaggerContainer>
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ── Types ─────────────────────────────────────────────────── */

interface FadeInOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Entrance delay in milliseconds (converted to seconds internally) */
  delay?: number;
  /** Axis and direction of the initial translate offset */
  direction?: "up" | "down" | "left" | "right";
  /** Spring animation duration in seconds */
  duration?: number;
}

/* ── Helpers ───────────────────────────────────────────────── */

/** Maps direction prop to the initial translate offset applied before entry */
const directionOffset: Record<
  NonNullable<FadeInOnScrollProps["direction"]>,
  { x?: number; y?: number }
> = {
  up:    { y:  40 },
  down:  { y: -40 },
  left:  { x:  40 },
  right: { x: -40 },
};

/* ── FadeInOnScroll ────────────────────────────────────────── */

export function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeInOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 120,
        delay: delay / 1000, // ms → seconds
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerContainer ──────────────────────────────────────── */

/**
 * Wrap a list of <StaggerItem> children to cascade their entrance
 * animations with a consistent time offset between each.
 */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance */
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerItem ───────────────────────────────────────────── */

/**
 * Direct child of <StaggerContainer>. Inherits the parent's
 * variant orchestration so timing is handled automatically.
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 120,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
