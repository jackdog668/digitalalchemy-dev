export type ProjectCategory =
  | "All"
  | "Music"
  | "Design"
  | "Code"
  | "Video"
  | "AI Tools";

export interface Project {
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  /** Live deployment URL */
  url?: string;
  /** Screenshot/preview image URL (auto-generated from deployment) */
  screenshot?: string;
}

/**
 * Generate a screenshot URL from a live deployment.
 * Uses Microlink screenshot API — reliable, free tier, returns actual page screenshots.
 */
function screenshotUrl(url: string): string {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&type=jpeg&overlay.browser=none`;
}

export const projects: Project[] = [
  {
    title: "QR Forge Pro",
    description:
      "Professional QR code generator with custom styling, logo embedding, and batch export. Built with Next.js.",
    category: "AI Tools",
    tags: ["Next.js", "QR Codes", "Design Tool"],
    url: "https://qr-forge-pro-mu.vercel.app",
    screenshot: screenshotUrl("https://qr-forge-pro-mu.vercel.app"),
  },
  {
    title: "Idea2PRD Generator",
    description:
      "AI-powered app that transforms rough ideas into professional Product Requirement Documents in minutes. Powered by Gemini.",
    category: "AI Tools",
    tags: ["Gemini", "Automation", "Product"],
    url: "https://dbidea2prd.vercel.app",
    screenshot: screenshotUrl("https://dbidea2prd.vercel.app"),
  },
  {
    title: "Chibi Forge",
    description:
      "AI character generator creating Afrocentric chibi-style avatars and collectible art. Custom styling engine.",
    category: "Design",
    tags: ["AI Art", "Afrofuturism", "Avatars"],
    url: "https://afrodandy.vercel.app",
    screenshot: screenshotUrl("https://afrodandy.vercel.app"),
  },
  {
    title: "VibeShot",
    description:
      "AI-powered screenshot beautifier that transforms plain captures into styled social-ready images.",
    category: "AI Tools",
    tags: ["Screenshots", "Design", "Social Media"],
    url: "https://vibeshot2.vercel.app",
    screenshot: screenshotUrl("https://vibeshot2.vercel.app"),
  },
  {
    title: "Content Hook Generator",
    description:
      "AI writing tool that generates viral-worthy hooks and openers for social media content. Built for creators.",
    category: "AI Tools",
    tags: ["Content", "AI Writing", "Social Media"],
    url: "https://content-hook-generator.vercel.app",
    screenshot: screenshotUrl("https://content-hook-generator.vercel.app"),
  },
  {
    title: "Firecrawl Site Insight",
    description:
      "Web scraping and analysis tool powered by Firecrawl. Extract structured data and insights from any website.",
    category: "Code",
    tags: ["Firecrawl", "Web Scraping", "Analysis"],
    url: "https://firecrawl-site-insight.vercel.app",
    screenshot: screenshotUrl("https://firecrawl-site-insight.vercel.app"),
  },
  {
    title: "LovePixel Sticker Studio",
    description:
      "Custom sticker creation platform with AI-generated designs, print-ready export, and a Valentine's Day theme.",
    category: "Design",
    tags: ["Stickers", "AI Design", "Print"],
    url: "https://lovepixel.vercel.app",
    screenshot: screenshotUrl("https://lovepixel.vercel.app"),
  },
  {
    title: "Digital Alchemy Freebies",
    description:
      "Free resource hub for the Digital Alchemy community. Templates, assets, and tools — no strings attached.",
    category: "Code",
    tags: ["Resources", "Community", "Free Tools"],
    url: "https://digital-alchemy-freebies.vercel.app",
    screenshot: screenshotUrl("https://digital-alchemy-freebies.vercel.app"),
  },
  {
    title: "The 77",
    description:
      "Community platform with curated content and collaborative features. Built with modern web stack.",
    category: "Code",
    tags: ["Community", "Next.js", "Platform"],
    url: "https://the-77.vercel.app",
    screenshot: screenshotUrl("https://the-77.vercel.app"),
  },
  {
    title: "Vibe Vocab",
    description:
      "AI-powered vocabulary builder that makes learning new words feel like a game. Personalized learning paths.",
    category: "AI Tools",
    tags: ["Education", "AI", "Gamification"],
    url: "https://vibe-x92-p1k.vercel.app",
    screenshot: screenshotUrl("https://vibe-x92-p1k.vercel.app"),
  },
  {
    title: "Video Analyzer",
    description:
      "AI video analysis tool that extracts insights, transcripts, and key moments from uploaded video content.",
    category: "Video",
    tags: ["AI Video", "Analysis", "Transcription"],
    url: "https://videesadcfvs.vercel.app",
    screenshot: screenshotUrl("https://videesadcfvs.vercel.app"),
  },
  {
    title: "AI Music Collection",
    description:
      "45+ original tracks created with Suno AI. Full commercial rights. Genres spanning lo-fi, cinematic, hip-hop, and ambient.",
    category: "Music",
    tags: ["Suno", "AI Music", "Commercial Rights"],
  },
];

export const categories: ProjectCategory[] = [
  "All",
  "Music",
  "Design",
  "Code",
  "Video",
  "AI Tools",
];
