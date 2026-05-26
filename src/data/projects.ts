export type ProjectCategory =
  | "All"
  | "Music"
  | "Design"
  | "Code"
  | "Video"
  | "AI Tools"
  | "Creator Tools";

export interface Project {
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  /** Live deployment URL */
  url?: string;
  /** Direct link to public GitHub repository */
  repoUrl?: string;
  /** Explicitly hide live click preview to enforce a showcase card style */
  hideUrl?: boolean;
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
  // ── High Polish Active Live Deployments (Fully Clickable) ──
  {
    title: "Homiedex",
    description:
      "Polished directory of AI companion agents, prompt parameters, and generative assets built for the Digital Alchemy ecosystem.",
    category: "AI Tools",
    tags: ["Next.js", "Supabase", "Agents", "Tailwind CSS"],
    url: "https://homiedex.digitalalchemy.dev",
    screenshot: screenshotUrl("https://homiedex.digitalalchemy.dev"),
  },
  {
    title: "QR Forge Pro",
    description:
      "Professional QR code generator with custom styling, logo embedding, and batch export. Built with Next.js.",
    category: "AI Tools",
    tags: ["Next.js", "QR Codes", "Design Tool"],
    url: "https://qrcodybydb.vercel.app/",
    screenshot: screenshotUrl("https://qrcodybydb.vercel.app/"),
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
      "AI-powered screenshot beautifier that transforms plain captures into styled, social-ready images.",
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
    title: "The 77",
    description:
      "Community platform with curated content and collaborative features. Built with modern web stack.",
    category: "Code",
    tags: ["Community", "Next.js", "Platform"],
    url: "https://the-77.vercel.app",
    screenshot: screenshotUrl("https://the-77.vercel.app"),
  },
  {
    title: "Video Analyzer",
    description:
      "AI video analysis tool that extracts insights, transcripts, and key moments from uploaded video content.",
    category: "Video",
    tags: ["AI Video", "Analysis", "Transcription"],
    url: "https://videoanalyzergoogle.vercel.app",
    screenshot: screenshotUrl("https://videoanalyzergoogle.vercel.app"),
  },
  {
    title: "Soul Reset",
    description:
      "She Builds Digital — a soulful digital product platform for women creators. Custom e-commerce experience with curated downloads.",
    category: "Code",
    tags: ["She Builds Digital", "E-Commerce", "TypeScript"],
    url: "https://soulreset.vercel.app",
    screenshot: screenshotUrl("https://soulreset.vercel.app"),
  },

  // ── The SheBuilds Creator Tools Suite (Clickable) ──
  {
    title: "SheBuilds Chibi Generator",
    description:
      "Free African-styled chibi character generator. Parametric SVG sprites with optional AI Nano remix capabilities.",
    category: "Creator Tools",
    tags: ["React", "SVG", "AI Character", "SheBuilds"],
    url: "https://shebuilds-chibi-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-chibi-generator.vercel.app"),
  },
  {
    title: "SheBuilds Storybook Generator",
    description:
      "AI-powered storybook outline generator. Input age, theme, and prompts to output a complete KDP-ready narrative.",
    category: "Creator Tools",
    tags: ["Gemini AI", "Next.js", "Publishing", "SheBuilds"],
    url: "https://shebuilds-storybook-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-storybook-generator.vercel.app"),
  },
  {
    title: "SheBuilds Pattern Generator",
    description:
      "Free seamless vector pattern generator. 8 mathematical styling rules with custom KDP-ready export filters.",
    category: "Creator Tools",
    tags: ["Next.js", "Vectors", "Design", "SheBuilds"],
    url: "https://shebuilds-pattern-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-pattern-generator.vercel.app"),
  },
  {
    title: "SheBuilds Coloring Generator",
    description:
      "Free printable coloring page generator using algorithmic zentangles and customizable photo-to-line-art sketch pipelines.",
    category: "Creator Tools",
    tags: ["Canvas", "Zentangle", "AI Sketches", "SheBuilds"],
    url: "https://shebuilds-coloring-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-coloring-generator.vercel.app"),
  },
  {
    title: "SheBuilds Text Generator",
    description:
      "Luxe decorative text and typography generator utilizing Google Fonts and custom dynamic SVG glow effects.",
    category: "Creator Tools",
    tags: ["Typography", "SVG Filters", "KDP", "SheBuilds"],
    url: "https://shebuilds-text-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-text-generator.vercel.app"),
  },
  {
    title: "SheBuilds Magazine Generator",
    description:
      "Free high-end editorial magazine cover builder. 12 customizable luxury templates with rich layout control.",
    category: "Creator Tools",
    tags: ["Next.js", "Editorial", "Layouts", "SheBuilds"],
    url: "https://shebuilds-magazine-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-magazine-generator.vercel.app"),
  },
  {
    title: "SheBuilds Ebook Generator",
    description:
      "Outline-first guided ebook creator with deep Gemini AI generation. Instantly map out robust chapter structures.",
    category: "Creator Tools",
    tags: ["Gemini AI", "Outline Engine", "Writing", "SheBuilds"],
    url: "https://shebuilds-ebook-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-ebook-generator.vercel.app"),
  },
  {
    title: "SheBuilds Sticker Studio",
    description:
      "Free sticker sheet studio. Upload custom art or generate designs with AI to output kiss-cut KDP sticker sheets.",
    category: "Creator Tools",
    tags: ["Canvas", "Print Ready", "Stickers", "SheBuilds"],
    url: "https://shebuilds-sticker-studio.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-sticker-studio.vercel.app"),
  },
  {
    title: "SheBuilds Photo Generator",
    description:
      "Photorealistic character generator with controlled parametric prompt injections, built with Gemini/Imagen.",
    category: "Creator Tools",
    tags: ["Imagen", "AI Photography", "Next.js", "SheBuilds"],
    url: "https://shebuilds-photo-generator.vercel.app",
    screenshot: screenshotUrl("https://shebuilds-photo-generator.vercel.app"),
  },

  // ── Static Media Collections & Curations ──
  {
    title: "AI Music Collection",
    description:
      "45+ original tracks created with Suno AI. Full commercial rights. Genres spanning lo-fi, cinematic, hip-hop, and ambient.",
    category: "Music",
    tags: ["Suno", "AI Music", "Commercial Rights"],
  },

  // ── Showcased Repos (Static / Non-clickable Cards to Protect Admin/Private URLs) ──
  {
    title: "Agent Factory",
    description:
      "Claude Code management app for browsing, searching, creating, and editing 645+ skills, agents, commands, and plugins. Full dark mode command center UI.",
    category: "AI Tools",
    tags: ["Claude SDK", "TypeScript", "Agent Management", "645+ Skills"],
    hideUrl: true,
    repoUrl: "https://github.com/jackdog668/Agent-Factory",
  },
  {
    title: "DA Command Center",
    description:
      "14-tab project dashboard with vault analytics, project atlas, and activity timeline. Zero external dependencies — pure HTML/CSS/JS.",
    category: "Code",
    tags: ["Dashboard", "Zero Deps", "Analytics", "14 Tabs"],
    hideUrl: true,
    repoUrl: "https://github.com/jackdog668/Digital-Alchemy-Command-Center",
  },
  {
    title: "100 Day App Challenge",
    description:
      "Ship 1 app per day for 100 days. Built with Expo and React Native. Documenting the entire journey from concept to App Store.",
    category: "Code",
    tags: ["Expo", "React Native", "Challenge", "Mobile"],
    hideUrl: true,
  },
  {
    title: "Biz Agent",
    description:
      "AI-powered business intelligence agent using Claude SDK. Autonomous research, analysis, and report generation for business decisions.",
    category: "AI Tools",
    tags: ["Claude SDK", "Business Intel", "Autonomous Agent"],
    hideUrl: true,
  },
  {
    title: "Sec Context",
    description:
      "AI code security anti-patterns distilled from 150+ sources. Context injection system to help LLMs generate safer, more secure code.",
    category: "Code",
    tags: ["Security", "150+ Sources", "LLM Context", "Anti-Patterns"],
    hideUrl: true,
  },
  {
    title: "Reddit Analyzer",
    description:
      "Reddit niche analysis tool powered by Claude AI. Scrapes subreddits, identifies trends, analyzes sentiment, and surfaces opportunities.",
    category: "AI Tools",
    tags: ["Claude AI", "Reddit", "Niche Analysis", "Scraping"],
    hideUrl: true,
  },
  {
    title: "Digital Alchemy OS",
    description:
      "Operating system-style interface for the Digital Alchemy ecosystem. Window management, app launcher, and unified workspace.",
    category: "Code",
    tags: ["TypeScript", "OS Interface", "Window Manager"],
    hideUrl: true,
  },
  {
    title: "Remotion Cinematic",
    description:
      "Programmatic video generation pipeline using Remotion. Create cinematic content from code — titles, transitions, and effects automated.",
    category: "Video",
    tags: ["Remotion", "React", "Video Pipeline", "Automation"],
    hideUrl: true,
  },
  {
    title: "This Day in Black Excellence",
    description:
      "Daily education app celebrating Black history and achievements. AI-curated content with rich storytelling and visual design.",
    category: "Code",
    tags: ["Education", "Black History", "TypeScript", "AI Content"],
    hideUrl: true,
  },
  {
    title: "Collab Connect",
    description:
      "Collaboration platform connecting creators with complementary skills. Matchmaking engine, project boards, and real-time messaging.",
    category: "Code",
    tags: ["Collaboration", "Matchmaking", "TypeScript"],
    hideUrl: true,
  },
  {
    title: "Prompt Database v3",
    description:
      "Third-generation prompt management system. Store, tag, version, and remix prompts across AI tools. Search and filter by model, use case, and performance.",
    category: "AI Tools",
    tags: ["Prompt Engineering", "Database", "v3", "TypeScript"],
    hideUrl: true,
  },
  {
    title: "Midjourney Agent",
    description:
      "Autonomous agent for Midjourney workflow automation. Batch generation, style management, upscaling pipelines, and gallery organization.",
    category: "AI Tools",
    tags: ["Midjourney", "Automation", "Agent", "Image Gen"],
    hideUrl: true,
  },
  {
    title: "SREF Scanner",
    description:
      "Midjourney style reference scanner and cataloger. Extract, analyze, and organize --sref codes for consistent aesthetic control.",
    category: "Design",
    tags: ["Midjourney", "--sref", "Style Reference", "Catalog"],
    hideUrl: true,
  },
  {
    title: "Chromatic Illusion Weaponizer",
    description:
      "Creative visual effects tool that transforms images into chromatic illusion art. Color theory meets algorithmic manipulation.",
    category: "Design",
    tags: ["Visual Effects", "Color Theory", "TypeScript", "Algorithmic Art"],
    hideUrl: true,
  },
];

export const categories: ProjectCategory[] = [
  "All",
  "Music",
  "Design",
  "Code",
  "Video",
  "AI Tools",
  "Creator Tools",
];
