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
  link?: string;
}

export const projects: Project[] = [
  {
    title: "AI Music Collection",
    description:
      "45+ original tracks created with Suno AI. Full commercial rights. Genres spanning lo-fi, cinematic, hip-hop, and ambient.",
    category: "Music",
    tags: ["Suno", "AI Music", "Commercial Rights"],
  },
  {
    title: "Afrocentric Surrealism Series",
    description:
      "AI-generated art collection blending Afrofuturism with surrealist aesthetics. Created with Midjourney.",
    category: "Design",
    tags: ["Midjourney", "AI Art", "Afrofuturism"],
  },
  {
    title: "Digital Alchemy Academy",
    description:
      "Full-stack Skool community platform with courses, challenges, and accountability systems for 100+ members.",
    category: "Code",
    tags: ["Skool", "Community", "Education"],
  },
  {
    title: "Idea2PRD Generator",
    description:
      "AI-powered app that transforms rough ideas into professional Product Requirement Documents in minutes.",
    category: "AI Tools",
    tags: ["Gemini", "Automation", "Product"],
  },
  {
    title: "Command Center Dashboard",
    description:
      "Custom dashboard aggregating all Digital Alchemy tools, metrics, and workflows into one unified interface.",
    category: "Code",
    tags: ["Next.js", "Firebase", "Dashboard"],
  },
  {
    title: "AI Video Workshop Series",
    description:
      "Educational video content produced using AI-assisted editing, scripting, and visual effects workflows.",
    category: "Video",
    tags: ["AI Video", "Education", "Production"],
  },
  {
    title: "Brand Asset Generator",
    description:
      "Custom tool that generates consistent brand assets — logos, social templates, and marketing materials — using AI.",
    category: "AI Tools",
    tags: ["Branding", "Automation", "Design"],
  },
  {
    title: "100 App Challenge",
    description:
      "Building 100 apps with AI assistance. Documenting the journey, sharing the code, proving what's possible.",
    category: "Code",
    tags: ["Vibe Coding", "Challenge", "Apps"],
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
