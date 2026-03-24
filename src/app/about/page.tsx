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
  title: "About | AI Education for Women Who Want to Build",
  description:
    "Meet Desmond Baker Jr — Google Gemini Certified Educator, founder of Digital Alchemy, and the guide who will help you go from 'I'm not techy' to 'I just shipped my first app.'",
};

const pillars = [
  {
    title: "Building Over Watching",
    body: "Every class ends with something you made. Not something you watched someone else make.",
  },
  {
    title: "Ownership Over Subscriptions",
    body: "Everything you create here belongs to you. Your name. Your commercial rights. Your portfolio.",
  },
  {
    title: "Systems Over Scattered Tabs",
    body: "We give you one clear path — not 47 browser tabs and a prayer. Each week builds on the last.",
  },
  {
    title: "Community Over Going It Alone",
    body: "You're building alongside other women who are figuring this out too. Nobody's judging. Everybody's helping.",
  },
  {
    title: "Results Over Knowledge",
    body: "Knowing about AI is nice. Having a portfolio of things you actually built with AI? That's the goal.",
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
              I Spent 10 Years Watching Talented People{" "}
              <span className="text-da-cyan">Get Stuck.</span>{" "}
              <span className="text-da-indigo">So I Built a Way Out.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="mt-8 space-y-6 text-lg text-da-muted leading-relaxed">
              <p>
                I&apos;m Desmond Baker Jr — founder of Digital Alchemy and DB
                Creations LLC.
              </p>
              <p>
                For over a decade I&apos;ve worked in creative education, and I
                kept seeing the same pattern: smart, capable people would buy
                every course, watch every tutorial, open 47 browser tabs — and
                still have{" "}
                <span className="text-da-text font-semibold">
                  nothing to show for it
                </span>
                . Not because they weren&apos;t talented. Because nobody gave
                them a real system to follow.
              </p>
              <p>
                So I went deep into AI and built that system myself. I created
                340+ assets — original music with Suno, Afrocentric surrealism
                art with Midjourney, 27+ app blueprints using vibe coding tools.
                I realized the value isn&apos;t in knowing what the tools are.
                It&apos;s in having someone walk you through building real things
                with them.
              </p>
              <p>
                That&apos;s what Digital Alchemy is. Not another course that
                makes you feel productive while you&apos;re watching and lost
                when you&apos;re done. A community where you build alongside me,
                live, every week. Where every project has your name on it. Where
                the women in this community go from &quot;I&apos;m not
                techy&quot; to &quot;I just shipped my first app.&quot;
              </p>
              <p>
                I&apos;m a {SITE.credential}. I&apos;ve spoken on the main
                stage at AI Tinkerers demoing live builds. But honestly, the
                thing I&apos;m most proud of is watching a woman in her 50s who
                &apos;s never written a line of code deploy her first working
                app and say &quot;wait… I made that?&quot;
              </p>
              <p className="text-da-text font-semibold">
                Yeah. You did. And you&apos;re about to make a lot more.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── THE ALCHEMIST'S STACK ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="The Tools We Use Every Week"
            subtitle="You don't need to know these yet — that's what class is for. But here's what powers everything we build."
          />

          <StaggerContainer
            className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            staggerDelay={0.08}
          >
            {[
              { name: "Google AI Studio", role: "Where we prototype ideas with Google's Gemini AI" },
              { name: "GitHub", role: "Where your code lives (your project filing cabinet)" },
              { name: "Antigravity", role: "One-click app deployment — no server setup needed" },
              { name: "Vercel", role: "Where your apps go live on the internet" },
              { name: "Claude", role: "Our AI co-pilot for writing, planning, and building" },
              { name: "Lovable", role: "Visual app builder — drag, drop, and ship" },
              { name: "Suno", role: "AI music creation — full songs from a text description" },
              { name: "Midjourney", role: "AI art and visual design" },
              { name: "Make.com", role: "Connect your apps together with automated workflows" },
              { name: "NotebookLM", role: "AI research and study tool by Google" },
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

      {/* ── WHAT WE STAND FOR ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Five Things That Make This Different"
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
                  <p className="mt-3 text-sm text-da-muted leading-relaxed">
                    {pillar.body}
                  </p>
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
          <StaggerContainer
            className="flex flex-wrap justify-center gap-4"
            staggerDelay={0.1}
          >
            {[
              { highlight: "Google", label: "Gemini Certified Educator" },
              { highlight: "10+", label: "Years in Creative Education" },
              { highlight: "340+", label: "AI Assets Created" },
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
