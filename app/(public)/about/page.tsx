import Link from "next/link";
import { ArrowRight, Smartphone, Wallet, ShieldCheck, Users } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { ABOUT_PAGES } from "@/lib/content/about";

export const metadata = { title: "About" };

const ABOUT_CARDS = [
  { slug: "story", label: "Our Story", description: "Why AIUA exists, and the gap it's built to close." },
  { slug: "vision", label: "Vision", description: "Where we're headed — a continent where AI-ready is the default." },
  { slug: "mission", label: "Mission", description: "What every course, school, and certification is graded against." },
  { slug: "leadership", label: "Leadership", description: "The executive structure we're building toward." },
  { slug: "advisory-council", label: "Advisory Council", description: "The partnerships and expertise shaping AIUA from outside." },
  { slug: "team", label: "Team Members", description: "The academic, growth, and technology teams behind the platform." },
];

export default function AboutPage() {
  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            About AIUA
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Practical AI education, built for Africa
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            AI University Africa teaches real, applicable AI skills across
            eight schools — so students across the continent can learn,
            build, and earn with AI, on whatever device they already have.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Learn more" title="About AIUA" center={false} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={`/about/${card.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
            >
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {ABOUT_PAGES[card.slug]?.title ?? card.label}
              </h3>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary">
                Read more <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Our approach" title="Designed around real constraints, not ideal ones" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Smartphone size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">Mobile-first</h3>
            <p className="text-sm text-muted-foreground">
              Built and tested for a mid-range Android phone on 3G/4G — not
              just a desktop demo.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">Naira-native</h3>
            <p className="text-sm text-muted-foreground">
              Prices are set and shown in ₦ from day one, paid via Paystack or
              Flutterwave.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">Verifiable</h3>
            <p className="text-sm text-muted-foreground">
              Every certificate carries an ID anyone can check publicly, with
              no login required.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">Instructor-led</h3>
            <p className="text-sm text-muted-foreground">
              Courses are built and taught by approved instructors, with a
              real grading queue for open-ended work.
            </p>
          </div>
        </div>
      </Section>

      <Section muted className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ready to start learning?
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/courses" size="lg" fullWidthMobile>
            Browse courses
          </ButtonLink>
          <ButtonLink href="/signup" variant="outline" size="lg" fullWidthMobile>
            Sign up free
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
