import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
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

      <ShimmerLine />

      {/* ── SERVICE CARDS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="What We Offer"
            subtitle="Every service ends with something shipped."
          />

          <StaggerContainer
            className="grid gap-6 md:grid-cols-2"
            staggerDelay={0.12}
          >
            {services.map((service) => (
              <StaggerItem key={service.title}>
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
                        <span className="text-da-cyan text-xs">&#9670;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {"pricing" in service && (
                    <div className="mt-4 pt-4 border-t border-da-border">
                      <span className="text-sm font-semibold text-da-cyan">
                        {(service as { pricing: string }).pricing}
                      </span>
                    </div>
                  )}
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── MARKET STATS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              The Window Is{" "}
              <span className="text-da-cyan">Right Now.</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted max-w-2xl mx-auto">
              The same opportunity web developers had in the early 2000s and
              cloud consultants had in the 2010s — that&apos;s where AI is today.
            </p>
          </FadeInOnScroll>

          <StaggerContainer
            className="mt-12 grid gap-6 md:grid-cols-3"
            staggerDelay={0.12}
          >
            {[
              { stat: "63%", label: "of active vibe coders are non-developers" },
              { stat: "$9B", label: "Replit valuation (2026)" },
              { stat: "2M+", label: "Suno paid subscribers" },
            ].map((item) => (
              <StaggerItem key={item.label}>
                <Card variant="default" className="text-center">
                  <p className="font-display text-3xl font-bold text-da-cyan">
                    {item.stat}
                  </p>
                  <p className="mt-2 text-sm text-da-muted">{item.label}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── PROCESS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            title="How We Work"
            subtitle="A system, not a sales pitch."
          />

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-da-indigo via-da-purple to-da-cyan hidden sm:block" />

            <StaggerContainer className="space-y-12" staggerDelay={0.15}>
              {processSteps.map((step) => (
                <StaggerItem key={step.step}>
                  <div className="flex gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-da-surface border border-da-border font-display text-sm font-bold text-da-cyan">
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
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      <ShimmerLine />

      {/* ── CONTACT CTA ── */}
      <section className="relative px-6 py-24 bg-da-surface/20 overflow-hidden">
        <GlowOrb color="purple" size="md" className="-left-20 top-10" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Let&apos;s Build{" "}
              <span className="text-da-cyan">Something.</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Ready to stop brainstorming and start shipping? Let&apos;s talk
              about what your team needs.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href="mailto:hello@digitalalchemy.dev"
                variant="accent"
                size="lg"
              >
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
