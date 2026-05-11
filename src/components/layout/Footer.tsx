"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";

export function Footer() {
  const pathname = usePathname();
  // Admin has its own chrome — hide the public-site footer on /admin/**
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-void">
      {/* ShimmerLine — premium separator (recolored to neon-green in globals.css) */}
      <ShimmerLine />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <FadeInOnScroll direction="up" duration={0.7}>
          <div className="grid gap-12 md:grid-cols-3">
            {/* Brand column */}
            <div>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="inline-block"
              >
                <Link
                  href="/"
                  className="font-display text-xl font-bold tracking-tight text-ink"
                >
                  DIGITAL<span className="text-neon-green">ALCHEMY</span>
                </Link>
              </motion.div>

              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
                Learn to build with AI. Own everything you create. Become the
                Alchemist.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={SITE.skoolUrl}
                  external
                  variant="accent"
                  size="sm"
                >
                  Join Digital Alchemy
                </Button>
                <Button
                  href={SITE.beaconsUrl}
                  external
                  variant="outline"
                  size="sm"
                >
                  All Links
                </Button>
              </div>

              {/* Social icon strip — branded glyphs + handles, ink-muted → neon-green on hover */}
              <div className="mt-8">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-dim">
                  // find me here
                </p>
                <SocialIcons variant="footer" />
              </div>
            </div>

            {/* Navigation column */}
            <div>
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-neon-green">
                // navigate
              </h3>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="inline-block"
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition-colors duration-150 hover:text-neon-green"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Creed column */}
            <div>
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-electro-gold">
                // the alchemist creed
              </h3>
              <blockquote className="mt-4 border-l-2 border-mystic-purple/50 pl-4 text-sm italic leading-relaxed text-ink-muted">
                I am not a consumer. I am a creator.
                <br />I don&apos;t collect courses. I build systems.
                <br />I don&apos;t hope for clarity. I architect outcomes.
              </blockquote>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-8 sm:flex-row">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim">
              &copy; {new Date().getFullYear()} Digital Alchemy / DB Creations
              LLC. All rights reserved.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim">
              Built by <span className="text-neon-green">{SITE.founder}</span>{" "}
              &mdash; {SITE.credential}
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </footer>
  );
}
