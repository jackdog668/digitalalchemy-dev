import { SITE } from "@/lib/constants";

interface BookingWidgetProps {
  /** Event type slug — must match an active row in scheduling_event_types. */
  slug: string;
  /**
   * Iframe height in px. The embedded booking flow is ~700–900px tall
   * depending on the step (calendar picker vs form), so 880 is a safe
   * default that avoids inner scrolling in most cases.
   */
  height?: number;
  /**
   * Optional extra classes on the wrapper. The wrapper is a full-width
   * responsive container by default (max-w-3xl, centered).
   */
  className?: string;
  /**
   * Optional title attribute for accessibility. Screen readers read this
   * when the iframe gets focus. Defaults to "Book a session".
   */
  title?: string;
}

// Server Component — drop-in iframe wrapper pointing at /embed/[slug].
// Use on DA marketing pages like /work-with-me or inside MDX blog posts
// via `<BookingWidget slug="discovery-call" />`.
//
// For THIRD-PARTY sites (e.g. another creator embedding Desi's booking
// flow on their Squarespace), they should hand-copy this iframe snippet
// with an absolute src:
//
//   <iframe src="https://digitalalchemy.dev/embed/<slug>" ... />
//
// /embed/* is served with `Content-Security-Policy: frame-ancestors *`
// (see next.config.ts) so any origin may iframe it. Tighten per-partner
// if that ever becomes a concern.
export function BookingWidget({
  slug,
  height = 880,
  className,
  title = "Book a session",
}: BookingWidgetProps) {
  const src = `${SITE.url}/embed/${encodeURIComponent(slug)}`;
  return (
    <div className={className ?? "mx-auto w-full max-w-3xl"}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="w-full rounded-xl border border-da-border bg-da-dark"
        style={{ height, colorScheme: "dark" }}
        // No allow-* permissions needed for a booking form.
        // referrerpolicy is permissive enough to let the iframe call its
        // own API routes (which live on the same origin as src).
      />
    </div>
  );
}
