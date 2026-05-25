import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE.name} | Vibe Coding & App Building | AI Consulting Chicago`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeClient />;
}
