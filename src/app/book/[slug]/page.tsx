import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventTypeBySlug } from "@/lib/scheduling";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { SITE } from "@/lib/constants";
import { BookingFlow } from "./BookingFlow";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const et = await getEventTypeBySlug(slug);
  if (!et || et.status !== "active") return {};
  return {
    title: `Book: ${et.title}`,
    description: et.description,
    alternates: { canonical: `/book/${slug}` },
    openGraph: {
      type: "website",
      title: `Book ${et.title} | ${SITE.name}`,
      description: et.description,
      url: `${SITE.url}/book/${slug}`,
      siteName: SITE.name,
    },
  };
}

export default async function BookEventTypePage({ params }: PageProps) {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);
  if (!eventType || eventType.status !== "active") notFound();

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-12">
        <GlowOrb color="indigo" size="lg" className="-left-20 top-10" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-wider text-da-cyan">
            Book a session
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            Pick a time that works
          </h1>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      <section className="px-6 py-16">
        <BookingFlow eventType={eventType} />
      </section>
    </>
  );
}
