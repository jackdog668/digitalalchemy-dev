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

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
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
