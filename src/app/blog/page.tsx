import type { Metadata } from "next";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/constants";

const BLOG_DESCRIPTION =
  "Tutorials, behind-the-build stories, and insights on vibe coding, AI art, AI music, and building real apps with AI. From the Digital Alchemy lab.";

export const metadata: Metadata = {
  title: "Blog | AI Education, Vibe Coding & Creative Tech",
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": `${SITE.url}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    title: "Blog | Digital Alchemy",
    description: BLOG_DESCRIPTION,
    url: `${SITE.url}/blog`,
    siteName: SITE.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Digital Alchemy",
    description: BLOG_DESCRIPTION,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} — Blog`,
    description: BLOG_DESCRIPTION,
    url: `${SITE.url}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Person", name: p.author },
      url: `${SITE.url}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <GlowOrb color="purple" size="lg" className="-left-20 top-20" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              The{" "}
              <span className="text-da-purple">Lab Notes.</span>
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-da-muted">
              Tutorials, build breakdowns, and lessons from the frontlines of
              AI-powered creation. Written by builders, for builders.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── POSTS GRID ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Latest Posts"
            subtitle="Filter by topic to find what you need."
          />

          <FadeInOnScroll delay={100}>
            <CategoryFilter posts={posts} categories={categories} />
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── BOTTOM CTA ── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <GlowOrb color="cyan" size="md" className="-right-20 top-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Want to build like this?{" "}
              <span className="text-da-cyan">Join the lab.</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Get hands-on with AI tools and build real projects alongside other
              creators.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                href={SITE.skoolUrl}
                external
                variant="accent"
                size="lg"
              >
                Become an Alchemist
              </Button>
              <Button href={SITE.beaconsUrl} external variant="primary" size="lg">
                All Links
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
