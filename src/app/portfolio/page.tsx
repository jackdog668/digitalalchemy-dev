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

/** Category → emoji for projects without screenshots */
const categoryEmoji: Record<string, string> = {
  Music: "\uD83C\uDFB5",
  Design: "\uD83C\uDFA8",
  Code: "\u2328\uFE0F",
  Video: "\uD83C\uDFAC",
  "AI Tools": "\u2728",
};

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
                  {/* Wrap in anchor if project has a live URL */}
                  <ProjectCardWrapper url={project.url}>
                    <Card
                      variant="feature"
                      className="group h-full"
                    >
                      {/* Screenshot thumbnail or emoji fallback */}
                      <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-da-surface-light to-da-surface overflow-hidden relative">
                        {project.screenshot ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={project.screenshot}
                              alt={`Screenshot of ${project.title}`}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-da-indigo/0 group-hover:bg-da-indigo/10 transition-colors duration-300 flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium text-white bg-da-dark/80 px-4 py-2 rounded-full backdrop-blur-sm">
                                View Live &rarr;
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl opacity-30">
                              {categoryEmoji[project.category] || "\u2728"}
                            </span>
                          </div>
                        )}
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

                      {/* Live link indicator */}
                      {project.url && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-da-cyan">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-da-cyan animate-pulse" />
                          Live
                        </div>
                      )}
                    </Card>
                  </ProjectCardWrapper>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

/** Wraps a card in an anchor tag if the project has a URL, otherwise renders children directly */
function ProjectCardWrapper({
  url,
  children,
}: {
  url?: string;
  children: React.ReactNode;
}) {
  if (!url) return <>{children}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      {children}
    </a>
  );
}
