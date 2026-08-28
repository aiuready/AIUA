// Content for /other-programs/[slug]. Sourced from the AIUA Blueprint's
// Part 6 (Scalable Growth Blueprint) and Part 4 (Revenue Model) - these
// are Stage 2/3 initiatives (Year 1-2+), not things currently running.
// Copy is written in future/building language on purpose, not present-
// tense claims of an active cohort/accelerator/summit that doesn't exist
// yet - see the "status" field on each.

export type OtherProgramContent = {
  slug: string;
  eyebrow: string;
  title: string;
  tagline: string;
  status: string;
  description: string;
  features: { title: string; description: string }[];
  ctaLabel: string;
  ctaHref: string;
};

export const OTHER_PROGRAMS: Record<string, OtherProgramContent> = {
  "ai-innovation-challenge": {
    slug: "ai-innovation-challenge",
    eyebrow: "Community",
    title: "AI Innovation Challenge",
    tagline: "A short, focused sprint to build something real with AI.",
    status: "Runs alongside our cohorts as they launch",
    description:
      "A time-boxed challenge — days, not months — where learners and the wider public tackle a real African problem using AI tools. It's the fastest way to feel what AIUA is about before committing to a full course: build a habit, get a working result, and see what's possible.",
    features: [
      {
        title: "5–7 day sprint format",
        description:
          "Short enough to finish, structured enough to actually produce something you can show.",
      },
      {
        title: "Real problems, not toy exercises",
        description:
          "Challenges are framed around agriculture, health, education, and financial inclusion — the same domains covered in our African AI school.",
      },
      {
        title: "A path into AIUA proper",
        description:
          "Top entries are highlighted at AI Summit Africa, and every participant gets a fast track into AI Foundations.",
      },
    ],
    ctaLabel: "Start with AI Foundations",
    ctaHref: "/programs/ai-foundations",
  },

  "ai-summit-africa": {
    slug: "ai-summit-africa",
    eyebrow: "Flagship event",
    title: "AI Summit Africa",
    tagline: "AIUA's annual gathering — case studies, awards, and a stage for what African builders are shipping with AI.",
    status: "Planned for Stage 3 of our rollout, as our hub cities come online",
    description:
      "Once AIUA has hubs running in Lagos, Accra, Nairobi, Kigali, and Johannesburg, the Summit becomes the moment they all connect — graduate case studies presented on stage, an AI Awards ceremony, and a place for employers, instructors, and founders to meet the people actually doing the work.",
    features: [
      {
        title: "Graduate case studies",
        description:
          "African AI school capstones — locally relevant AI solution proposals — get a real audience, not just a grade.",
      },
      {
        title: "AI Awards",
        description: "Recognition for the strongest student projects, instructors, and businesses built through AIUA.",
      },
      {
        title: "Employer and partner floor",
        description: "Where the AI Talent Network and Enterprise AI relationships turn into real conversations.",
      },
    ],
    ctaLabel: "See the certification pathway",
    ctaHref: "/ai-university/certifications",
  },

  "ai-startup-accelerator": {
    slug: "ai-startup-accelerator",
    eyebrow: "For founders",
    title: "AI Startup Accelerator",
    tagline: "The next step after your AI Business or AI Entrepreneurship capstone.",
    status: "Opens as our first Business Track cohorts graduate",
    description:
      "AI Business and AI Entrepreneurship both end in a capstone: a pitched, validated AI business concept. The strongest of those don't just get a certificate — they're the pipeline for AIUA's Startup Incubator, built to carry a real idea from pitch deck to paying customers.",
    features: [
      {
        title: "Capstone-fed, not open application",
        description:
          "Eligibility starts with completing the AI Business or AI Entrepreneurship capstone and pitch.",
      },
      {
        title: "Built on what you already validated",
        description: "No cold start — you come in with a business model canvas and a pitch already behind you.",
      },
      {
        title: "Connected to the Talent and Enterprise networks",
        description: "Access to the same employer and corporate relationships as AI Talent Network and Enterprise AI.",
      },
    ],
    ctaLabel: "Start AI Entrepreneurship",
    ctaHref: "/programs/ai-entrepreneurship",
  },

  "ai-research-institute": {
    slug: "ai-research-institute",
    eyebrow: "Research",
    title: "AI Research Institute",
    tagline: "Studying what AI actually needs to work for African languages, industries, and infrastructure.",
    status: "Early-stage — building on our African AI school's coursework and case studies",
    description:
      "AIUA's School of African AI already asks the hard questions most global AI curricula skip: what happens on a low-bandwidth connection, which African languages current AI tools actually support well, who owns the data. The Research Institute is where that inquiry grows past a single course — tracking gaps, publishing findings, and feeding what we learn straight back into the curriculum.",
    features: [
      {
        title: "Grounded in real coursework",
        description:
          "Starts from African AI school capstones and case studies, not a research agenda invented from scratch.",
      },
      {
        title: "Language and infrastructure gaps",
        description: "A running account of what AI tools do and don't support well across African languages and contexts.",
      },
      {
        title: "Feeds the curriculum, not a separate silo",
        description: "Findings update AI for African Realities and the wider curriculum as tools and gaps change.",
      },
    ],
    ctaLabel: "Explore AI for African Realities",
    ctaHref: "/ai-university/schools",
  },

  "ai-talent-network": {
    slug: "ai-talent-network",
    eyebrow: "Careers",
    title: "AI Talent Network",
    tagline: "The employer- and instructor-facing side of the AI Careers track.",
    status: "Building as our first Career Track graduates come through",
    description:
      "Every AI Careers graduate leaves with a resume, portfolio, and LinkedIn presence built for an AI-aware job market. The Talent Network is the other half: the growing list of employers, freelance clients, and AIUA's own Instructor Marketplace, so a finished certification has somewhere real to go.",
    features: [
      {
        title: "Employer & freelance access",
        description:
          "Career Track graduates get access to the employer network built alongside AI Careers, per the certification pathway.",
      },
      {
        title: "Instructor Marketplace",
        description:
          "AI Fellows and certified instructors from School 8 are listed here with revenue-share eligibility.",
      },
      {
        title: "Verified by design",
        description: "Every candidate's certifications carry a public verification ID employers can check directly.",
      },
    ],
    ctaLabel: "Start AI Careers",
    ctaHref: "/programs/ai-professionals",
  },

  "enterprise-ai": {
    slug: "enterprise-ai",
    eyebrow: "For organizations",
    title: "Enterprise AI",
    tagline: "Custom AI training cohorts for banks, telcos, NGOs, and government agencies.",
    status: "Available now — reach out to scope a cohort",
    description:
      "The corporate-training arm of AI for Professionals: the same sector tracks (Lawyers, HR, Government, NGOs, and more), delivered as a closed cohort for your organization instead of an individual course. This is one of AIUA's core revenue streams, alongside membership, course sales, and licensing — built for institutions that need a whole team AI-ready at once, not one employee at a time.",
    features: [
      {
        title: "Sector tracks, delivered in-house",
        description: "Every AI for Professionals track can run as a private cohort for your organization.",
      },
      {
        title: "Built for institutions",
        description: "Sized and priced for banks, telcos, NGOs, and government agencies, not individual learners.",
      },
      {
        title: "Certification your team can verify",
        description: "Every completion carries a public verification ID — a real audit trail for compliance and HR.",
      },
    ],
    ctaLabel: "Talk to us about a cohort",
    ctaHref: "mailto:hello@aiuready.africa",
  },
};

export const OTHER_PROGRAM_SLUGS = Object.keys(OTHER_PROGRAMS);
