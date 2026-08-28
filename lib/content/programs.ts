// Content for /programs/[slug] - the COURSES/SCHOOLS dropdown. Sourced
// from the AIUA Blueprint (July 2026). Where the nav asks for two pages
// that map to one blueprint course (AI Agents / AI Developers both come
// from School 6; AI Business / AI Entrepreneurship both come from School
// 2), the same curriculum is shown on both but with different audience
// framing in the hero - real curriculum isn't duplicated/invented per
// page, only the positioning differs. This is a marketing/program layer;
// it doesn't drive the live course catalog (see lib/school-labels.ts) -
// see the note in app/(public)/ai-university/schools/page.tsx.

export type BlueprintCourse = {
  title: string;
  duration: string;
  format: string;
  audience: string;
  objectives: string[];
  modules: string[];
  outcomes: string[];
  certification: string;
};

export type ProfessionalTrack = { name: string; useCases: string };

export type ProgramContent = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  courses?: BlueprintCourse[];
  tracks?: ProfessionalTrack[];
  catalogSchool?: string; // maps to a real Course.school for the "Browse courses" CTA
};

export const PROGRAMS: Record<string, ProgramContent> = {
  "ai-foundations": {
    slug: "ai-foundations",
    eyebrow: "School 1 · Entry point",
    title: "AI Foundations",
    description:
      "No prior technical knowledge required. This is where every AIUA learner starts — plain-language AI literacy, responsible use, and your first working AI toolkit.",
    catalogSchool: "FOUNDATIONS",
    courses: [
      {
        title: "AI Literacy & Foundations",
        duration: "2 weeks (8–10 hours total)",
        format: "Self-paced + weekly live class",
        audience: "Complete beginners, all ages",
        objectives: [
          "Understand what AI is and how large language models work in plain language",
          "Recognize the practical difference between AI tools (chat, image, voice, agents)",
          "Apply responsible and ethical AI use in daily life and work",
        ],
        modules: [
          "What Is AI? A Non-Technical Introduction",
          "A Short History of AI and Why It Matters Now",
          "Understanding Generative AI (text, image, audio, video)",
          "Introduction to Prompting",
          "AI Ethics & Responsible Use",
          "Using AI for Internet Research",
          "AI for Everyday Productivity — First Wins",
          "Capstone — Personal AI Toolkit Setup",
        ],
        outcomes: [
          "Explain AI capabilities and limits to a non-expert",
          "A working personal AI toolkit (2–3 tools)",
          "Pass the AI Literacy assessment",
        ],
        certification: "AI Practitioner — Level 1",
      },
      {
        title: "ChatGPT & Claude Mastery",
        duration: "3 weeks",
        format: "Self-paced + live labs",
        audience: "Foundations graduates, professionals",
        objectives: [
          "Master prompt engineering for accuracy, tone, and format",
          "Use advanced features: projects, memory, deep research, and automation",
          "Apply AI reasoning tools to real business and academic tasks",
        ],
        modules: [
          "Prompt Engineering Fundamentals",
          "Advanced Prompting — Chain-of-Thought & Role Prompting",
          "Using Memory & Projects for Ongoing Work",
          "Deep Research & Fact-Checking with AI",
          "AI for Professional Writing",
          "Reasoning Models — When and How to Use Them",
          "Business Applications Workshop",
          "Capstone — Build a Personal Prompt Library",
        ],
        outcomes: [
          "A reusable prompt library for your own work or business",
          "Ability to complete a research task in under 30 minutes using AI",
          "Certified prompt engineering competency",
        ],
        certification: "AI Practitioner — Level 2",
      },
    ],
  },

  "ai-productivity": {
    slug: "ai-productivity",
    eyebrow: "School 1 · Everyday AI",
    title: "AI Productivity",
    description:
      "Turn AI into hours back in your week. A focused, self-paced track for working professionals and students who want fewer repetitive tasks, not a computer science lesson.",
    catalogSchool: "FOUNDATIONS",
    courses: [
      {
        title: "AI for Daily Productivity",
        duration: "2 weeks",
        format: "Self-paced",
        audience: "Working professionals, students",
        objectives: [
          "Reduce time spent on repetitive digital tasks by 60–80%",
          "Apply AI across email, scheduling, research, spreadsheets and writing",
          "Build a personal automated workflow",
        ],
        modules: [
          "Email Triage & Drafting with AI",
          "AI-Assisted Research & Summarization",
          "Meeting Notes, Scheduling & Follow-ups",
          "AI in Spreadsheets — Formulas, Analysis, Dashboards",
          "Writing & Editing Faster with AI",
          "Learning Faster with AI Study Tools",
          "Capstone — “10 Hours to 2 Hours” Workflow Redesign",
        ],
        outcomes: [
          "A documented before/after time-savings workflow",
          "A personal AI productivity stack in daily use",
        ],
        certification: "AI Practitioner — Level 2",
      },
    ],
  },

  "ai-business": {
    slug: "ai-business",
    eyebrow: "School 2 · Run smarter",
    title: "AI Business",
    description:
      "For founders and small business owners already running something — apply AI across marketing, sales, finance, and operations to cut costs and move faster.",
    catalogSchool: "BUSINESS",
    courses: [
      {
        title: "AI for Entrepreneurs & Business Models",
        duration: "4 weeks",
        format: "Cohort-based, live + self-paced",
        audience: "Founders, small business owners",
        objectives: [
          "Identify viable AI-powered business models for local markets",
          "Apply AI across marketing, sales, finance and operations",
          "Develop and pitch a validated AI business concept",
        ],
        modules: [
          "AI Business Models — What’s Working in Africa",
          "AI Marketing — Content, Ads & Growth",
          "AI Sales — Outreach, CRM & Conversion",
          "AI Customer Service — Chatbots & Support Automation",
          "AI Finance — Budgeting, Forecasting & Reporting",
          "AI Operations — Workflow & Process Automation",
          "AI Strategy — Choosing Tools & Avoiding Hype",
          "Capstone — Launch a Business Using AI (pitch to panel)",
        ],
        outcomes: [
          "A live or launched AI-powered micro-business",
          "A complete business model canvas and pitch deck",
          "Eligibility for the AIUA Startup Incubator",
        ],
        certification: "AI Specialist — Business Track",
      },
    ],
  },

  "ai-professionals": {
    slug: "ai-professionals",
    eyebrow: "School 5 · Sector-specific",
    title: "AI Professionals",
    description:
      "Short, sector-specific tracks — two weeks each — applying AI directly to a profession’s daily workflow. Every track shares the same structure: real use cases, tool walkthroughs, compliance and ethics, and an applied capstone.",
    catalogSchool: "PROFESSIONALS",
    tracks: [
      { name: "AI for Lawyers", useCases: "Contract review, legal research, document drafting, case summarization" },
      { name: "AI for Doctors", useCases: "Clinical documentation, patient education materials, literature review (non-diagnostic)" },
      { name: "AI for Teachers", useCases: "Lesson planning, differentiated materials, grading assistance, student engagement" },
      { name: "AI for Accountants", useCases: "Reconciliation support, reporting automation, financial analysis narratives" },
      { name: "AI for Engineers", useCases: "Documentation, code assistance, technical writing, design iteration" },
      { name: "AI for HR", useCases: "Job descriptions, screening support, policy drafting, employee communications" },
      { name: "AI for Government", useCases: "Policy briefs, public communication, service-delivery automation" },
      { name: "AI for NGOs", useCases: "Grant writing, impact reporting, program communications, M&E support" },
    ],
  },

  "ai-agents": {
    slug: "ai-agents",
    eyebrow: "School 6 · No-code",
    title: "AI Agents",
    description:
      "Design, connect, and deploy AI agents and automations without writing code — for operators, freelancers, and small teams who want AI doing real work in their business, not just answering questions.",
    catalogSchool: "BUILDERS",
    courses: [
      {
        title: "No-Code AI & Automation Certification",
        duration: "6 weeks",
        format: "Cohort-based, project-driven",
        audience: "Technically curious learners, freelancers, small teams",
        objectives: [
          "Design and deploy no-code automations and AI agents",
          "Connect AI tools to business workflows using integration platforms",
          "Build and ship a working automation for a real business problem",
        ],
        modules: [
          "No-Code Foundations — Logic, Triggers & Actions",
          "Automation Platforms (Zapier / Make / n8n)",
          "Introduction to AI Agents",
          "Working with APIs (OpenAI, Claude and equivalents)",
          "Business Process Automation Design",
          "Data Handling & Integrations",
          "Testing, Monitoring & Maintaining Automations",
          "Capstone — Deploy a Live Automation or Agent",
        ],
        outcomes: [
          "One deployed, functioning automation or AI agent",
          "A technical portfolio piece for freelance or employment use",
        ],
        certification: "AI Consultant — Builder Track",
      },
    ],
  },

  "ai-developers": {
    slug: "ai-developers",
    eyebrow: "School 6 · Technical",
    title: "AI Developers",
    description:
      "The same Builder Track curriculum as AI Agents, pitched at the more technical end — working directly with APIs, handling data and integrations, and shipping something you’d put in a portfolio for freelance or employment work.",
    catalogSchool: "BUILDERS",
    courses: [
      {
        title: "No-Code AI & Automation Certification",
        duration: "6 weeks",
        format: "Cohort-based, project-driven",
        audience: "Developers, technical freelancers, builders",
        objectives: [
          "Work directly with AI provider APIs (OpenAI, Claude and equivalents)",
          "Handle real data pipelines and third-party integrations",
          "Test, monitor, and maintain a production automation or agent",
        ],
        modules: [
          "No-Code Foundations — Logic, Triggers & Actions",
          "Automation Platforms (Zapier / Make / n8n)",
          "Introduction to AI Agents",
          "Working with APIs (OpenAI, Claude and equivalents)",
          "Business Process Automation Design",
          "Data Handling & Integrations",
          "Testing, Monitoring & Maintaining Automations",
          "Capstone — Deploy a Live Automation or Agent",
        ],
        outcomes: [
          "One deployed, functioning automation or AI agent",
          "A technical portfolio piece for freelance or employment use",
        ],
        certification: "AI Consultant — Builder Track",
      },
    ],
  },

  "ai-entrepreneurship": {
    slug: "ai-entrepreneurship",
    eyebrow: "School 2 · Start something",
    title: "AI Entrepreneurship",
    description:
      "The same Business Track curriculum as AI Business, pitched at founders starting from zero — validate an idea, build with AI from day one, and pitch for a seat in the AIUA Startup Incubator.",
    catalogSchool: "BUSINESS",
    courses: [
      {
        title: "AI for Entrepreneurs & Business Models",
        duration: "4 weeks",
        format: "Cohort-based, live + self-paced",
        audience: "Aspiring founders, idea-stage entrepreneurs",
        objectives: [
          "Identify a viable AI-powered business model for your local market",
          "Validate the idea before building anything",
          "Pitch a launch-ready AI business concept to a panel",
        ],
        modules: [
          "AI Business Models — What’s Working in Africa",
          "AI Marketing — Content, Ads & Growth",
          "AI Sales — Outreach, CRM & Conversion",
          "AI Customer Service — Chatbots & Support Automation",
          "AI Finance — Budgeting, Forecasting & Reporting",
          "AI Operations — Workflow & Process Automation",
          "AI Strategy — Choosing Tools & Avoiding Hype",
          "Capstone — Launch a Business Using AI (pitch to panel)",
        ],
        outcomes: [
          "A live or launched AI-powered micro-business",
          "A complete business model canvas and pitch deck",
          "Eligibility for the AIUA Startup Incubator",
        ],
        certification: "AI Specialist — Business Track",
      },
    ],
  },
};

export const PROGRAM_SLUGS = Object.keys(PROGRAMS);
