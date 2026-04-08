import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventTypeBySlug } from "@/lib/scheduling";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { ShimmerLine } from "@/components/effects/ShimmerLine";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmedPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { token } = await searchParams;
  const eventType = await getEventTypeBySlug(slug);
  if (!eventType) notFound();

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-16">
        <GlowOrb color="cyan" size="lg" className="-right-20 top-10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-wider text-da-cyan">
            All set
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            Your booking is <span className="glow-text">confirmed</span>
          </h1>
          <p className="mt-6 text-lg text-da-muted">
            Check your inbox — you&apos;ll get a confirmation email with the
            event details and a calendar invite.
          </p>
        </div>
      </section>

      <ShimmerLine />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-xl border border-da-border bg-da-surface p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">
            {eventType.title}
          </h2>
          <p className="mt-2 text-da-muted">{eventType.description}</p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-lg border border-da-border px-5 py-3 text-sm font-semibold hover:border-da-indigo"
            >
              Back to home
            </Link>
            {token && (
              <Link
                href={`/scheduling/cancel/${encodeURIComponent(token)}`}
                className="text-sm text-da-muted hover:text-red-400"
              >
                Need to cancel?
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
