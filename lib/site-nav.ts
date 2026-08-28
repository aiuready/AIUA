// Single source of truth for the public site nav (desktop dropdown +
// mobile accordion both render from this). COURSES/SCHOOLS dropdown links
// to rich program pages (app/(public)/programs/*) written from the AIUA
// Blueprint, distinct from the live course catalog (/courses) which is
// driven by the real Course.school DB field - see docs note in
// app/(public)/ai-university/schools/page.tsx for why these two things
// intentionally don't share one taxonomy.
export type NavLink = { label: string; href: string };
export type NavSection = { label: string; href: string; items: NavLink[] };
export type NavEntry = NavLink | NavSection;

export function hasItems(entry: NavEntry): entry is NavSection {
  return "items" in entry;
}

export const SITE_NAV: NavEntry[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    items: [
      { label: "Our Story", href: "/about/story" },
      { label: "Vision", href: "/about/vision" },
      { label: "Mission", href: "/about/mission" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "Advisory Council", href: "/about/advisory-council" },
      { label: "Team Members", href: "/about/team" },
    ],
  },
  {
    label: "AI University",
    href: "/ai-university",
    items: [
      { label: "Overview", href: "/ai-university" },
      { label: "Schools", href: "/ai-university/schools" },
      { label: "Certifications", href: "/ai-university/certifications" },
      { label: "Student Success", href: "/ai-university/student-success" },
    ],
  },
  {
    label: "Courses/Schools",
    href: "/courses",
    items: [
      { label: "AI Foundations", href: "/programs/ai-foundations" },
      { label: "AI Productivity", href: "/programs/ai-productivity" },
      { label: "AI Business", href: "/programs/ai-business" },
      { label: "AI Professionals", href: "/programs/ai-professionals" },
      { label: "AI Agents", href: "/programs/ai-agents" },
      { label: "AI Developers", href: "/programs/ai-developers" },
      { label: "AI Entrepreneurship", href: "/programs/ai-entrepreneurship" },
    ],
  },
  {
    label: "Other Programs",
    href: "/other-programs",
    items: [
      { label: "AI Innovation Challenge", href: "/other-programs/ai-innovation-challenge" },
      { label: "AI Summit Africa", href: "/other-programs/ai-summit-africa" },
      { label: "AI Startup Accelerator", href: "/other-programs/ai-startup-accelerator" },
      { label: "AI Research Institute", href: "/other-programs/ai-research-institute" },
      { label: "AI Talent Network", href: "/other-programs/ai-talent-network" },
      { label: "Enterprise AI", href: "/other-programs/enterprise-ai" },
    ],
  },
  { label: "Verify Certificate", href: "/verify" },
];
