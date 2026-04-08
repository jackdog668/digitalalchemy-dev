"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Global ElevenLabs ConvAI voice agent. Renders the floating bottom-right
// bubble on every route except /talk, where a larger inline instance is shown
// instead (see src/app/talk/page.tsx).
export function ConvaiWidget() {
  const pathname = usePathname();
  if (pathname === "/talk") return null;
  // Don't show the chat bubble inside the admin backend
  if (pathname?.startsWith("/admin")) return null;

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
