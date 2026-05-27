import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";
import { GlowOrb } from "@/components/effects/GlowOrb";
import { SITE } from "@/lib/constants";
// Tier icons via lucide-react. Lucide's stroke style matches the favicon
// (Zap-based crest) so the brand reads coherently across the site.
import { Sprout, Rocket, Building2, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Three Ways to Build with Desi",
  description:
    "From $27/month to enterprise — pick the tier that fits where you are. Skool community, 1-on-1 coaching, or full team consulting.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    title: "Pricing | Digital Alchemy",
    description:
      "Three tiers from $27/month. Pick where you are: learn it yourself, get personal help, or hire my team.",
    url: `${SITE.url}/pricing`,
    siteName: SITE.name,
  },
};

type Variant = "primary" | "accent" | "outline";

interface Product {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string; external?: boolean; variant: Variant };
  badge?: string;
}

// Per-tier accent color for the icon. Resolves to a Tailwind text-* class
// at usage site so we don't rebuild the theme map here. Brand greens/cyans
// chosen to echo the favicon Zap fill.
const TIER_ICON_COLOR: Record<string, string> = {
  "Learn It Yourself": "text-da-green",
  "Get Personal Help": "text-da-cyan",
  "Hire My Team": "text-da-gold",
};

interface Tier {
  name: string;
  icon: LucideIcon;
  tagline: string;
  accent: string;
  highlighted?: boolean;
  products: Product[];
}

const tiers: Tier[] = [
  {
    name: "Learn It Yourself",
    icon: Sprout,
    tagline: "For self-starters who want to move at their own pace.",
    accent: "from-da-indigo to-da-purple",
    products: [
      {
        name: "Skool Lifetime Bundle",
        price: "$300",
        period: "one-time",
        description:
          "Lifetime access to the Skool academy—no recurring monthly fees. Includes all future blueprints, live workshops, plus a completely FREE Done-For-You Website Build.",
        features: [
          "Lifetime access to the Digital Alchemy Skool",
          "FREE Done-For-You Website Build ($50 value)",
          "All active and future App Blueprints",
          "Direct community support + weekly live builds",
          "One payment, yours forever",
        ],
        cta: {
          label: "Get Lifetime Bundle — $300",
          href: "https://www.paypal.com/ncp/payment/ZHCAAXSYAUZES",
          external: true,
          variant: "primary",
        },
        badge: "Best value",
      },
    ],
  },
  {
    name: "Get Personal Help",
    icon: Rocket,
    tagline:
      "For creators who want to skip ahead with 1-on-1 guidance.",
    accent: "from-da-purple to-da-cyan",
    highlighted: true,
    products: [
      {
        name: "Done-For-You Website",
        price: "$50",
        period: "one-time",
        description:
          "I will design, build, and launch your mobile-perfect, ultra-fast single-page website this week. Includes search & buy domain collaboration.",
        features: [
          "1 Custom Single-Page Website (Hero, About, Offers, Socials)",
          "100% Mobile Responsive (optimized for phone traffic)",
          "Domain search and buy collaboration WITH Desi on kickoff call",
          "Zero ongoing server hosting fees (hosted on Vercel)",
          "1 round of polish revisions",
        ],
        cta: {
          label: "Get Your Site — $50",
          href: "https://www.paypal.com/ncp/payment/2FVD64KMBDBJU",
          external: true,
          variant: "accent",
        },
        badge: "New offer",
      },
      {
        name: "Portfolio Building",
        price: "Starting at $500",
        description:
          "1-on-1 sessions to build a production-quality portfolio across art, music, apps, and video — all with full commercial rights.",
        features: [
          "Multi-medium portfolio: art, music, apps, video",
          "Full commercial rights on everything you create",
          "Positioning + pricing strategy for your work",
          "Walk away with assets you can sell immediately",
        ],
        cta: {
          label: "Book a Portfolio Session — $500",
          href: "/checkout/portfolio-building",
          variant: "outline",
        },
      },
    ],
  },
  {
    name: "Hire My Team",
    icon: Building2,
    tagline:
      "For brands and teams ready to put AI to work — not just talk about it.",
    accent: "from-da-cyan to-da-indigo",
    products: [
      {
        name: "AI Consulting",
        price: "$500–$2,000",
        period: "per engagement",
        description:
          "Tool stack audit, workflow automation design, and team training. Save 10+ hours a week.",
        features: [
          "AI tool stack audit + custom recommendations",
          "Workflow automation design",
          "Team training — your people learn to build, not just use",
          "Ongoing advisory and optimization",
        ],
        cta: {
          label: "Book a Discovery Call",
          href: "/book",
          variant: "primary",
        },
      },
      {
        name: "Vibe Coding Workshops",
        price: "Custom",
        period: "per team",
        description:
          "Half-day or full-day hands-on session. Every participant deploys a real working app by the end.",
        features: [
          "Half-day or full-day formats",
          "Every participant deploys a real app",
          "27+ App Blueprints as starting templates",
          "Recording access + post-workshop support",
        ],
        cta: {
          label: "Request a Workshop",
          href: "/book",
          variant: "outline",
        },
      },
      {
        name: "Custom AI Systems",
        price: "$2,000+",
        period: "per project",
        description:
          "Bespoke AI tools — custom GPTs, automated content pipelines, dashboards, chatbots. Built fast, maintained on retainer.",
        features: [
          "Custom AI tool development",
          "Automated workflows + content pipelines",
          "Integration with existing tools and data",
          "Optional retainer: $1,500–$3,000/month",
        ],
        cta: {
          label: "Start a Project",
          href: "/book",
          variant: "outline",
        },
      },
    ],
  },
];

const faqs = [
  {
    q: "What's the difference between the Skool community and the Bootcamp?",
    a: "Skool is your ongoing membership — weekly live classes, community, and a back-catalog of every session, $27/mo. The Bootcamp is a focused one-time program ($147) where you ship a deployed AI app from scratch. Most people start with the Bootcamp for the first win, then join Skool to keep building.",
  },
  {
    q: "Do I need a coding background?",
    a: "No. 63% of active vibe coders have no traditional dev background. Every program here is designed for creative pros — you describe what you want, AI helps you build it. We teach the workflow, not the syntax.",
  },
  {
    q: "Are there payment plans?",
    a: "Skool is month-to-month — cancel anytime. The Bootcamp is one payment up front. For 1-on-1 coaching and team engagements, we set custom terms during the discovery call.",
  },
  {
    q: "Can I get a refund?",
    a: "Skool: cancel before the next billing cycle, no questions. Bootcamp: 7-day money-back guarantee if you've completed the first module and decide it's not for you. Custom services are scoped before payment, so refunds are handled case-by-case.",
  },
  {
    q: "How do I know which tier fits me?",
    a: "If you want to learn at your own pace and join a community → Skool. If you want a focused project and a finished app → Bootcamp. If you want personal coaching → Portfolio Building. If you have a team or business problem → Hire My Team. Still unsure? Book a free intro call and we'll figure it out together.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative px-6 pt-32 pb-16 overflow-hidden">
        <GlowOrb color="purple" size="lg" className="-right-32 top-10" />
        <GlowOrb color="indigo" size="md" className="-left-20 bottom-0" />

        <div className="relative mx-auto max-w-4xl text-center">
          <FadeInOnScroll>
            <p className="text-sm uppercase tracking-wider text-da-cyan">
              Simple Pricing
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Three Tiers.{" "}
              <span className="text-da-indigo">One Outcome:</span>{" "}
              <span className="glow-text">You Build Real Things.</span>
            </h1>
          </FadeInOnScroll>
          <FadeInOnScroll delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-da-muted">
              Pick the tier that matches where you are. Start at $27/month,
              scale up to a full team engagement — every option ends with
              something shipped.
            </p>
          </FadeInOnScroll>
          <FadeInOnScroll delay={200}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-da-muted">
              <span className="rounded-full border border-da-border bg-da-surface/60 px-3 py-1 backdrop-blur">
                No long-term contracts
              </span>
              <span className="rounded-full border border-da-border bg-da-surface/60 px-3 py-1 backdrop-blur">
                Cancel anytime
              </span>
              <span className="rounded-full border border-da-border bg-da-surface/60 px-3 py-1 backdrop-blur">
                Free intro call
              </span>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <ShimmerLine />

      {/* ── TIERS ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-20">
          {tiers.map((tier) => (
            <FadeInOnScroll key={tier.name}>
              <div>
                {/* Tier header */}
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-da-surface/60 ${TIER_ICON_COLOR[tier.name] ?? "text-da-green"}`}
                    aria-hidden="true"
                  >
                    <tier.icon size={28} strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">
                      {tier.name}
                    </h2>
                    <p className="mt-1 text-sm text-da-muted">
                      {tier.tagline}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-4 h-1 w-24 rounded-full bg-gradient-to-r ${tier.accent}`}
                />

                {/* Products grid — single-product tier centers and constrains
                    so it doesn't stretch to full-width and look orphaned. */}
                <StaggerContainer
                  className={
                    tier.products.length === 1
                      ? "mt-8 mx-auto max-w-2xl"
                      : tier.products.length === 2
                        ? "mt-8 grid gap-6 md:grid-cols-2"
                        : "mt-8 grid gap-6 md:grid-cols-3"
                  }
                  staggerDelay={0.1}
                >
                  {tier.products.map((product) => (
                    <StaggerItem key={product.name}>
                      <Card
                        variant={tier.highlighted ? "glow" : "default"}
                        className="flex h-full flex-col"
                      >
                        {product.badge && (
                          <span className="mb-3 inline-block self-start rounded-full bg-da-cyan/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-da-cyan">
                            {product.badge}
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold text-da-text">
                          {product.name}
                        </h3>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="font-display text-3xl font-bold text-da-cyan">
                            {product.price}
                          </span>
                          {product.period && (
                            <span className="text-sm text-da-muted">
                              {product.period}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm text-da-muted leading-relaxed">
                          {product.description}
                        </p>
                        <ul className="mt-6 flex-1 space-y-2">
                          {product.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-sm text-da-muted"
                            >
                              <span className="mt-1 text-da-cyan text-xs">
                                &#9670;
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 border-t border-da-border pt-4">
                          <Button
                            href={product.cta.href}
                            external={product.cta.external}
                            variant={product.cta.variant}
                            size="md"
                          >
                            {product.cta.label}
                          </Button>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      <ShimmerLine />

      {/* ── FAQ ── */}
      <section className="px-6 py-24 bg-da-surface/20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title="Common Questions"
            subtitle="Quick answers before you commit."
          />
          <StaggerContainer className="mt-4 space-y-4" staggerDelay={0.08}>
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <details className="group rounded-xl border border-da-border bg-da-surface/60 p-6 backdrop-blur transition-colors hover:border-da-indigo/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-da-text [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="text-2xl leading-none text-da-cyan transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-da-muted">
                    {faq.a}
                  </p>
                </details>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ShimmerLine />

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden px-6 py-24">
        <GlowOrb color="purple" size="lg" className="-left-20 top-0" />
        <GlowOrb color="indigo" size="md" className="-right-20 bottom-0" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInOnScroll>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Still not sure which tier fits?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-da-muted">
              Book a free intro call. Tell me what you&apos;re building and
              I&apos;ll point you at the right starting point — no pitch, no
              pressure.
            </p>
            <div className="mt-8">
              <Button href="/book" variant="primary" size="lg">
                Book a Free Intro Call
              </Button>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
