import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button-link";
import { BlueprintCourseCard } from "@/components/blueprint-course-card";
import { PROGRAMS, PROGRAM_SLUGS } from "@/lib/content/programs";

export function generateStaticParams() {
  return PROGRAM_SLUGS.map((slug) => ({ slug }));
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = PROGRAMS[slug];
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
          <p className="text-base text-muted-foreground sm:text-lg">{program.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href={program.catalogSchool ? `/courses?school=${program.catalogSchool}` : "/courses"}
              size="lg"
            >
              Browse related courses
              <ArrowRight size={18} />
            </ButtonLink>
            <ButtonLink href="/signup" variant="outline" size="lg">
              Sign up free
            </ButtonLink>
          </div>
        </div>
      </Section>

      {program.courses && (
        <Section muted>
          <SectionHeading eyebrow="Curriculum" title="What you'll learn" center={false} />
          <div className="flex flex-col gap-6">
            {program.courses.map((course) => (
              <BlueprintCourseCard key={course.title} {...course} />
            ))}
          </div>
        </Section>
      )}

      {program.tracks && (
        <Section muted>
          <SectionHeading
            eyebrow="Tracks"
            title="Pick your profession"
            description="Each track is 2 weeks, shares a common structure, and ends in an AI Specialist certification for that sector."
            center={false}
          />
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-5 py-3 font-semibold text-foreground">Track</th>
                  <th className="px-5 py-3 font-semibold text-foreground">Core use cases</th>
                </tr>
              </thead>
              <tbody>
                {program.tracks.map((track) => (
                  <tr key={track.name} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-foreground">
                      {track.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{track.useCases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section className="text-center">
        <h2 className="mx-auto max-w-xl font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ready to start {program.title}?
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink
            href={program.catalogSchool ? `/courses?school=${program.catalogSchool}` : "/courses"}
            size="lg"
            fullWidthMobile
          >
            Browse related courses
          </ButtonLink>
          <ButtonLink href="/signup" variant="outline" size="lg" fullWidthMobile>
            Create your account
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
