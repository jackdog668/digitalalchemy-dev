import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import {
  getCaseStudyBySlug,
  getAllCaseStudySlugs,
} from "@/data/case-studies";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
    // Unpublished case studies stay noindex so Google doesn't pick up
    // placeholder "Coming soon" content. Flip `published: true` in
    // src/data/case-studies.ts once the content is filled in.
    robots: study.published
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-32 pb-12">
        <GlowOrb color="indigo" size="lg" className="-left-20 top-10" />
        <div className="relative mx-auto max-w-3xl">
          <FadeInOnScroll>
            <nav className="mb-6 text-sm text-da-muted">
              <Link href="/portfolio" className="hover:text-da-text">
                Portfolio
              </Link>
              <span className="mx-2">/</span>
              <span className="text-da-text">{study.projectName}</span>
            </nav>

            {!study.published && (
              <div className="mb-6 rounded-lg border border-da-cyan/30 bg-da-cyan/5 px-4 py-3 text-sm text-da-cyan">
                <strong>Draft</strong> — this case study is being written.
                Check back soon, or{" "}
                <Link href="/book" className="underline">
                  book a call
                </Link>{" "}
                to hear about the build directly.
              </div>
            )}

            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              {study.title}
            </h1>
            <p className="mt-4 text-lg text-da-muted">{study.summary}</p>

            {study.url && (
              <div className="mt-6">
                <Button href={study.url} external variant="outline" size="md">
                  View live →
                </Button>
              </div>
            )}
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine className="opacity-50" />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          <FadeInOnScroll>
            <div>
              <h2 className="font-display text-2xl font-bold text-da-indigo">
                The problem
              </h2>
              <p className="mt-4 leading-relaxed text-da-text">
                {study.problem}
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <div>
              <h2 className="font-display text-2xl font-bold text-da-cyan">
                The approach
              </h2>
              <p className="mt-4 leading-relaxed text-da-text">
                {study.approach}
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div>
              <h2 className="font-display text-2xl font-bold text-da-purple">
                The result
              </h2>
              <p className="mt-4 leading-relaxed text-da-text">
                {study.result}
              </p>
            </div>
          </FadeInOnScroll>

          {study.metrics.length > 0 && (
            <FadeInOnScroll delay={300}>
              <div className="grid gap-4 sm:grid-cols-2">
                {study.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-da-indigo/20 bg-da-surface/60 p-6 text-center"
                  >
                    <div className="font-display text-3xl font-bold text-da-cyan">
                      {m.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-da-muted">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeInOnScroll>
          )}
        </div>
      </section>

      <ShimmerLine />

      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb color="cyan" size="md" className="-right-20 top-0" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Want something{" "}
              <span className="text-da-cyan">like this built?</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              I work with creators and small teams to ship AI-powered tools.
              Book a call and we&apos;ll scope it out.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/book" variant="accent" size="lg">
                Book a Call
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
