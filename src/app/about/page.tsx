import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Desmond Baker Jr — Gemini Certified Educator, founder of Digital Alchemy, and the person who will make you stop watching tutorials and start building.",
};

const pillars = [
  {
    title: "Building Over Learning",
    consumer: "Watches tutorials",
    alchemist: "Ships projects",
  },
  {
    title: "Ownership Over Consumption",
    consumer: "Collects courses",
    alchemist: "Owns 340+ assets",
  },
  {
    title: "Systems Over Information",
    consumer: "Has 47 browser tabs",
    alchemist: "Has a structured stack",
  },
  {
    title: "Community Over Isolation",
    consumer: "Builds alone",
    alchemist: "Never builds alone",
  },
  {
    title: "Execution Over Knowledge",
    consumer: "Knows everything",
    alchemist: "Ships everything",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── STORY ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="indigo" size="lg" className="-right-32 top-20" />

        <div className="relative mx-auto max-w-4xl">
          <FadeInOnScroll>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-da-border bg-da-surface/60 px-4 py-2 text-sm text-da-amber">
              {SITE.credential}
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              I got tired of watching people{" "}
              <span className="text-da-amber">learn forever</span> and{" "}
              <span className="text-da-indigo">build nothing.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="mt-8 space-y-6 text-lg text-da-muted leading-relaxed">
              <p>
                I&apos;m Desmond Baker Jr — founder of Digital Alchemy and DB
                Creations LLC. For over 10 years I&apos;ve been in creative
                education, watching the same pattern repeat: talented people
                consume endless tutorials, buy every course, and still have
                nothing to show for it.
              </p>
              <p>
                So I built a system. Not a course — a{" "}
                <span className="text-da-text font-semibold">system</span>.
                One that takes you from scattered AI consumer to asset-owning
                creator in 100 days. Where you walk away with 340+ assets that
                have YOUR name on them. With commercial rights.
              </p>
              <p>
                I&apos;m a Gemini Certified Educator — officially recognized
                by Google. But credentials don&apos;t mean shit if you
                can&apos;t help people build real things. That&apos;s what
                Digital Alchemy is about.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ── MISSION / PILLARS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <FadeInOnScroll>
            <SectionHeading
              title="What We Stand For"
              subtitle="Five pillars that separate Alchemists from consumers."
            />
          </FadeInOnScroll>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <FadeInOnScroll key={pillar.title} delay={i * 80}>
                <Card variant="feature" className="h-full">
                  <h3 className="font-display text-lg font-semibold text-da-text">
                    {pillar.title}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">&#10005;</span>
                      <span className="text-da-muted">{pillar.consumer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-da-amber">&#10003;</span>
                      <span className="text-da-text">{pillar.alchemist}</span>
                    </div>
                  </div>
                </Card>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE ALCHEMIST CREED ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <FadeInOnScroll>
            <SectionHeading title="The Alchemist Creed" />
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <Card
              variant="glow"
              className="relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-da-indigo/5 to-da-purple/5" />
              <div className="relative space-y-4 py-8 font-display text-lg leading-relaxed sm:text-xl">
                <p className="font-semibold text-da-text">
                  I am not a consumer. I am a creator.
                </p>
                <div className="space-y-2 text-da-muted">
                  <p>I don&apos;t collect courses. I build systems.</p>
                  <p>I don&apos;t follow trends. I design workflows.</p>
                  <p>
                    I don&apos;t hope for clarity. I architect outcomes.
                  </p>
                </div>
                <div className="space-y-2 text-da-muted">
                  <p>My stack is intentional.</p>
                  <p>My skills compound.</p>
                  <p>My output has value.</p>
                </div>
                <div className="space-y-2 text-da-muted">
                  <p>I am done being vague.</p>
                  <p>I am done being passive.</p>
                  <p>I am done being a follower.</p>
                </div>
                <p className="pt-4 text-2xl font-bold text-da-amber">
                  I am an Alchemist.
                </p>
              </div>
            </Card>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ── CREDENTIALS / CTA ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Not theory.{" "}
              <span className="text-da-indigo">Proven execution.</span>
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="rounded-lg border border-da-border bg-da-surface px-6 py-3 text-sm">
                <span className="text-da-amber font-semibold">Google</span>{" "}
                <span className="text-da-muted">
                  Gemini Certified Educator
                </span>
              </div>
              <div className="rounded-lg border border-da-border bg-da-surface px-6 py-3 text-sm">
                <span className="text-da-amber font-semibold">10+</span>{" "}
                <span className="text-da-muted">
                  Years in Creative Education
                </span>
              </div>
              <div className="rounded-lg border border-da-border bg-da-surface px-6 py-3 text-sm">
                <span className="text-da-amber font-semibold">340+</span>{" "}
                <span className="text-da-muted">AI Assets Created</span>
              </div>
            </div>
            <Button
              href={SITE.skoolUrl}
              external
              variant="accent"
              size="lg"
              className="mt-10"
            >
              Join the Builders
            </Button>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
