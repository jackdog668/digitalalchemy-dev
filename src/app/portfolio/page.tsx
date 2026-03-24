"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { projects, categories, type ProjectCategory } from "@/data/projects";
import { stats } from "@/data/stats";

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] =
    useState<ProjectCategory>("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="cyan" size="lg" className="-left-20 top-20" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Built,{" "}
              <span className="text-da-cyan">Not Collected.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              Real projects. Real output. Everything here was created — not
              curated from a tutorial.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── STATS ── */}
      <section className="border-y border-da-border bg-da-surface/30 px-6 py-16">
        <StaggerContainer
          className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4"
          staggerDelay={0.1}
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <ShimmerLine />

      {/* ── PROJECT GRID ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="The Work"
            subtitle="Filter by category to explore what we've built."
          />

          {/* Category filter buttons */}
          <FadeInOnScroll delay={100}>
            <div className="mb-12 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    activeCategory === cat
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
          </FadeInOnScroll>

          {/* Projects grid with AnimatePresence for filter transitions */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <Card
                    variant="feature"
                    className="group h-full hover:-translate-y-1 transition-transform"
                  >
                    {/* Placeholder thumbnail */}
                    <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-da-surface-light to-da-surface flex items-center justify-center overflow-hidden">
                      <span className="text-4xl opacity-30">
                        {project.category === "Music"
                          ? "\uD83C\uDFB5"
                          : project.category === "Design"
                            ? "\uD83C\uDFA8"
                            : project.category === "Code"
                              ? "\u2328\uFE0F"
                              : project.category === "Video"
                                ? "\uD83C\uDFAC"
                                : "\u2728"}
                      </span>
                    </div>

                    <div className="text-xs font-semibold uppercase tracking-wider text-da-indigo mb-2">
                      {project.category}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-da-text group-hover:text-da-indigo transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-da-muted leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-da-surface px-2 py-1 text-xs text-da-muted border border-da-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
