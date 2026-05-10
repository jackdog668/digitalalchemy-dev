import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConvaiWidget } from "@/components/ConvaiWidget";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { PostHogProvider } from "@/components/PostHogProvider";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Local Space Grotesk — the design system's canonical 5 OTF weights.
// Replaces next/font/google Space_Grotesk so we ship Desi's exact files
// (matches the DA brand kit + zero external font CDN on the critical path).
const spaceGrotesk = localFont({
  variable: "--font-space-grotesk",
  display: "swap",
  src: [
    { path: "./fonts/SpaceGrotesk-Light.otf",    weight: "300", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Regular.otf",  weight: "400", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Medium.otf",   weight: "500", style: "normal" },
    { path: "./fonts/SpaceGrotesk-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Bold.otf",     weight: "700", style: "normal" },
  ],
});

// JetBrains Mono for every kicker, badge, code label, terminal string.
// Per the DA brand bible: mono uppercase + tracked for all UI labels.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Learn to Build Apps with AI — No Coding Required`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} | Learn to Build Apps with AI — No Coding Required`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Learn to Build Apps with AI — No Coding Required`,
    description: SITE.description,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${SITE.url}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-da-dark text-da-text`}
      >
        <PostHogProvider>
          <GrainOverlay />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ConvaiWidget />
        </PostHogProvider>
      </body>
    </html>
  );
}
