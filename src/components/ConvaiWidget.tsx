"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Global ElevenLabs ConvAI voice agent. Renders the floating bottom-right
// bubble on every route except /talk (which renders its own inline instance)
// and /admin/** (the backend has its own chrome).
export function ConvaiWidget() {
  const pathname = usePathname();
  const hidden = pathname === "/talk" || pathname?.startsWith("/admin");

  // Hide the "Powered by ElevenAgents" badge inside the widget's shadow DOM.
  // The widget is a custom element loaded from unpkg; its branding sits in a
  // shadow root we have to pierce after the script mounts. We poll briefly,
  // then attach a MutationObserver in case the badge re-renders.
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
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

    function injectInto(root: ShadowRoot | Document) {
      if (root.querySelector("style[data-da-hide-brand]")) return;
      const style = document.createElement("style");
      style.setAttribute("data-da-hide-brand", "");
      style.textContent = HIDE_CSS;
      root.appendChild(style);
    }

    function tryHide() {
      if (cancelled) return;
      const widget = document.querySelector("elevenlabs-convai");
      if (widget && widget.shadowRoot) {
        injectInto(widget.shadowRoot);
        // Walk any nested shadow roots inside the widget too
        widget.shadowRoot
          .querySelectorAll("*")
          .forEach((el) => {
            const sr = (el as Element & { shadowRoot?: ShadowRoot | null })
              .shadowRoot;
            if (sr) injectInto(sr);
          });
        // Belt-and-suspenders: also hide anything in light DOM that matches
        injectInto(document);
        return true;
      }
      return false;
    }

    // Poll every 250ms for up to 15s waiting for the widget script to mount
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (tryHide() || attempts > 60) clearInterval(interval);
    }, 250);

    // Re-apply if the widget re-renders its UI
    const observer = new MutationObserver(() => tryHide());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      clearInterval(interval);
      observer.disconnect();
    };
  }, [hidden, pathname]);

  if (hidden) return null;

  return (
    <>
      <elevenlabs-convai agent-id="agent_5801knndc7b9ekert03h7qakd7zr" />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />
    </>
  );
}
