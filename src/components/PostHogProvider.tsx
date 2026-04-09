"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

// PostHog analytics wiring for Next.js App Router.
//
// Why this file exists:
// - App Router does NOT trigger full page loads on internal <Link> clicks,
//   which means PostHog's default "capture_pageview: true" only fires on
//   initial hard loads. Every subsequent client-side navigation is
//   invisible. We fix that by manually calling posthog.capture("$pageview")
//   on every pathname/search-param change via usePathname + useSearchParams.
// - Both env vars are optional. If NEXT_PUBLIC_POSTHOG_KEY is unset (e.g.
//   on a fork, in local dev without a PostHog account), this provider
//   silently becomes a no-op — no crashes, no tracking, no warnings.
// - useSearchParams is wrapped in <Suspense> because Next.js requires it
//   for any page using generateStaticParams/force-static to still build.
//
// What gets tracked:
// - Automatic: pageviews on every route change ($pageview event)
// - Automatic: autocapture clicks/form submits (PostHog's built-in)
// - Manual: anything you call posthog.capture("event_name", { props })
//   from client components (e.g. "Book a Call button clicked")
//
// See https://posthog.com/docs/libraries/next-js for the full API.

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (!posthog.__loaded) return;
    let url = window.origin + pathname;
    const search = searchParams?.toString();
    if (search) url += `?${search}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
    if (!key) return; // Graceful no-op — no analytics configured.
    if (posthog.__loaded) return; // Idempotent — don't re-init on HMR.

    posthog.init(key, {
      api_host: host,
      // We handle pageviews manually below (App Router navigation)
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: true,
    });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
