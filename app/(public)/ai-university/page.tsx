import { ArrowRight, Award, GraduationCap, Layers } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = { title: "AI University" };

export default function AIUniversityOverviewPage() {
  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            AI University
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Africa&rsquo;s AI Workforce University
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Not a traditional online university. AIUA is built as an
            outcomes-driven career and business accelerator — a hybrid of
            Netflix&rsquo;s engagement, Coursera&rsquo;s structure, LinkedIn&rsquo;s career
            infrastructure, and a level of polish that treats African
            learners like a real market, not an afterthought.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading
          eyebrow="Why this exists"
          title="The gap isn't awareness — it's capability"
          description="Employers are experimenting with AI faster than their workforces can adapt. Formal universities move on multi-year curriculum cycles and can't match that speed. AIUA is built to."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Eight schools, one platform
            </h3>
            <p className="text-sm text-muted-foreground">
              Each school is a full learner pathway with its own entry point,
              progression, and career or business outcome — not a flat course
              catalog.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              A real progression ladder
            </h3>
            <p className="text-sm text-muted-foreground">
              AI Practitioner → Specialist → Professional → Consultant →
              Instructor → Fellow. Every level signals something specific to
              an employer, not just &ldquo;completed.&rdquo;
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Three phases, deliberately
            </h3>
            <p className="text-sm text-muted-foreground">
              100% digital first (where we are today), then hybrid hubs, then
              physical innovation spaces — only once each phase earns the
              next.
            </p>
          </div>
        </div>
      </Section>

      <Section className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          See how it all fits together
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/ai-university/schools" size="lg" fullWidthMobile>
            Browse the 8 schools
            <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink href="/ai-university/certifications" variant="outline" size="lg" fullWidthMobile>
            See the certification pathway
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
