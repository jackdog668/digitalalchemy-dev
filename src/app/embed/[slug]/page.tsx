import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventTypeBySlug } from "@/lib/scheduling";
import { BookingFlow } from "@/app/book/[slug]/BookingFlow";
import { ChromeHider } from "./ChromeHider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

// Noindex for all embed variants — we don't want search engines indexing
// the chromeless copy of the booking page. Canonical still points at the
// full /book/[slug] version (set in the main page's metadata).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EmbedBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);
  if (!eventType || eventType.status !== "active") notFound();

  return (
    <>
      <ChromeHider />
      <section className="px-4 py-6">
        <BookingFlow eventType={eventType} />
      </section>
    </>
  );
}
