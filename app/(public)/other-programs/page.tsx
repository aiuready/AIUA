import { ArrowRight, Clock } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { OTHER_PROGRAMS } from "@/lib/content/other-programs";

export const metadata = { title: "Other Programs" };

export default function OtherProgramsPage() {
  const programs = Object.values(OTHER_PROGRAMS);

  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Beyond the classroom
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Other Programs
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            AIUA is a curriculum first, but a career and business ecosystem in
            full. These are the programs around the courses — some live today,
            some launching as our first cohorts graduate.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Programs" title="Six ways to go further" center={false} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <a
              key={program.slug}
              href={`/other-programs/${program.slug}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {program.eyebrow}
              </span>
              <h3 className="font-heading text-base font-semibold text-foreground">{program.title}</h3>
              <p className="text-sm text-muted-foreground">{program.tagline}</p>
              <span className="mt-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock size={12} />
                {program.status}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                Learn more <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </Section>
    </main>
  );
}
