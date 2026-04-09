// Case studies — long-form project deep dives.
//
// Each entry renders at /case-studies/[slug]. These are currently
// placeholder scaffolds — Desi fills in the `problem`, `approach`,
// `result`, and `metrics` fields when he has time. Until then, the
// pages are noindex'd so search engines don't pick up "Coming soon"
// content.
//
// TODO(Desi): Replace every `// FILL IN ...` marker below with real
// content. Each section wants 2–4 sentences, conversational tone,
// written to your voice (no corporate-speak). The `metrics` array
// is the money shot — numbers clients can verify. Even one real
// number ("built in 3 days" / "saved 10 hrs/week" / "used by 200+
// members") beats a paragraph of hype.
//
// To publish a case study: set `published: true` on its entry. That
// flips the noindex off and makes it eligible for the portfolio page
// to link it. Leave as `published: false` while content is stubby.

export interface CaseStudy {
  slug: string;
  title: string;
  projectName: string;
  url: string;
  summary: string; // one-sentence hook shown in listings
  problem: string;
  approach: string;
  result: string;
  metrics: { label: string; value: string }[];
  published: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "qr-forge-pro",
    title: "Building QR Forge Pro — a pro QR generator in a weekend",
    projectName: "QR Forge Pro",
    url: "https://qrcodybydb.vercel.app/",
    summary:
      "How I built a professional QR code tool with custom styling, logo embedding, and batch export — start to finish in a weekend.",
    problem:
      // FILL IN: What was the pain point? Who was it for? What did other QR
      // tools get wrong that you wanted to fix?
      "Placeholder — what problem were you solving, and who was hitting it?",
    approach:
      // FILL IN: How did you design it? What AI tools / stack? Any clever
      // tricks or decisions you're proud of?
      "Placeholder — how did you build it, what tools did you use, and what decisions mattered?",
    result:
      // FILL IN: What shipped? Who uses it? Any surprising outcomes?
      "Placeholder — what shipped, who uses it now, and what surprised you about the result?",
    metrics: [
      // FILL IN: 2–4 concrete numbers. Examples:
      // { label: "Time to ship", value: "2 days" },
      // { label: "Active users", value: "300+" },
      // { label: "QR codes generated", value: "10k+" },
      { label: "Time to ship", value: "TBD" },
      { label: "Active users", value: "TBD" },
    ],
    published: false,
  },
  {
    slug: "the-77",
    title: "The 77 — building a content engine for the DA community",
    projectName: "The 77",
    url: "",
    summary:
      "How I shipped The 77 — the content tool that became the backbone of how Digital Alchemy members publish and grow.",
    problem:
      // FILL IN
      "Placeholder — what was the bottleneck that The 77 was built to remove?",
    approach:
      // FILL IN
      "Placeholder — walk through your build process and tool choices.",
    result:
      // FILL IN
      "Placeholder — what changed for users after launch?",
    metrics: [
      { label: "Users onboarded", value: "TBD" },
      { label: "Content pieces generated", value: "TBD" },
    ],
    published: false,
  },
  {
    slug: "video-analyzer",
    title: "Video Analyzer — turning hours of video into insights in minutes",
    projectName: "Video Analyzer",
    url: "",
    summary:
      "How I built a tool that takes long-form video and spits out key moments, quotes, and summaries automatically.",
    problem:
      // FILL IN
      "Placeholder — who needs to analyze video fast, and why was it hard before?",
    approach:
      // FILL IN
      "Placeholder — which AI models did you use, and how do they chain together?",
    result:
      // FILL IN
      "Placeholder — how much faster is it vs. the manual workflow?",
    metrics: [
      { label: "Avg processing time", value: "TBD" },
      { label: "Time saved per video", value: "TBD" },
    ],
    published: false,
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}
