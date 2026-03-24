import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { SITE } from "@/lib/constants";
import { stats } from "@/data/stats";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        {/* Background effects */}
        <GlowOrb color="indigo" size="lg" className="top-20 -left-32" />
        <GlowOrb color="purple" size="md" className="bottom-20 right-10" />
        <GlowOrb color="amber" size="sm" className="top-1/2 right-1/3" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Credential badge */}
          <FadeInOnScroll>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-da-border bg-da-surface/60 px-4 py-2 text-sm text-da-muted backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-da-amber animate-pulse" />
              Taught by a {SITE.credential}
            </div>
          </FadeInOnScroll>

          {/* Main headline */}
          <FadeInOnScroll delay={100}>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Stop Learning AI.
              <br />
              <span className="bg-gradient-to-r from-da-indigo via-da-purple to-da-amber bg-clip-text text-transparent animate-pulse-glow">
                Start Building With It.
              </span>
            </h1>
          </FadeInOnScroll>

          {/* Subheadline */}
          <FadeInOnScroll delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted sm:text-xl">
              Transform from scattered AI consumer to asset-owning creator in
              100 days. Real projects. Real portfolio. Real results.
            </p>
          </FadeInOnScroll>

          {/* CTAs */}
          <FadeInOnScroll delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href={SITE.skoolUrl}
                external
                variant="accent"
                size="lg"
              >
                Become an Alchemist
              </Button>
              <Button href="/portfolio" variant="outline" size="lg">
                See What We Build
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ── FEATURED CARDS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeInOnScroll>
            <SectionHeading
              title="What We Do"
              subtitle="We don't teach AI. We make you BUILD with it."
            />
          </FadeInOnScroll>

          <div className="grid gap-6 md:grid-cols-3">
            {[
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
                accent: "from-da-purple to-da-amber",
              },
              {
                title: "The Portfolio",
                desc: "Music, art, apps, tools — proof that creators can build real things with AI.",
                href: "/portfolio",
                accent: "from-da-amber to-da-indigo",
              },
            ].map((card, i) => (
              <FadeInOnScroll key={card.title} delay={i * 100}>
                <Link href={card.href}>
                  <Card
                    variant="glow"
                    className="group h-full cursor-pointer hover:-translate-y-1"
                  >
                    <div
                      className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${card.accent}`}
                    />
                    <h3 className="font-display text-xl font-semibold group-hover:text-da-indigo transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-da-muted">{card.desc}</p>
                    <span className="mt-4 inline-block text-sm text-da-indigo group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </Card>
                </Link>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-da-border bg-da-surface/30 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb color="purple" size="lg" className="-left-20 top-0" />
        <GlowOrb color="indigo" size="md" className="-right-20 bottom-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <p className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              You have 47 subscriptions and{" "}
              <span className="text-da-amber">$0 in results.</span>
            </p>
            <p className="mt-4 text-xl text-da-muted">That ends today.</p>
            <Button
              href={SITE.skoolUrl}
              external
              variant="accent"
              size="lg"
              className="mt-8"
            >
              Join Digital Alchemy
            </Button>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
