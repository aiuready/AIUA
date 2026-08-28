import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { OTHER_PROGRAMS, OTHER_PROGRAM_SLUGS } from "@/lib/content/other-programs";

export function generateStaticParams() {
  return OTHER_PROGRAM_SLUGS.map((slug) => ({ slug }));
}

export default async function OtherProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = OTHER_PROGRAMS[slug];
  if (!program) notFound();

  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {program.eyebrow}
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {program.title}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">{program.tagline}</p>
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent-hover">
            <Clock size={14} />
            {program.status}
          </span>
        </div>
      </Section>

      <Section muted>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base text-foreground/80">{program.description}</p>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {program.features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Where to start
        </h2>
        <div className="mt-6 flex justify-center">
          <ButtonLink href={program.ctaHref} size="lg">
            {program.ctaLabel}
            <ArrowRight size={18} />
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
