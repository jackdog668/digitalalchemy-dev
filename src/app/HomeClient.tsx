"use client";

import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { HeroSocialReveal } from "@/components/ui/HeroSocialReveal";
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
import { GlossyFloatingBubbles } from "@/components/effects/GlossyFloatingBubbles";
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

export default function HomeClient() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        {/* WebGL background scene */}
        <UnicornHero />

        <GlossyFloatingBubbles />

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

          {/* Click-to-reveal social strip. Mount-animated (not scroll-triggered)
              so the pill is visible immediately on every phone size — the old
              FadeInOnScroll wrapper kept icons at opacity 0 below the fold on
              small phones. See HeroSocialReveal.tsx for the why. */}
          <div className="mt-10 flex justify-center">
            <HeroSocialReveal limit={5} />
          </div>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── TESTIMONIALS ── */}
      {/*
        Real quotes pulled from Granola meeting transcripts of Desi's
        1-on-1 and cohort sessions. Names are first-name-only at
        Granola's granularity. TODO(Desi): text Lisa and Ebone to
        confirm they're OK with being quoted on the public
        site before leaving these live long-term. Any removal request
        is a 10-second edit in this file.
      */}
      <section className="relative px-6 py-24 overflow-hidden">
        <GlowOrb color="purple" size="md" className="-right-20 top-20" />
        <div className="relative mx-auto max-w-6xl">
          <FadeInOnScroll>
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider text-da-cyan">
                What students are saying
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                Real people.{" "}
                <span className="text-da-indigo">Real breakthroughs.</span>
              </h2>
            </div>
          </FadeInOnScroll>

          {/* Editorial pull-quotes — no cards, alternating left/right alignment,
              big display-font quote text, mono attribution. Strips the "AI box"
              feel by letting the quotes breathe instead of caging them. */}
          <div className="mt-16 space-y-16">
            {[
              {
                quote:
                  "You ain't been nothing but a blessing. I really enjoy this. I know I have the potential — I just needed a little bit of guidance.",
                name: "Lisa",
                role: "Midjourney student · 1-on-1 session",
              },
              {
                quote:
                  "This is why you're a threat. How do you come up with this stuff?",
                name: "Ebone",
                role: "1-on-1 student · Google AI Studio",
              },
            ].map((t, i) => (
              <FadeInOnScroll key={t.name} delay={i * 120}>
                <figure
                  className={`max-w-3xl ${
                    i % 2 === 1 ? "ml-auto text-right" : ""
                  }`}
                >
                  <blockquote className="font-display text-2xl font-medium leading-snug text-da-text sm:text-3xl md:text-4xl">
                    <span className="text-da-indigo/60">&ldquo;</span>
                    {t.quote}
                    <span className="text-da-indigo/60">&rdquo;</span>
                  </blockquote>
                  <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-da-muted">
                    &mdash; {t.name}{" "}
                    <span className="text-da-cyan">/</span> {t.role}
                  </figcaption>
                </figure>
              </FadeInOnScroll>
            ))}
          </div>
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

          {/* Numbered manifesto rows — no cards, no boxes. Big mono index,
              title + description in the middle, explore arrow on the right.
              Hairline dividers between rows carry the structure. */}
          <div className="mt-12 divide-y divide-da-border/40">
            {FEATURED_CARDS.map((card, i) => (
              <FadeInOnScroll key={card.title} delay={i * 100}>
                <Link
                  href={card.href}
                  className="group block py-10 transition-colors"
                >
                  <div className="grid grid-cols-[auto_1fr] gap-6 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-12">
                    <div className="font-mono text-3xl leading-none text-da-cyan transition-transform group-hover:-translate-y-0.5 md:text-5xl">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-da-text transition-colors group-hover:text-da-indigo md:text-3xl">
                        {card.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-da-muted">
                        {card.desc}
                      </p>
                    </div>
                    <span className="col-start-2 mt-2 font-mono text-xs uppercase tracking-[0.15em] text-da-indigo transition-transform group-hover:translate-x-1 md:col-start-3 md:mt-0">
                      &rarr; explore
                    </span>
                  </div>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── RECEIPTS (formerly STATS BAR) ──
          Stripped the enclosing chrome — no bg-da-surface bar, no border-y.
          Just a mono kicker + the big numbers living on the page surface. */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <FadeInOnScroll>
            <p className="mb-12 text-center font-mono text-xs uppercase tracking-[0.18em] text-da-cyan">
              // the receipts
            </p>
          </FadeInOnScroll>
          <StaggerContainer className="grid grid-cols-2 gap-10 md:grid-cols-4">
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
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── CALENDAR EMBED ── */}
      <section className="relative px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-5xl">
          <FadeInOnScroll>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Upcoming <span className="text-da-cyan">Events</span>
              </h2>
              <p className="mt-4 text-lg text-da-muted">
                Join us for live classes, workshops, and community events.
              </p>
            </div>
            <div className="w-full bg-da-dark rounded-lg overflow-hidden shadow-xl border border-da-border/50">
              <iframe
                src="https://luma.com/embed/calendar/cal-8VlGboJj3KlpH4j/events"
                width="100%"
                height="600"
                frameBorder="0"
                style={{ border: "1px solid #bfcbda88", borderRadius: "4px" }}
                allowFullScreen={true}
                aria-hidden="false"
                tabIndex={0}
              ></iframe>
            </div>
          </FadeInOnScroll>
        </div>
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
