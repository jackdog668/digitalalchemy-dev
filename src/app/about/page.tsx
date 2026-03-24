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

const creedLines = [
  { text: "I am not a consumer. I am a creator.", emphasis: true },
  { text: "I don\u2019t collect courses. I build systems.", emphasis: false },
  { text: "I don\u2019t follow trends. I design workflows.", emphasis: false },
  {
    text: "I don\u2019t hope for clarity. I architect outcomes.",
    emphasis: false,
  },
  { text: "My stack is intentional.", emphasis: false },
  { text: "My skills compound.", emphasis: false },
  { text: "My output has value.", emphasis: false },
  { text: "I am done being vague.", emphasis: false },
  { text: "I am done being passive.", emphasis: false },
  { text: "I am done being a follower.", emphasis: false },
];

export default function AboutPage() {
  return (
    <>
      {/* ── STORY ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="indigo" size="lg" className="-right-32 top-20" />

        <div className="relative mx-auto max-w-4xl">
          <FadeInOnScroll>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-da-border bg-da-surface/60 px-4 py-2 text-sm text-da-cyan">
              {SITE.credential}
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              I got tired of watching people{" "}
              <span className="text-da-cyan">learn forever</span> and{" "}
              <span className="text-da-indigo">build nothing.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="mt-8 space-y-6 text-lg text-da-muted leading-relaxed">
              <p>
                I&apos;m Desmond Baker Jr — founder of Digital Alchemy and DB
                Creations LLC. For over 10 years I&apos;ve been in creative
                education, and I kept seeing the same pattern: talented people
                consume endless tutorials, buy every course, open 47 browser
                tabs, and still have <span className="text-da-text font-semibold">nothing to show for it</span>.
              </p>
              <p>
                I went deep into AI — Midjourney for Afrocentric surrealism art,
                Suno for original music production, Cursor and Bolt for vibe
                coding real applications. I built 340+ AI-created assets, 45+
                original music tracks, 27+ app blueprints. Then I realized: the
                value isn&apos;t in knowing the tools. It&apos;s in having a{" "}
                <span className="text-da-text font-semibold">system</span> that
                makes you build with them.
              </p>
              <p>
                So I built Digital Alchemy — not a course (courses create
                consumers who &quot;learned something&quot;). A 100-day system
                where you create 340+ assets with YOUR name on them. With
                commercial rights. Where you walk away as an Alchemist, not a
                student.
              </p>
              <p>
                I&apos;m a Gemini Certified Educator — officially recognized by
                Google. I&apos;ve spoken on the main stage at AI Tinkerers
                demoing Agent Forge. I&apos;m involved with the Compass Detroit
                IWD Innovation Summit. But credentials don&apos;t mean shit if
                you can&apos;t help people build real things. That&apos;s what
                this is about.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── MY STACK ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="The Alchemist's Stack"
            subtitle="The tools I use every day to build, create, and teach."
          />

          <StaggerContainer
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            staggerDelay={0.08}
          >
            {[
              { name: "Claude Code", role: "AI development partner" },
              { name: "Cursor", role: "AI code editor" },
              { name: "Midjourney", role: "AI art & visual creation" },
              { name: "Suno", role: "AI music production" },
              { name: "Google AI Studio", role: "Gemini API & prototyping" },
              { name: "Firebase", role: "Auth, database, hosting" },
              { name: "Vercel", role: "App deployment" },
              { name: "Notion", role: "Docs, wiki, task hub" },
            ].map((tool) => (
              <StaggerItem key={tool.name}>
                <Card variant="default" className="text-center py-4">
                  <p className="font-display text-sm font-semibold text-da-text">
                    {tool.name}
                  </p>
                  <p className="text-xs text-da-muted mt-1">{tool.role}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── MISSION / PILLARS ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="What We Stand For"
            subtitle="Five pillars that separate Alchemists from consumers."
          />

          <StaggerContainer
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
          >
            {pillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
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
                      <span className="text-da-cyan">&#10003;</span>
                      <span className="text-da-text">{pillar.alchemist}</span>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── THE ALCHEMIST CREED ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title="The Alchemist Creed" />

          <FadeInOnScroll delay={100}>
            <Card
              variant="glow"
              className="relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-da-indigo/5 to-da-purple/5" />
              <div className="relative py-8">
                <StaggerContainer
                  className="space-y-4 font-display text-lg leading-relaxed sm:text-xl"
                  staggerDelay={0.07}
                >
                  {creedLines.map((line) => (
                    <StaggerItem key={line.text}>
                      <p
                        className={
                          line.emphasis
                            ? "font-semibold text-da-text"
                            : "text-da-muted"
                        }
                      >
                        {line.text}
                      </p>
                    </StaggerItem>
                  ))}
                  <StaggerItem>
                    <p className="pt-4 text-2xl font-bold text-da-cyan">
                      I am an Alchemist.
                    </p>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </Card>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── CREDENTIALS / CTA ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Not theory.{" "}
              <span className="text-da-indigo">Proven execution.</span>
            </h2>
          </FadeInOnScroll>

          <StaggerContainer
            className="mt-8 flex flex-wrap justify-center gap-4"
            staggerDelay={0.1}
          >
            {[
              { highlight: "Google", label: "Gemini Certified Educator" },
              { highlight: "10+", label: "Years in Creative Education" },
              { highlight: "340+", label: "AI Assets (Music, Art, Video, Code)" },
              { highlight: "45+", label: "Original AI Music Tracks" },
              { highlight: "27+", label: "App Blueprints Built" },
              { highlight: "Main Stage", label: "AI Tinkerers Speaker" },
            ].map((cred) => (
              <StaggerItem key={cred.label}>
                <div className="rounded-lg border border-da-border bg-da-surface px-6 py-3 text-sm">
                  <span className="text-da-cyan font-semibold">{cred.highlight}</span>{" "}
                  <span className="text-da-muted">{cred.label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInOnScroll delay={400}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href={SITE.skoolUrl}
                external
                variant="accent"
                size="lg"
              >
                Join the Builders
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
