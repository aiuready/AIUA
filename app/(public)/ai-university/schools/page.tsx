import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/section";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";
import { SCHOOL_BLURBS } from "@/lib/school-blurbs";
import { SCHOOL_ICONS } from "@/lib/school-icons";

export const metadata = { title: "Schools" };

// This is the real, complete index: all 8 schools that exist in the
// database and drive the live course catalog (lib/school-labels.ts),
// including African AI, Content Creation, and Careers - the three
// schools the COURSES/SCHOOLS nav dropdown deliberately doesn't list by
// name (that dropdown is a curated 7-item marketing view built from the
// AIUA Blueprint's newer program framing; the real catalog and its school
// taxonomy were never changed - user decision, 2026-08-28). This page is
// where every real school stays fully discoverable regardless of what's
// in the top nav, so the African AI school - the blueprint's own "flagship
// differentiator" - never goes missing from the site.
export default function SchoolsPage() {
  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            AI University
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The 8 Schools
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Every course at AIUA belongs to one of eight schools. Each is a
            complete pathway — entry point, curriculum, and a certification
            at the end that actually signals something.
          </p>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="All 8 schools" title="Pick where you start" center={false} />
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

      <Section className="text-center">
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          African AI is AIUA&rsquo;s flagship differentiator — no major global
          platform builds AI curriculum specifically for African languages,
          industries, and realities. Start there if you want to see what
          makes AIUA different.
        </p>
      </Section>
    </main>
  );
}
