"use client";

import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { ShimmerLine } from "@/components/effects/ShimmerLine";

export default function TalkPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-12">
        <GlowOrb color="indigo" size="lg" className="-left-20 top-10" />
        <GlowOrb color="purple" size="md" className="-right-10 top-32" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Talk to the <span className="glow-text">Alchemist</span>
            </h1>
          </FadeInOnScroll>
          <FadeInOnScroll delay={150}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted sm:text-xl">
              Ask about courses, projects, vibe coding — the agent is
              listening. Tap the bubble below to start the conversation.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── WIDGET ── */}
      <section className="relative px-6 py-20">
        <FadeInOnScroll>
          <Card
            variant="glow"
            hover={false}
            className="mx-auto flex min-h-[560px] max-w-3xl items-center justify-center p-4 sm:p-8"
          >
            <div className="w-full">
              <elevenlabs-convai agent-id="agent_5801knndc7b9ekert03h7qakd7zr" />
            </div>
          </Card>
        </FadeInOnScroll>

        <div className="mt-12 flex justify-center">
          <Button href="/" variant="outline" size="lg">
            ← Back to Home
          </Button>
        </div>
      </section>

      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
