import { ShieldCheck, Smartphone, Wallet, Users } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";
import { SCHOOL_ICONS } from "@/lib/school-icons";
import { SCHOOL_BLURBS } from "@/lib/school-blurbs";

export const metadata = { title: "About" };

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
        <SectionHeading eyebrow="What we teach" title="Eight schools, one platform" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_SCHOOLS.map((school) => {
            const Icon = SCHOOL_ICONS[school];
            return (
              <div key={school} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {SCHOOL_LABELS[school]}
                </span>
                <span className="text-sm text-muted-foreground">{SCHOOL_BLURBS[school]}</span>
              </div>
            );
          })}
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
