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
import { CourseSchema } from "@/components/seo/SchemaMarkup";

export const metadata: Metadata = {
  title: "The School | 100-Day Vibe Coding & AI App Building Program",
  description:
    "Join our live vibe coding and AI app building classes. Create real projects step by step. Accessible AI education and consulting for everyone, based in Chicago, IL.",
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
      "I went from zero coding experience to shipping my first app in 3 weeks. I literally cried.",
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
      <CourseSchema title={metadata.title as string} description={metadata.description as string} />
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="purple" size="lg" className="-left-20 top-20" />
        <GlowOrb color="cyan" size="sm" className="right-20 bottom-10" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              Learn by Building.{" "}
              <span className="text-da-cyan">Not by Watching.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              Live classes every week where you create real projects — apps,
              music, art, and tools — step by step, with me. If you can follow
              along with a recipe, you can do this.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── WHAT MAKES THIS DIFFERENT ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title={`Here's How Most AI "Courses" Work vs. How We Work`}
          />

          <FadeInOnScroll delay={100}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-da-border">
                    <th className="pb-4 pr-8 font-display text-sm uppercase tracking-wider text-da-muted">
                      The Typical Course
                    </th>
                    <th className="pb-4 font-display text-sm uppercase tracking-wider text-da-cyan">
                      Digital Alchemy
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    [
                      "Pre-recorded videos you watch alone",
                      "Live classes where you build alongside me",
                    ],
                    [
                      '"Here\'s what AI can do"',
                      '"Open your laptop. We\'re building this right now."',
                    ],
                    [
                      "You finish feeling informed",
                      "You finish with a working project",
                    ],
                    [
                      "No one notices if you disappear",
                      "Your community checks in on you",
                    ],
                    [
                      "You learn a tool",
                      "You learn a skill you can sell",
                    ],
                  ].map(([typical, alchemy]) => (
                    <tr
                      key={typical}
                      className="border-b border-da-border/50"
                    >
                      <td className="py-3 pr-8 text-da-muted">{typical}</td>
                      <td className="py-3 text-da-text font-medium">
                        {alchemy}
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
                100 days. 340+ assets.{" "}
                <span className="text-da-cyan">Everything has your name on it.</span>
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── THE 6 MODULES ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="What You'll Build"
            subtitle="Each module focuses on a different creative skill. By the end, you don't just understand AI — you have a portfolio to prove it."
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

      {/* ── THE AAAS FRAMEWORK ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            title="How Alchemists Turn AI Skills Into Income"
            subtitle="This is exactly what web developers did in the early 2000s and cloud consultants did in the 2010s. We're in that same window right now — and you're early."
          />

          <StaggerContainer className="space-y-8" staggerDelay={0.15}>
            {[
              {
                step: "01",
                title: "The Audit",
                price: "$0–500",
                description:
                  "You sit down with a small business owner and ask three simple questions: What takes you the most time every week? What tasks do you keep putting off? Where are you copy-pasting between apps? That conversation reveals where AI can help — and that's your first paid engagement.",
              },
              {
                step: "02",
                title: "The Build",
                price: "$500–2,000",
                description:
                  "Now you build the solution. A custom AI tool, an automated workflow, an internal system. Using the exact same skills you learned in class. The client sees results in days, not months.",
              },
              {
                step: "03",
                title: "The Retainer",
                price: "$1,500–3,000/mo",
                description:
                  "Ongoing maintenance, updates, and improvements. Recurring revenue. One client at $2,000/month is $24,000/year. Five clients is six figures. That's not a fantasy — that's math.",
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-da-surface border border-da-border font-display text-sm font-bold text-da-cyan">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-xl font-semibold text-da-text">
                        {item.title}
                      </h3>
                      <span className="text-sm font-semibold text-da-cyan">
                        {item.price}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-da-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── YOU'RE NOT BUILDING ALONE ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="You're Not Building Alone"
            subtitle="The support system that keeps you going."
          />

          <StaggerContainer
            className="grid gap-6 md:grid-cols-3"
            staggerDelay={0.12}
          >
            <StaggerItem>
              <Card variant="glow" className="h-full text-center">
                <h3 className="font-display text-lg font-bold text-da-text">
                  Accountability Partners
                </h3>
                <p className="mt-2 text-sm text-da-muted">
                  You get paired with another member. Someone who checks in when
                  you miss a class. Someone who celebrates when you ship
                  something. Members with partners are{" "}
                  <span className="text-da-cyan font-semibold">
                    4x more likely to finish
                  </span>
                  .
                </p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card variant="glow" className="h-full text-center">
                <h3 className="font-display text-lg font-bold text-da-text">
                  Community + Collaboration
                </h3>
                <p className="mt-2 text-sm text-da-muted">
                  A group of women who are all figuring this out together. No
                  judgment. No gatekeeping. Just people who understand what it
                  feels like to try something new and scary — and do it anyway.
                </p>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card variant="glow" className="h-full text-center">
                <h3 className="font-display text-lg font-bold text-da-text">
                  Direct Access to Me
                </h3>
                <p className="mt-2 text-sm text-da-muted">
                  This is a small community on purpose. You&apos;re not support
                  ticket #4,927. You ask a question, I answer it. You get stuck,
                  we figure it out together.
                </p>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── TESTIMONIALS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="What Alchemists Are Saying"
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
              Ready to stop watching and{" "}
              <span className="text-da-cyan">start building?</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Join the Alchemists. Build real things. Own everything you create.
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
                Start Your 7-Day Free Trial
              </Button>
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
