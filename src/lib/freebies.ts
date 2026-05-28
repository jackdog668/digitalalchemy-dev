// Static freebies catalog definition

export interface FreebieProduct {
  slug: string;
  name: string;
  blurb: string;
  /** Direct link to the asset, placed under public/ or external storage */
  fileUrl: string;
  /** Subject line for the Resend automated delivery email */
  subject: string;
}

const FREEBIE_LIST: FreebieProduct[] = [
  {
    slug: "domain-purchase-guide",
    name: "How to Purchase Your First Domain (Visual Guide)",
    blurb: "A step-by-step interactive blueprint explaining how to secure your custom domain name, configure DNS records, and prepare it for live hosting in under 5 minutes.",
    fileUrl: "/downloads/domain-purchase-guide.html",
    subject: "Guide: How to purchase your first domain"
  }
];

// Asserts slugs are unique on module load to prevent silent catalog overwrites
function assertUniqueSlugs(list: readonly FreebieProduct[]): void {
  const seen = new Set<string>();
  for (const p of list) {
    if (seen.has(p.slug)) {
      throw new Error(
        `[freebies] duplicate freebie slug "${p.slug}" in FREEBIE_LIST — slugs must be unique`
      );
    }
    seen.add(p.slug);
  }
}
assertUniqueSlugs(FREEBIE_LIST);

const FREEBIES_BY_SLUG: ReadonlyMap<string, FreebieProduct> = new Map(
  FREEBIE_LIST.map((p) => [p.slug, p])
);

/** Returns all active freebies in catalog */
export function listFreebies(): readonly FreebieProduct[] {
  return FREEBIE_LIST;
}

/** Looks up freebie product by its slug. Returns null if not found. */
export function getFreebie(slug: string): FreebieProduct | null {
  return FREEBIES_BY_SLUG.get(slug) ?? null;
}
