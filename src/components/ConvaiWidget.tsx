"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Global ElevenLabs ConvAI voice agent. Renders the floating bottom-right
// bubble on every route except /talk (which renders its own inline instance)
// and /admin/** (the backend has its own chrome).
//
// Mount is deferred until the user scrolls/touches/clicks OR 3 seconds
// elapse — whichever comes first. Without this gate the widget script
// from unpkg + the shadow-DOM polling would compete with initial paint
// on every page load.
export function ConvaiWidget() {
  const pathname = usePathname();
  const hidden = pathname === "/talk" || pathname?.startsWith("/admin");
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (hidden) return;
    let mounted = false;
    const mount = () => {
      if (mounted) return;
      mounted = true;
      setShouldMount(true);
      window.removeEventListener("scroll", mount);
      window.removeEventListener("touchstart", mount);
      window.removeEventListener("pointerdown", mount);
    };
    const timer = window.setTimeout(mount, 3000);
    window.addEventListener("scroll", mount, { passive: true, once: true });
    window.addEventListener("touchstart", mount, {
      passive: true,
      once: true,
    });
    window.addEventListener("pointerdown", mount, {
      passive: true,
      once: true,
    });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", mount);
      window.removeEventListener("touchstart", mount);
      window.removeEventListener("pointerdown", mount);
    };
  }, [hidden]);

  // Hide the "Powered by ElevenAgents" badge inside the widget's shadow DOM.
  // The widget is a custom element loaded from unpkg; its branding sits in a
  // shadow root we have to pierce after the script mounts. We poll briefly
  // and stop as soon as we successfully inject the stylesheet — no observer,
  // no retry loop, to avoid bloating the console with mutation noise.
  // Only runs after shouldMount flips so we're not polling during the
  // critical render path.
  useEffect(() => {
    if (hidden || !shouldMount || typeof window === "undefined") return;

    const HIDE_CSS = `
      a[href*="elevenlabs" i],
      a[href*="elevenagents" i],
      [class*="powered" i],
      [class*="branding" i],
      [class*="watermark" i] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `;

    // Only ShadowRoot or Element targets — never Document (illegal append).
    function injectInto(root: ShadowRoot | Element): boolean {
      try {
        if (root.querySelector("style[data-da-hide-brand]")) return true;
        const style = document.createElement("style");
        style.setAttribute("data-da-hide-brand", "");
        style.textContent = HIDE_CSS;
        root.appendChild(style);
        return true;
      } catch {
        return false;
      }
    }

    function tryHide(): boolean {
      const widget = document.querySelector("elevenlabs-convai");
      if (!widget || !widget.shadowRoot) return false;
      let ok = injectInto(widget.shadowRoot);
      // Walk one level of nested shadow roots inside the widget if any
      widget.shadowRoot.querySelectorAll("*").forEach((el) => {
        const sr = (el as Element & { shadowRoot?: ShadowRoot | null })
          .shadowRoot;
        if (sr) ok = injectInto(sr) || ok;
      });
      return ok;
    }

    // Poll every 300ms for up to 15s. Stop on first success.
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (tryHide() || attempts > 50) {
        window.clearInterval(interval);
      }
    }, 300);

    return () => window.clearInterval(interval);
  }, [hidden, shouldMount, pathname]);

  if (hidden || !shouldMount) return null;

  return (
    <>
      <elevenlabs-convai agent-id="agent_5801knndc7b9ekert03h7qakd7zr" />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />
    </>
  );
}
