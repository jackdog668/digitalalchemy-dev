import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { getProduct } from "@/lib/paypal";
import { lookupOrderById } from "@/lib/payments";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "You're in | Digital Alchemy",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ product?: string; order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { product: slug, order: orderId } = await searchParams;
  const product = slug ? getProduct(slug) : null;

  // Verify the order id actually points at a recorded order before showing
  // it as a reference. Stops fake-receipt URL spoofing (no security
  // entitlement attached to the URL — purely cosmetic — but makes the page
  // honest). Falls through to null if Supabase isn't configured (dev) or
  // lookup fails, in which case we just don't show the order code.
  const verifiedOrder =
    orderId && isSupabaseConfigured() ? await lookupOrderById(orderId) : null;
  const showOrderRef = Boolean(verifiedOrder);

  return (
    <main className="relative px-6 pt-32 pb-24 overflow-hidden">
      <GlowOrb color="cyan" size="lg" className="-right-32 top-10" />
      <GlowOrb color="indigo" size="md" className="-left-20 bottom-0" />

      <div className="relative mx-auto max-w-2xl text-center">
        <FadeInOnScroll>
          <p className="text-sm uppercase tracking-wider text-da-cyan">
            Payment confirmed
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
            You&apos;re <span className="glow-text">in.</span>
          </h1>
          <p className="mt-6 text-lg text-da-muted leading-relaxed">
            {product
              ? `Thanks for buying ${product.name}. Your receipt is on the way to your inbox.`
              : "Thanks for your purchase. Your receipt is on the way to your inbox."}
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={100}>
          <Card variant="glow" hover={false} className="mt-10 text-left">
            <h2 className="font-display text-xl font-semibold text-da-text">
              What happens next
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-da-muted leading-relaxed">
              <li className="flex gap-3">
                <span className="font-display text-da-cyan font-bold">01</span>
                <span>
                  Check your inbox for the receipt (and the spam folder, just
                  in case).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display text-da-cyan font-bold">02</span>
                <span>
                  Desi will reach out within 24 hours with kickoff details —
                  cohort invite, schedule, what to bring.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-display text-da-cyan font-bold">03</span>
                <span>
                  Want to get a head start? Drop into the community while you
                  wait.
                </span>
              </li>
            </ol>

            {showOrderRef && verifiedOrder ? (
              <p className="mt-6 border-t border-da-border pt-4 text-xs text-da-muted">
                Order reference:{" "}
                <code className="text-da-muted">{verifiedOrder.id}</code>
              </p>
            ) : orderId ? (
              <p className="mt-6 border-t border-da-border pt-4 text-xs text-da-muted">
                Receipt processing — check your inbox in a minute. If you
                don&apos;t see it, email{" "}
                <a
                  href="mailto:hello@digitalalchemy.dev"
                  className="text-da-indigo underline decoration-da-indigo/40 underline-offset-4 hover:decoration-da-indigo"
                >
                  hello@digitalalchemy.dev
                </a>
                .
              </p>
            ) : null}
          </Card>
        </FadeInOnScroll>

        <FadeInOnScroll delay={200}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              href="https://www.skool.com/digital-alchemy-7170"
              external
              variant="primary"
              size="md"
            >
              Join the Skool community
            </Button>
            <Link
              href="/"
              className="rounded-full border border-da-border px-5 py-2 text-sm text-da-muted hover:border-da-cyan/40 hover:text-da-text"
            >
              Back to home
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </main>
  );
}
