"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { MagneticWrapper } from "@/components/effects/MagneticWrapper";
import { UnicornHero } from "@/components/effects/UnicornHero";
import { TextReveal } from "@/components/effects/TextReveal";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { SITE } from "@/lib/constants";
import { stats } from "@/data/stats";
import Link from "next/link";

const FEATURED_CARDS = [
  {
    title: "The School",
    desc: "6 forge modules. 340+ assets. 100-day system. Build a portfolio of work you actually own.",
    href: "/school",
    accent: "from-da-indigo to-da-purple",
  },
  {
    title: "Our Services",
    desc: "AI consulting, vibe coding workshops, and custom systems for brands and teams.",
    href: "/services",
    accent: "from-da-purple to-da-cyan",
  },
  {
    title: "The Portfolio",
    desc: "Music, art, apps, tools — proof that creators can build real things with AI.",
    href: "/portfolio",
    accent: "from-da-cyan to-da-indigo",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        {/* WebGL background scene */}
        <UnicornHero />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Credential badge */}
          <FadeInOnScroll>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-da-border bg-da-surface/60 px-4 py-2 text-sm text-da-muted backdrop-blur-sm">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-da-cyan" />
              Taught by a {SITE.credential}
            </div>
          </FadeInOnScroll>

          {/* Main headline — TextReveal on the first line, glow-text on the second */}
          <FadeInOnScroll delay={100}>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <TextReveal text="Stop Learning AI." />
              <br />
              <span className="glow-text">Start Building With It.</span>
            </h1>
          </FadeInOnScroll>

          {/* Subheadline */}
          <FadeInOnScroll delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted sm:text-xl">
              Transform from scattered AI consumer to asset-owning creator in
              100 days. Real projects. Real portfolio. Real results.
            </p>
          </FadeInOnScroll>

          {/* CTAs — primary wrapped in MagneticWrapper for the pull effect */}
          <FadeInOnScroll delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MagneticWrapper strength={0.25}>
                <Button
                  href={SITE.skoolUrl}
                  external
                  variant="accent"
                  size="lg"
                >
                  Become an Alchemist
                </Button>
              </MagneticWrapper>
              <Button href="/portfolio" variant="outline" size="lg">
                See What We Build
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── FEATURED CARDS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeInOnScroll>
            <SectionHeading
              title="What We Do"
              subtitle="We don't teach AI. We make you BUILD with it."
            />
          </FadeInOnScroll>

          {/* StaggerContainer cascades each card's entrance */}
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {FEATURED_CARDS.map((card) => (
              <StaggerItem key={card.title}>
                <Link href={card.href}>
                  <Card
                    variant="glow"
                    className="group h-full cursor-pointer hover:-translate-y-1"
                  >
                    <div
                      className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${card.accent}`}
                    />
                    <h3 className="font-display text-xl font-semibold transition-colors group-hover:text-da-indigo">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-da-muted">{card.desc}</p>
                    <span className="mt-4 inline-block text-sm text-da-indigo transition-transform group-hover:translate-x-1">
                      Explore &rarr;
                    </span>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── STATS BAR ── */}
      <section className="border-y border-da-border bg-da-surface/30 px-6 py-16">
        {/* StaggerContainer staggers each counter's entrance */}
        <StaggerContainer className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
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

      <ShimmerLine className="opacity-50" />

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb color="purple" size="lg" className="-left-20 top-0" />
        <GlowOrb color="indigo" size="md" className="-right-20 bottom-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <p className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              You have 47 subscriptions and{" "}
              <span className="text-da-cyan">$0 in results.</span>
            </p>
            <p className="mt-4 text-xl text-da-muted">That ends today.</p>
            <div className="mt-8 flex justify-center">
              <MagneticWrapper strength={0.25}>
                <Button
                  href={SITE.skoolUrl}
                  external
                  variant="accent"
                  size="lg"
                >
                  Join Digital Alchemy
                </Button>
              </MagneticWrapper>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
