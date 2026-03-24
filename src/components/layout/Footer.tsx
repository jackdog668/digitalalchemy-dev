"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { ShimmerLine } from "@/components/effects/ShimmerLine";

export function Footer() {
  return (
    <footer className="bg-da-darker">
      {/* ShimmerLine replaces the plain border-t as a premium separator */}
      <ShimmerLine />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <FadeInOnScroll direction="up" duration={0.7}>
          <div className="grid gap-12 md:grid-cols-3">
            {/* Brand */}
            <div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="inline-block"
              >
                <Link
                  href="/"
                  className="font-display text-xl font-bold tracking-tight text-da-text"
                >
                  DIGITAL<span className="text-da-cyan">ALCHEMY</span>
                </Link>
              </motion.div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-da-muted">
                Transform from scattered AI consumer to asset-owning creator.
                Build systems. Own everything. Become the Alchemist.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={SITE.skoolUrl}
                  external
                  variant="accent"
                  size="sm"
                >
                  Become an Alchemist
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
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-da-muted">
                Navigate
              </h3>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {/* Hover: translateX nudge + color shift */}
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-block"
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-da-muted transition-colors duration-200 hover:text-da-text"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Creed */}
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-da-muted">
                The Alchemist Creed
              </h3>
              <blockquote className="mt-4 border-l-2 border-da-indigo/40 pl-4 text-sm italic leading-relaxed text-da-muted">
                I am not a consumer. I am a creator.
                <br />I don&apos;t collect courses. I build systems.
                <br />I don&apos;t hope for clarity. I architect outcomes.
              </blockquote>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-da-border pt-8 sm:flex-row">
            <p className="text-xs text-da-muted">
              &copy; {new Date().getFullYear()} Digital Alchemy / DB Creations
              LLC. All rights reserved.
            </p>
            <p className="text-xs text-da-muted">
              Built by{" "}
              <span className="text-da-indigo">{SITE.founder}</span> &mdash;{" "}
              {SITE.credential}
            </p>
          </div>
        </FadeInOnScroll>
      </div>
    </footer>
  );
}
