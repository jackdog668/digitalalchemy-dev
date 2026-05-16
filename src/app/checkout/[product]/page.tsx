import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { getProduct, formatPayPalAmount } from "@/lib/paypal";
import { CheckoutClient } from "./CheckoutClient";

// Per-product checkout page. Server-renders the product summary so the
// price is on the page even before the PayPal SDK loads — the client
// component mounts the Smart Buttons underneath.

interface PageProps {
  params: Promise<{ product: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { product: slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Checkout | Digital Alchemy" };
  return {
    title: `Checkout — ${product.name} | Digital Alchemy`,
    description: product.blurb,
    robots: { index: false, follow: false }, // checkout pages stay out of search
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { product: slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const priceFormatted = `$${formatPayPalAmount(product.amountCents)} ${product.currency}`;

  return (
    <main className="relative px-6 pt-32 pb-24 overflow-hidden">
      <GlowOrb color="indigo" size="lg" className="-right-32 top-10" />
      <GlowOrb color="purple" size="md" className="-left-20 bottom-0" />

      <div className="relative mx-auto max-w-2xl">
        <FadeInOnScroll>
          <p className="text-sm uppercase tracking-wider text-da-cyan">
            Checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-da-muted leading-relaxed">
            {product.blurb}
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={100}>
          <Card variant="glow" hover={false} className="mt-10">
            <div className="flex items-baseline justify-between border-b border-da-border pb-4">
              <span className="text-sm uppercase tracking-wider text-da-muted">
                Total
              </span>
              <span className="font-display text-3xl font-bold text-da-cyan">
                {priceFormatted}
              </span>
            </div>

            <p className="mt-4 text-sm text-da-muted">
              Pay securely with PayPal or any major card. After payment,
              you&apos;ll get an instant receipt and Desi will reach out
              within 24 hours with kickoff details.
            </p>

            <div className="mt-6">
              <CheckoutClient
                productSlug={product.slug}
                productName={product.name}
                amountValue={formatPayPalAmount(product.amountCents)}
                currency={product.currency}
              />
            </div>

            <p className="mt-4 text-xs text-da-muted text-center">
              Secured by PayPal. No card details touch our servers.
            </p>
          </Card>
        </FadeInOnScroll>

        <FadeInOnScroll delay={200}>
          <p className="mt-8 text-center text-sm text-da-muted">
            Questions before you buy?{" "}
            <a
              href="mailto:hello@digitalalchemy.dev"
              className="text-da-indigo underline decoration-da-indigo/40 underline-offset-4 hover:decoration-da-indigo"
            >
              hello@digitalalchemy.dev
            </a>
          </p>
        </FadeInOnScroll>
      </div>
    </main>
  );
}
