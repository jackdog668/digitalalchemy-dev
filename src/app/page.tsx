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
    desc: "Live classes every week. Step-by-step projects you build alongside me. Walk away with apps, music, art, and a portfolio — all with your name on it.",
    href: "/school",
    accent: "from-da-indigo to-da-purple",
  },
  {
    title: "Our Services",
    desc: "AI consulting, workshops, and custom tools for brands and teams who want to stop talking about AI and start using it.",
    href: "/services",
    accent: "from-da-purple to-da-cyan",
  },
  {
    title: "The Portfolio",
    desc: "Music, art, apps, and tools — built by me and by community members using the exact methods we teach in class.",
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

          {/* Main headline */}
          <FadeInOnScroll delay={100}>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <TextReveal text="You Don't Need a Tech Background." />
              <br />
              <span className="glow-text">You Need the Right Guide.</span>
            </h1>
          </FadeInOnScroll>

          {/* Subheadline */}
          <FadeInOnScroll delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted sm:text-xl">
              Learn to build real apps, create AI music, design stunning
              visuals — and turn those skills into income. No coding experience
              required. Just show up ready to learn.
            </p>
          </FadeInOnScroll>

          {/* CTAs */}
          <FadeInOnScroll delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MagneticWrapper strength={0.25}>
                <Button
                  href={SITE.skoolUrl}
                  external
                  variant="accent"
                  size="lg"
                >
                  Start Your Free Trial
                </Button>
              </MagneticWrapper>
              <Button href="/portfolio" variant="primary" size="lg">
                See What We Build
              </Button>
              <Button href={SITE.beaconsUrl} external variant="outline" size="lg">
                All Links
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
              title="Three Ways to Start Building"
            />
          </FadeInOnScroll>

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
              You&apos;ve been collecting courses.{" "}
              <span className="text-da-cyan">
                It&apos;s time to start creating.
              </span>
            </p>
            <p className="mt-4 text-lg text-da-muted">
              Every subscription promised you results. Most of them just gave
              you more tabs to keep open. Digital Alchemy is different — you
              build real things in every single class. Apps. Music. Art. Tools.
              And when you&apos;re ready, we show you how to sell those skills
              to clients.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
              <Button href={SITE.beaconsUrl} external variant="primary" size="lg">
                All Links
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
