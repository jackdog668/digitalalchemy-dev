import type { Metadata } from "next";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { Card } from "@/components/ui/Card";
import { EventSchema } from "@/components/seo/SchemaMarkup";

export const metadata: Metadata = {
  title: "Chicago AI Events | Digital Alchemy",
  description: "Upcoming AI events, live vibe coding classes, and app building workshops in Chicago and online.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <>
      <EventSchema name="Digital Alchemy Upcoming Events" description={metadata.description as string} />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-12">
        <GlowOrb color="cyan" size="lg" className="-left-20 top-10" />
        <GlowOrb color="indigo" size="md" className="-right-10 top-32" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Upcoming <span className="glow-text">Events</span>
            </h1>
          </FadeInOnScroll>
          <FadeInOnScroll delay={150}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted sm:text-xl">
              Join us for live classes, workshops, and community events. Register below to secure your spot.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      {/* ── CALENDAR EMBED ── */}
      <section className="relative px-6 py-20">
        <FadeInOnScroll>
          <Card
            variant="glow"
            hover={false}
            className="mx-auto max-w-4xl p-2 sm:p-4 overflow-hidden"
          >
            <div className="w-full bg-da-surface rounded overflow-hidden">
              <iframe
                src="https://luma.com/embed/calendar/cal-8VlGboJj3KlpH4j/events"
                width="100%"
                height="600"
                frameBorder="0"
                style={{ border: "1px solid #bfcbda88", borderRadius: "4px" }}
                allowFullScreen={true}
                aria-hidden="false"
                tabIndex={0}
              ></iframe>
            </div>
          </Card>
        </FadeInOnScroll>
      </section>
    </>
  );
}
