"use client";

import {
  SiInstagram,
  SiTiktok,
  SiThreads,
  SiX,
  SiSubstack,
  SiGithub,
  SiPinterest,
  SiFacebook,
} from "react-icons/si";
// LinkedIn dropped from simple-icons over trademark; grab from fa6 instead.
// Single-color brand glyph, visually consistent with the Si* set.
import { FaLinkedin } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";

// Map platform key (from constants.ts) → simple-icons brand glyph.
// All glyphs render in ink-muted at rest, neon-green on hover —
// per DA brand bible: no rainbow brand colors fighting the CTA.
const ICON_BY_PLATFORM = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  threads: SiThreads,
  twitter: SiX,
  linkedin: FaLinkedin,
  substack: SiSubstack,
  github: SiGithub,
  pinterest: SiPinterest,
  facebook: SiFacebook,
} satisfies Record<string, IconType>;

type Variant = "footer" | "hero";

interface SocialIconsProps {
  /** `footer` shows icon + handle, `hero` shows icons only (compact). */
  variant?: Variant;
  /** Cap the count — useful for hero strip (4-5 max recommended). */
  limit?: number;
  className?: string;
}

export function SocialIcons({
  variant = "footer",
  limit,
  className = "",
}: SocialIconsProps) {
  const links = limit ? SOCIAL_LINKS.slice(0, limit) : SOCIAL_LINKS;
  const iconSize = variant === "hero" ? 18 : 18;
  const gap = variant === "hero" ? "gap-4" : "gap-x-5 gap-y-2";

  return (
    <ul
      className={`flex flex-wrap items-center ${gap} ${className}`}
      aria-label="Digital Alchemy social links"
    >
      {links.map((link) => {
        const Icon = ICON_BY_PLATFORM[link.platform];
        if (!Icon) return null;
        return (
          <li key={link.platform}>
            <motion.a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label} — ${link.handle}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={[
                "group inline-flex items-center gap-2",
                "text-ink-muted hover:text-neon-green",
                "transition-colors duration-150",
              ].join(" ")}
            >
              <Icon size={iconSize} aria-hidden="true" />
              {variant === "footer" && (
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim group-hover:text-ink">
                  {link.handle}
                </span>
              )}
            </motion.a>
          </li>
        );
      })}
    </ul>
  );
}
