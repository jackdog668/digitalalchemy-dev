import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SITE } from "@/lib/constants";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const canonicalPath = `/blog/${post.slug}`;
  // If the post has a hand-picked image, use it. Otherwise, generate a
  // branded OG card on the fly via /api/og. Every post gets a designed
  // preview card in social shares with zero manual work.
  const dynamicOgUrl = `${SITE.url}/api/og?title=${encodeURIComponent(
    post.title,
  )}&category=${encodeURIComponent(post.category ?? "Blog")}`;
  const ogImages = post.image
    ? [{ url: post.image, alt: post.title }]
    : [{ url: dynamicOgUrl, alt: post.title, width: 1200, height: 630 }];

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE.url}${canonicalPath}`,
      siteName: SITE.name,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: ogImages,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ogImages.map((i) => i.url),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const postUrl = `${SITE.url}/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image ? [post.image] : [`${SITE.url}/og-default.png`],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      {/* ── POST HEADER ── */}
      <section className="relative px-6 pt-32 pb-16 overflow-hidden">
        <GlowOrb color="purple" size="lg" className="-left-20 top-20" />

        <div className="relative mx-auto max-w-3xl">
          <FadeInOnScroll>
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-da-muted" aria-label="Breadcrumb">
              <Link href="/blog" className="hover:text-da-text transition-colors">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-da-text">{post.title}</span>
            </nav>

            {/* Category badge */}
            <span className="inline-block rounded-full bg-da-indigo/10 border border-da-indigo/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-da-indigo mb-4">
              {post.category}
            </span>

            <h1 className="font-display text-3xl font-bold leading-tight text-da-text sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-da-muted">
              <span>{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-da-muted" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="h-1 w-1 rounded-full bg-da-muted" />
              <span>{post.readingTime}</span>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── POST CONTENT ── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_220px]">
          <article className="prose-da max-w-3xl">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "wrap" }],
                    [rehypePrettyCode, { theme: "one-dark-pro" }],
                  ],
                },
              }}
            />
          </article>
          <aside>
            <TableOfContents />
          </aside>
        </div>
      </section>

      {/* ── NEWSLETTER SIGNUP ── */}
      {/*
        Inline signup box at the end of the article — highest-attention
        placement because the reader just finished consuming the content.
        Reuses the existing SubscribeForm component and /api/subscribe
        route (double opt-in via Resend + Supabase). No new plumbing.
      */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-da-indigo/30 bg-gradient-to-br from-da-indigo/10 via-da-surface/40 to-da-purple/10 p-8 text-center backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-da-cyan">
              Join the list
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-da-text sm:text-3xl">
              Get Desi&apos;s weekly vibe coding tips
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-da-muted">
              Real builds, real tools, no fluff. One email a week, unsubscribe
              anytime.
            </p>
            <div className="mt-6 flex justify-center">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>

      <ShimmerLine />

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-bold text-da-text mb-8">
              More in {post.category}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block rounded-xl bg-gradient-to-br from-da-surface to-da-dark border border-da-border hover:border-da-purple/40 p-6 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-da-indigo">
                    {relatedPost.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-da-text group-hover:text-da-indigo transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-2 text-sm text-da-muted line-clamp-2">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ShimmerLine />

      {/* ── CTA ── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <GlowOrb color="cyan" size="md" className="-right-20 top-0" />

        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to start{" "}
              <span className="text-da-cyan">building?</span>
            </h2>
            <p className="mt-4 text-lg text-da-muted">
              Join the community and build real projects with AI tools.
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
              <Button href="/blog" variant="outline" size="lg">
                Back to Blog
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
