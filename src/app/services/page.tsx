import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI consulting, vibe coding workshops, portfolio building, and custom AI systems. Build systems, not just ideas.",
};

const serviceIcons: Record<string, string> = {
  brain: "\uD83E\uDDE0",
  workshop: "\uD83D\uDEE0\uFE0F",
  portfolio: "\uD83D\uDCBC",
  gear: "\u2699\uFE0F",
};

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We understand your goals, constraints, and what success looks like for your team.",
  },
  {
    step: "02",
    title: "System Design",
    description:
      "We architect the solution — tools, workflows, and deliverables mapped to your outcomes.",
  },
  {
    step: "03",
    title: "Build Together",
    description:
      "Hands-on implementation. Your team builds alongside us — learning by doing, not watching.",
  },
  {
    step: "04",
    title: "Ship It",
    description:
      "Launch, iterate, and optimize. You walk away with working systems and the skills to maintain them.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="indigo" size="lg" className="-right-32 top-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Build Systems,{" "}
              <span className="text-da-indigo">Not Just Ideas.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              AI consulting, workshops, and custom systems for brands and
              teams who are ready to build — not just brainstorm.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ── SERVICE CARDS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <FadeInOnScroll>
            <SectionHeading
              title="What We Offer"
              subtitle="Every service ends with something shipped."
            />
          </FadeInOnScroll>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, i) => (
              <FadeInOnScroll key={service.title} delay={i * 100}>
                <Card variant="glow" className="h-full">
                  <div className="text-3xl mb-3">
                    {serviceIcons[service.icon] || "\u2728"}
                  </div>
                  <h3 className="font-display text-xl font-bold text-da-text">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-da-muted leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-da-muted"
                      >
                        <span className="text-da-amber text-xs">&#9670;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <FadeInOnScroll>
            <SectionHeading
              title="How We Work"
              subtitle="A system, not a sales pitch."
            />
          </FadeInOnScroll>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-da-indigo via-da-purple to-da-amber hidden sm:block" />

            <div className="space-y-12">
              {processSteps.map((step, i) => (
                <FadeInOnScroll key={step.step} delay={i * 100}>
                  <div className="flex gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-da-surface border border-da-border font-display text-sm font-bold text-da-amber">
                        {step.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-da-text">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-da-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="relative px-6 py-24 bg-da-surface/20 overflow-hidden">
        <GlowOrb color="purple" size="md" className="-left-20 top-10" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Let&apos;s Build{" "}
              <span className="text-da-amber">Something.</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Ready to stop brainstorming and start shipping? Let&apos;s talk
              about what your team needs.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button href="mailto:hello@digitalalchemy.dev" variant="accent" size="lg">
                Book a Call
              </Button>
              <Button href="/portfolio" variant="outline" size="lg">
                See Our Work
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
