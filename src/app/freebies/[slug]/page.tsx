import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { getFreebie } from "@/lib/freebies";
import { ClaimClient } from "./ClaimClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const freebie = getFreebie(slug);
  if (!freebie) return { title: "Claim Freebie | Digital Alchemy" };
  return {
    title: `Claim: ${freebie.name} | Digital Alchemy`,
    description: freebie.blurb,
    robots: { index: false, follow: false }, // lead gen checkouts stay out of Google crawler indexing
  };
}

export default async function FreebieClaimPage({ params }: PageProps) {
  const { slug } = await params;
  const freebie = getFreebie(slug);
  if (!freebie) notFound();

  return (
    <main className="relative px-6 pt-32 pb-24 overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background Ambience Orbs */}
      <GlowOrb color="indigo" size="lg" className="-right-32 top-10 opacity-40" />
      <GlowOrb color="purple" size="md" className="-left-20 bottom-10 opacity-30" />

      <div className="relative w-full max-w-xl mx-auto">
        {/* Back navigation anchor */}
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-da-muted hover:text-da-cyan transition-colors"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back Home
          </Link>
        </div>

        <FadeInOnScroll>
          <div className="inline-block rounded-md border border-da-border bg-da-surface/40 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-da-cyan uppercase mb-4">
            Free Resource
          </div>
          
          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl text-da-text">
            {freebie.name}
          </h1>
          
          <p className="mt-4 text-base text-da-muted leading-relaxed">
            {freebie.blurb}
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={100}>
          <Card variant="glow" hover={false} className="mt-10 p-8 sm:p-10 bg-[#12131A] border-[#22232B] relative overflow-hidden">
            {/* Ambient accent stripe */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-da-indigo to-da-cyan" />

            <div className="border-b border-da-border/60 pb-6 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider text-da-muted font-mono">
                Claim Status
              </span>
              <span className="block mt-1 font-display text-2xl font-bold text-[#40FF78]">
                100% Free
              </span>
            </div>

            <p className="mt-6 text-sm text-da-muted leading-relaxed">
              Enter your email below to unlock the guide. We will deliver the visual file straight to your screen, and email you a permanent copy for your archive.
            </p>

            {/* Claim inputs */}
            <div className="mt-6">
              <ClaimClient freebieSlug={freebie.slug} freebieName={freebie.name} />
            </div>

            <p className="mt-6 text-center text-[10px] text-da-muted/70 leading-normal">
              Zero spam. Your email is logged securely in the Digital Alchemy vault to deliver the asset and occasionally share practical vibe coding blueprints.
            </p>
          </Card>
        </FadeInOnScroll>
      </div>
    </main>
  );
}
