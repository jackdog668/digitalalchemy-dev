import type { Metadata } from "next";
import { Brain, Terminal, Briefcase, Cpu, Sparkles } from "lucide-react";
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
import { BookingWidget } from "@/components/scheduling/BookingWidget";
import { services } from "@/data/services";
import { ServiceSchema } from "@/components/seo/SchemaMarkup";

export const metadata: Metadata = {
  title: "AI Consulting Chicago | App Building & Workshops",
  description:
    "Chicago-based AI consulting, app building, and workshops. We build custom AI systems and vibe coding setups for teams ready to execute.",
  alternates: { canonical: "/services" },
};

// Map service icons to premium Lucide component classes for styled vector rendering
const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  workshop: Terminal,
  portfolio: Briefcase,
  gear: Cpu,
};

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    description:
      "We learn your goals, your constraints, and what success actually looks like for your team.",
  },
  {
    step: "02",
    title: "System Design",
    description:
      "We map out the solution — which tools, which workflows, which deliverables get you to your outcome.",
  },
  {
    step: "03",
    title: "Build Together",
    description:
      "Hands-on implementation. Your team builds alongside us — learning by doing, not by watching a presentation.",
  },
  {
    step: "04",
    title: "Ship It",
    description:
      "Launch, test, and optimize. You walk away with working systems and the skills to maintain them.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema title={metadata.title as string} description={metadata.description as string} />
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="indigo" size="lg" className="-right-32 top-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              We Build AI Systems{" "}
              <span className="text-da-indigo">for Brands and Teams.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              Consulting, workshops, and custom tools for organizations ready to
              put AI to work — not just talk about it.
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
                  <div className="mb-3 text-da-cyan">
                    {(() => {
                      const IconComponent = serviceIcons[service.icon] || Sparkles;
                      return <IconComponent className="w-8 h-8 stroke-[1.5]" />;
                    })()}
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

      {/* ── THE WINDOW / MARKET STATS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              The Opportunity Is{" "}
              <span className="text-da-cyan">Right Now.</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted max-w-2xl mx-auto">
              The same window web developers had in the early 2000s and cloud
              consultants had in the 2010s — that&apos;s exactly where AI
              services are today. The businesses that move first win the most.
            </p>
          </FadeInOnScroll>

          <StaggerContainer
            className="mt-12 grid gap-6 md:grid-cols-3"
            staggerDelay={0.12}
          >
            {[
              {
                stat: "63%",
                label: "of active vibe coders have no traditional dev background",
              },
              {
                stat: "$9B",
                label: "Replit's 2026 valuation — proof the market is real",
              },
              {
                stat: "2M+",
                label: "Suno paid subscribers — AI music is mainstream",
              },
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

      {/* ── INLINE BOOKING CTA ── */}
      <section className="relative px-6 py-24 bg-da-surface/20 overflow-hidden">
        <GlowOrb color="purple" size="md" className="-left-20 top-10" />

        <div className="relative mx-auto max-w-5xl">
          <FadeInOnScroll>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Let&apos;s Build{" "}
                <span className="text-da-cyan">Something.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-da-muted">
                Ready to put AI to work for your team? Pick a time below —
                we&apos;ll talk about what you need and map out next steps.
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={150}>
            <div className="mt-12">
              <BookingWidget slug="introcall" height={900} />
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={250}>
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-da-muted">
                Prefer email?{" "}
                <a
                  href="mailto:hello@digitalalchemy.dev"
                  className="text-da-indigo underline decoration-da-indigo/40 underline-offset-4 hover:decoration-da-indigo"
                >
                  hello@digitalalchemy.dev
                </a>
              </p>
              <Button href="/portfolio" variant="outline" size="md">
                See Our Work
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
