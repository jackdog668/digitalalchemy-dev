import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";

export const metadata: Metadata = {
  title: "Checkout cancelled | Digital Alchemy",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <main className="relative px-6 pt-32 pb-24 overflow-hidden">
      <GlowOrb color="purple" size="lg" className="-right-32 top-10" />

      <div className="relative mx-auto max-w-xl text-center">
        <FadeInOnScroll>
          <p className="text-sm uppercase tracking-wider text-da-muted">
            Checkout cancelled
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            No charge — your card wasn&apos;t touched.
          </h1>
          <p className="mt-6 text-da-muted leading-relaxed">
            Changed your mind, or hit a snag? Either is fine. If something
            went sideways, drop us a line — we&apos;ll sort it.
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={100}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/pricing" variant="primary" size="md">
              Back to pricing
            </Button>
            <Link
              href="mailto:hello@digitalalchemy.dev"
              className="rounded-full border border-da-border px-5 py-2 text-sm text-da-muted hover:border-da-cyan/40 hover:text-da-text"
            >
              Email us
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </main>
  );
}
