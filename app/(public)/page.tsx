import Link from "next/link";
import {
  Search,
  CreditCard,
  Award,
  Smartphone,
  Wallet,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Section, SectionHeading } from "@/components/ui/section";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";
import { SCHOOL_ICONS } from "@/lib/school-icons";
import { SCHOOL_BLURBS } from "@/lib/school-blurbs";

export default async function HomePage() {
  const [featured, courseCount] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, title: true, school: true, priceKobo: true },
    }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <main>
      {/* --- Hero --- */}
      <Section className="pt-14 sm:pt-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            AI University Africa
          </span>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Learn. Build. Earn with AI.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Practical AI courses across 8 schools — taught by instructors,
            paid for in naira, and finished with a certificate any employer
            can verify in seconds.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/courses" size="lg" fullWidthMobile>
              Browse courses
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/signup" variant="outline" size="lg" fullWidthMobile>
              Sign up free
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* --- Trust strip: honest, capability-based, not fabricated stats --- */}
      <div className="border-y border-border bg-muted">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          <Stat label="Schools" value="8" />
          <Stat label="Payment options" value="Paystack + Flutterwave" />
          <Stat label="Certificate check" value="No login needed" />
          <Stat label="Pricing" value="₦ Naira-native" />
        </div>
      </div>

      {/* --- How it works --- */}
      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="From browsing to certified, in three steps"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <HowItWorksCard
            icon={Search}
            step="1"
            title="Find a course"
            description="Filter by school — Foundations, Business, Content, Careers, Professionals, Builders, African AI, or Instructor Track."
          />
          <HowItWorksCard
            icon={CreditCard}
            step="2"
            title="Enroll & pay once"
            description="No subscriptions. Pay once with Paystack or Flutterwave and get instant access."
          />
          <HowItWorksCard
            icon={Award}
            step="3"
            title="Learn & get certified"
            description="Work through video, PDFs, and quizzes at your pace. Finish and earn a publicly verifiable certificate."
          />
        </div>
      </Section>

      {/* --- Schools grid --- */}
      <Section muted>
        <SectionHeading
          eyebrow="8 schools"
          title="Whatever you want to do with AI, there's a school for it"
          description="Every course belongs to one of eight schools, so you can go straight to what's relevant to you."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_SCHOOLS.map((school) => {
            const Icon = SCHOOL_ICONS[school];
            return (
              <Link
                key={school}
                href={`/courses?school=${school}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {SCHOOL_LABELS[school]}
                </span>
                <span className="text-sm text-muted-foreground">{SCHOOL_BLURBS[school]}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* --- Featured courses (live data) --- */}
      <Section>
        <SectionHeading
          eyebrow="Courses"
          title="Featured courses"
          description={
            courseCount > 0
              ? `${courseCount} published course${courseCount === 1 ? "" : "s"} and counting.`
              : undefined
          }
        />
        {featured.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No courses published yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/courses" variant="outline">
            See all courses
            <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </Section>

      {/* --- Why AIUA --- */}
      <Section muted>
        <SectionHeading eyebrow="Why AIUA" title="Built for how Africa actually learns online" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon={Smartphone}
            title="Mobile-first"
            description="Fast and usable on a mid-range Android phone over 3G/4G."
          />
          <ValueCard
            icon={Wallet}
            title="Naira-native pricing"
            description="Prices shown in ₦, no currency conversion guesswork."
          />
          <ValueCard
            icon={CreditCard}
            title="Two payment gateways"
            description="Pay with Paystack or Flutterwave — pick whichever works for you, and retry if a payment fails."
          />
          <ValueCard
            icon={Users}
            title="Real instructors"
            description="Courses built and taught by working practitioners, not auto-generated content."
          />
        </div>
      </Section>

      {/* --- Certificate verification callout --- */}
      <Section>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </span>
          <h2 className="max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Every AIUA certificate is publicly verifiable
          </h2>
          <p className="max-w-lg text-base text-muted-foreground">
            An employer can check any certificate ID on our public verification
            page — no login, no account, just an instant valid/revoked answer.
          </p>
          <ButtonLink href="/verify" size="lg">
            Verify a certificate
            <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </Section>

      {/* --- FAQ --- */}
      <Section muted>
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <FaqItem question="How much do courses cost?">
            Pricing is per course, shown in naira on each course page — there
            are no subscriptions in AIUA today. You pay once and keep access.
          </FaqItem>
          <FaqItem question="What if my payment fails?">
            You can retry a failed payment from your Purchases page without
            losing your spot or re-enrolling from scratch.
          </FaqItem>
          <FaqItem question="How does the certificate work?">
            Finish every module and pass its quiz, and a certificate PDF is
            generated automatically with a unique ID that anyone can check on
            our public /verify page — no login required.
          </FaqItem>
          <FaqItem question="Can I teach a course on AIUA?">
            Instructor accounts are set up by an AIUA admin, not through
            public sign-up. Reach out and, once your account is created,
            you&rsquo;ll log in at your own instructor login page.
          </FaqItem>
          <FaqItem question="Do I need a laptop to learn?">
            No — AIUA is built mobile-first, so course video, PDFs, and quizzes
            all work on a standard Android phone.
          </FaqItem>
        </div>
      </Section>

      {/* --- Final CTA --- */}
      <Section className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ready to learn something that pays off?
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/courses" size="lg" fullWidthMobile>
            Browse courses
          </ButtonLink>
          <ButtonLink href="/signup" variant="outline" size="lg" fullWidthMobile>
            Create your account
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-lg font-bold text-foreground sm:text-xl">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function HowItWorksCard({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof Search;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Step {step}
        </span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={20} />
      </span>
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-border bg-card px-5 py-4 open:pb-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-sm font-semibold text-foreground">
        {question}
        <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">{children}</p>
    </details>
  );
}
