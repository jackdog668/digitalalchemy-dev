import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Portfolio & Case Studies | Chicago Vibe Coding",
  description:
    "Explore our portfolio of custom AI systems, vibe coding projects, and applications built for clients in Chicago and beyond.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
