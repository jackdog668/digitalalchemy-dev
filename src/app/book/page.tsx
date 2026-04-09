import type { Metadata } from "next";
import Link from "next/link";
import { getActiveEventTypes } from "@/lib/scheduling";
import { formatDuration, formatPrice } from "@/lib/scheduling-constants";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a session",
  description:
    "Book a consultation, intro call, or strategy session with Digital Alchemy.",
  alternates: { canonical: "/book" },
  openGraph: {
    type: "website",
    title: "Book a session | Digital Alchemy",
    description:
      "Book a consultation, intro call, or strategy session.",
    url: `${SITE.url}/book`,
    siteName: SITE.name,
  },
};

export default async function BookIndexPage() {
  const eventTypes = await getActiveEventTypes();

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-16">
        <GlowOrb color="purple" size="lg" className="-right-20 top-10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Book a <span className="text-da-cyan">session</span>
          </h1>
          <p className="mt-4 text-lg text-da-muted">
            Pick the type of conversation we should have.
          </p>
        </div>
      </section>

      <ShimmerLine />

      {/* ── MEET DESI ── */}
      {/*
        Trust-building intro card shown above the event-type grid so
        visitors know who they're booking with before they pick a slot.
        To replace the monogram with a real photo: drop a square JPG/PNG
        at `public/desi.jpg` and swap the monogram div for:
          <Image src="/desi.jpg" alt="Desi Baker" width={96} height={96}
                 className="h-24 w-24 shrink-0 rounded-full object-cover" />
      */}
      <section className="px-6 pt-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-da-indigo/20 bg-da-surface/60 p-8 backdrop-blur sm:flex-row sm:items-start">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-da-indigo via-da-purple to-da-cyan font-display text-4xl font-bold text-da-dark shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              aria-hidden="true"
            >
              D
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-da-cyan">
                Your host
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-da-text">
                Hey, I&apos;m Desi.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-da-muted">
                I&apos;ve spent 10+ years teaching creative pros how to build
                real apps with AI — no coding background required. On our
                call we&apos;ll talk about what you&apos;re building, where
                you&apos;re stuck, and exactly what to do next. No pitch. No
                pressure.
              </p>
              <p className="mt-3">
                <span className="inline-block rounded-full border border-da-indigo/30 bg-da-indigo/10 px-3 py-1 text-xs text-da-muted">
                  {SITE.credential}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pt-12 pb-16">
        <p className="mx-auto max-w-5xl text-center text-sm uppercase tracking-wider text-da-muted">
          Pick the type of conversation
        </p>
        <div className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-2">
          {eventTypes.length === 0 && (
            <p className="col-span-full text-center text-da-muted">
              No active event types yet. Check back soon.
            </p>
          )}
          {eventTypes.map((et) => (
            <Link
              key={et.id}
              href={`/book/${et.slug}`}
              className="group rounded-xl border border-da-indigo/20 bg-da-surface p-6 transition-all hover:-translate-y-1 hover:border-da-indigo/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
            >
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: et.color }}
              />
              <h2 className="font-display text-xl font-semibold transition-colors group-hover:text-da-indigo">
                {et.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-da-muted">
                {et.description}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-da-muted">
                <span>{formatDuration(et.durationMinutes)}</span>
                <span className="h-1 w-1 rounded-full bg-da-muted" />
                <span>{formatPrice(et.priceCents, et.currency)}</span>
              </div>
              <span className="mt-4 inline-block text-sm text-da-indigo transition-transform group-hover:translate-x-1">
                Book this →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
