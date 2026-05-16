// Digital Alchemy Brand Constants

export const SITE = {
  name: "Digital Alchemy",
  tagline: "Learn to Build with AI. Own Everything You Create.",
  description:
    "Learn to build real apps, create AI music, design stunning visuals — and turn those skills into income. No coding experience required.",
  url: "https://digitalalchemy.dev",
  founder: "Desmond Baker Jr",
  credential: "Google Gemini Certified Educator",
  skoolUrl: "https://www.skool.com/digital-alchemy-7170",
  beaconsUrl: "https://beacons.ai/dbcreations",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "School", href: "/school" },
  { label: "Events", href: "/events" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
] as const;

// Real social handles, sourced from beacons.ai/dbcreations.
// Ordered by surface priority — what shows first in icon rows.
// YouTube intentionally omitted (no channel on beacons). Add here when ready.
export const SOCIAL_LINKS = [
  {
    platform: "instagram",
    url: "https://instagram.com/digitalalchemy.dev",
    handle: "@digitalalchemy.dev",
    label: "Instagram",
  },
  {
    platform: "tiktok",
    url: "https://tiktok.com/@db_alchemy",
    handle: "@db_alchemy",
    label: "TikTok",
  },
  {
    platform: "threads",
    url: "https://www.threads.net/@digitalalchemy.dev",
    handle: "@digitalalchemy.dev",
    label: "Threads",
  },
  {
    platform: "twitter",
    url: "https://twitter.com/db_alchemy",
    handle: "@db_alchemy",
    label: "X (Twitter)",
  },
  {
    platform: "linkedin",
    url: "https://www.linkedin.com/in/desmond-baker-jr-896892103/",
    handle: "Desmond Baker",
    label: "LinkedIn",
  },
  {
    platform: "substack",
    url: "https://substack.com/@digitalalchemydb",
    handle: "@digitalalchemydb",
    label: "Substack",
  },
  {
    platform: "github",
    url: "https://github.com/jackdog668",
    handle: "@jackdog668",
    label: "GitHub",
  },
  {
    platform: "pinterest",
    url: "https://www.pinterest.com/dbcreations_/",
    handle: "@dbcreations_",
    label: "Pinterest",
  },
  {
    platform: "facebook",
    url: "https://www.facebook.com/profile.php?id=61554759607214",
    handle: "DB Creations",
    label: "Facebook",
  },
] as const;

export type SocialPlatform = (typeof SOCIAL_LINKS)[number]["platform"];
