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
import { SITE } from "@/lib/constants";
import { modules } from "@/data/modules";

export const metadata: Metadata = {
  title: "School",
  description:
    "This is NOT a course. It's a 100-day system that transforms you from AI consumer to asset-owning creator. 6 forge modules. 340+ deliverables. Yours forever.",
};

const moduleIcons: Record<string, string> = {
  music: "\uD83C\uDFB5",
  palette: "\uD83C\uDFA8",
  shield: "\uD83D\uDEE1\uFE0F",
  code: "\u2328\uFE0F",
  video: "\uD83C\uDFAC",
  dollar: "\uD83D\uDCB0",
};

const testimonials = [
  {
    quote:
      "I went from zero coding experience to shipping my first app in 3 weeks. This system works.",
    name: "Coming Soon",
    role: "Alchemist",
  },
  {
    quote:
      "The accountability alone is worth it. Someone actually notices when you disappear.",
    name: "Coming Soon",
    role: "Alchemist",
  },
  {
    quote:
      "I have a portfolio now. A real one. Not screenshots of tutorials — actual projects I built.",
    name: "Coming Soon",
    role: "Alchemist",
  },
];

export default function SchoolPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="purple" size="lg" className="-left-20 top-20" />
        <GlowOrb color="cyan" size="sm" className="right-20 bottom-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              This is{" "}
              <span className="text-red-400 line-through decoration-2">
                NOT
              </span>{" "}
              a Course.
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              Courses create consumers who &quot;learned something.&quot; We
              create{" "}
              <span className="text-da-cyan font-semibold">Alchemists</span>{" "}
              who build everything.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── TRANSFORMATION PROMISE ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="The 100-Day Transformation"
            subtitle="See the difference between consumers and Alchemists."
          />

          <FadeInOnScroll delay={100}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-da-border">
                    <th className="pb-4 pr-8 font-display text-sm uppercase tracking-wider text-red-400">
                      Consumer
                    </th>
                    <th className="pb-4 font-display text-sm uppercase tracking-wider text-da-cyan">
                      Alchemist
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["Collects courses", "Builds systems"],
                    ["Watches tutorials", "Creates deliverables"],
                    ["Has 47 subscriptions", "Has intentional stack"],
                    ["Hopes for results", "Architects outcomes"],
                    ["Follows trends", "Designs workflows"],
                    ["Scattered across tools", "Unified in their lab"],
                    ["Vague about goals", "Clear on deliverables"],
                    ["Consumes content", "Creates content"],
                    ["Spends on courses", "Earns from skills"],
                  ].map(([consumer, alchemist]) => (
                    <tr
                      key={consumer}
                      className="border-b border-da-border/50"
                    >
                      <td className="py-3 pr-8 text-da-muted">{consumer}</td>
                      <td className="py-3 text-da-text font-medium">
                        {alchemist}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="mt-12 text-center">
              <p className="font-display text-2xl font-bold sm:text-3xl">
                100 Days. 340+ Assets.{" "}
                <span className="text-da-cyan">Your name on all of them.</span>
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── MODULES GRID ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="The 6 Forges"
            subtitle="Each module is a forge where you create real, ownable assets."
          />

          <StaggerContainer
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
          >
            {modules.map((mod) => (
              <StaggerItem key={mod.name}>
                <Card variant="feature" className="h-full">
                  <div className="text-3xl mb-3">
                    {moduleIcons[mod.icon] || "\u2728"}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-da-indigo mb-2">
                    {mod.category}
                  </div>
                  <h3 className="font-display text-lg font-bold text-da-text">
                    {mod.name}
                  </h3>
                  <p className="mt-2 text-sm text-da-muted leading-relaxed">
                    {mod.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-da-cyan/10 px-3 py-1 text-xs font-semibold text-da-cyan">
                    {mod.deliverables}
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="What Alchemists Say"
            subtitle="Real builders, real results."
          />

          <StaggerContainer
            className="grid gap-6 md:grid-cols-3"
            staggerDelay={0.12}
          >
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.quote}>
                <Card variant="default" className="h-full">
                  <p className="text-sm text-da-muted italic leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-4 border-t border-da-border pt-4">
                    <p className="text-sm font-semibold text-da-text">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-da-muted">{testimonial.role}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── CTA ── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <GlowOrb color="cyan" size="lg" className="-right-20 top-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to stop collecting and{" "}
              <span className="text-da-cyan">start creating?</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Join the Alchemists. Build real things. Own everything.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href={SITE.skoolUrl}
                external
                variant="accent"
                size="lg"
              >
                Become an Alchemist
              </Button>
              <Button
                href={SITE.skoolUrl}
                external
                variant="outline"
                size="lg"
              >
                Start 7-Day Free Trial
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
