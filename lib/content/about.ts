// Content for /about/[slug]. Sourced from the AIUA Blueprint. Leadership,
// Advisory Council, and Team Members are role-based on purpose: the
// blueprint's Part 7 (Operating Structure) gives role titles, not real
// people, and inventing names/bios/photos would misrepresent who's
// actually behind AIUA (user decision, 2026-08-28). Same principle for
// Student Success on the AI University side.

export type AboutPageContent = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  body?: string[];
  quote?: string;
  roleGroups?: { groupTitle: string; roles: string[] }[];
  note?: string;
};

export const ABOUT_PAGES: Record<string, AboutPageContent> = {
  story: {
    slug: "story",
    eyebrow: "About AIUA",
    title: "Our Story",
    intro:
      "AI University Africa exists because of a gap that's opening faster than anyone can close it the old way.",
    body: [
      "Across Nigeria, Kenya, South Africa, and Uganda, nearly half of online job postings already require digital skills, with AI-specific demand rising steadily. Employers are experimenting with AI faster than their workforces can adapt — the gap isn't awareness, it's capability. Formal universities move on multi-year curriculum cycles; they can't match the speed of employer demand, and by the time a curriculum committee approves a course, the tools it teaches have moved on.",
      "That gap is a 3–5 year window. An institution that can rapidly produce AI-ready talent has a structural advantage over both legacy universities and generic global e-learning platforms that were never built with African languages, infrastructure, or industries in mind.",
      "AIUA was built to be that institution — not a university in the traditional sense, but an outcomes-driven career and business accelerator. Every course, school, and certification is designed to answer one question for the learner: what can I earn, build, automate, or achieve after completing this? Not \"what did I study,\" but what changed.",
      "We're early. The platform you're using today is Phase 1 — 100% digital, mobile-first, meeting learners where they already are. What comes after (hubs in Lagos, Accra, Nairobi, Kigali, and Johannesburg; physical innovation spaces; a million learners across the continent) is the plan, not yet the reality. We'd rather tell you that plainly than oversell where we are.",
    ],
  },

  vision: {
    slug: "vision",
    eyebrow: "About AIUA",
    title: "Vision",
    intro: "A continent where being AI-ready is the default, not the exception.",
    body: [
      "We're building toward one million learners across Africa — not as a vanity number, but because that's roughly the scale at which \"AI-ready\" stops being something a few well-resourced people have access to and starts being infrastructure, the way literacy or a bank account is.",
      "That means AI University Africa scaling past a course catalog into something closer to what LinkedIn is for careers, Coursera is for structured learning, and Netflix is for keeping people coming back — but built around African languages, African industries, and African realities from the first line of curriculum, not retrofitted from a global platform later.",
      "Three phases get us there: 100% digital first, so distance and infrastructure never gate who can start. Hybrid next, with AI University Hubs for hackathons, career fairs, and AI clinics in five cities. Physical last — not classrooms, but innovation labs, content studios, and startup incubators, once the demand and community are proven, not before.",
    ],
  },

  mission: {
    slug: "mission",
    eyebrow: "About AIUA",
    title: "Mission",
    intro: "",
    quote:
      "To make every African AI-ready — not just by teaching artificial intelligence, but by helping people use AI to build careers, businesses, and solutions for Africa's future.",
    body: [
      "That's a deliberate choice of words. \"Teaching AI\" and \"AI-ready\" sound similar but aren't the same thing. A learner who can explain how a large language model works but never touches a real task hasn't gotten what they came for. Every AIUA course, from a two-week Foundations track to a six-week Builder capstone, is graded against a harder question: can this person now earn, build, automate, or achieve something they couldn't before?",
      "That's also why certification at AIUA isn't a single \"Certificate of Completion.\" It's a progression — AI Practitioner, Specialist, Professional, Consultant, Instructor, Fellow — because readiness isn't a single moment, and neither is the mission.",
    ],
  },

  leadership: {
    slug: "leadership",
    eyebrow: "About AIUA",
    title: "Leadership",
    intro: "The team we're building, honestly stated.",
    body: [
      "AI University Africa is early-stage. Rather than publish placeholder names and stock photos, here's the leadership structure we're actually building toward, drawn directly from our own operating plan — filled as the right people join, not before.",
    ],
    roleGroups: [
      {
        groupTitle: "Executive Team",
        roles: ["Founder / President", "Academic Director", "Operations Manager", "Marketing Lead", "Partnerships Lead"],
      },
    ],
    note: "Interested in one of these roles, or in advising AIUA directly? Reach out at hello@aiuready.africa.",
  },

  "advisory-council": {
    slug: "advisory-council",
    eyebrow: "About AIUA",
    title: "Advisory Council",
    intro: "Being built alongside our government, university, and corporate partnerships.",
    body: [
      "AIUA's growth plan leans on formal partnerships — with governments drafting national AI policy, with universities considering curriculum licensing, and with employers who need AI-ready hires faster than they can train them internally. An Advisory Council of people who've done that work already is part of how we get those partnerships right instead of guessing.",
      "We're not naming seats that aren't filled. If you work in African AI policy, education, or industry and want to help shape this from the outside, we'd genuinely like to hear from you.",
    ],
    note: "Reach out at hello@aiuready.africa if you'd like to be part of the council.",
  },

  team: {
    slug: "team",
    eyebrow: "About AIUA",
    title: "Team Members",
    intro: "Four teams, scaling in step with the platform — not ahead of it.",
    body: [
      "Our own operating plan is explicit about this: headcount should scale with revenue-stream maturity, not before it. So this page shows the shape of the team we're hiring into as AIUA grows through Stage 1 and 2, not a roster of names that don't exist yet.",
    ],
    roleGroups: [
      { groupTitle: "Academic Team", roles: ["Curriculum Designers", "AI Instructors", "Teaching Assistants", "Community Managers"] },
      { groupTitle: "Growth Team", roles: ["Content Creators", "Video Editors", "Sales Representatives", "Affiliate Managers"] },
      { groupTitle: "Technology Team", roles: ["LMS Administrator", "Automation Specialist", "Developer", "Support"] },
    ],
    note: "Want to be one of these people? Reach out at hello@aiuready.africa.",
  },
};

export const ABOUT_SLUGS = Object.keys(ABOUT_PAGES);
