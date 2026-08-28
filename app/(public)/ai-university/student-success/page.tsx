import { Award, ShieldCheck, TrendingUp } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = { title: "Student Success" };

export default function StudentSuccessPage() {
  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            AI University
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Student Success
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            AIUA is early — we don&rsquo;t have a wall of testimonials to show you
            yet, and we&rsquo;re not going to invent one. Here&rsquo;s what success is
            actually designed to look like, and how you&rsquo;ll be able to verify
            it once it happens.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading
          eyebrow="What success means here"
          title="Not 'completed a course' — 'can now do something'"
          description="Every school is built and graded against one question: what can you earn, build, automate, or achieve after finishing this? That's the bar for success at every level of the certification pathway."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">A real outcome, not a grade</h3>
            <p className="text-sm text-muted-foreground">
              A launched micro-business, a deployed AI agent, a published
              content portfolio, a completed job application sprint — every
              school&rsquo;s capstone produces something you can point to.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">A credential that means something</h3>
            <p className="text-sm text-muted-foreground">
              Six certification levels, each tied to a specific, checkable
              requirement — not a single &ldquo;certificate of completion&rdquo; with
              nothing behind it.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </span>
            <h3 className="font-heading text-sm font-semibold text-foreground">Proof an employer can check</h3>
            <p className="text-sm text-muted-foreground">
              Every certificate carries a public verification ID. As our
              first graduates move into jobs and businesses, their success
              is independently checkable, not just claimed on a page like
              this one.
            </p>
          </div>
        </div>
      </Section>

      <Section className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Be one of the first success stories
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          As our first cohorts complete their certifications, real outcomes —
          with real names, with permission — will replace this page.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/courses" size="lg">
            Browse courses
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
