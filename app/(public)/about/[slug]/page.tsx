import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ABOUT_PAGES, ABOUT_SLUGS } from "@/lib/content/about";

export function generateStaticParams() {
  return ABOUT_SLUGS.map((slug) => ({ slug }));
}

export default async function AboutSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = ABOUT_PAGES[slug];
  if (!page) notFound();

  return (
    <main>
      <Section className="pt-14 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {page.eyebrow}
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {page.title}
          </h1>
          {page.intro && (
            <p className="text-base text-muted-foreground sm:text-lg">{page.intro}</p>
          )}
        </div>
      </Section>

      {page.quote && (
        <Section muted>
          <blockquote className="mx-auto max-w-2xl border-l-4 border-primary pl-6 text-center italic text-foreground">
            <p className="font-heading text-xl sm:text-2xl">&ldquo;{page.quote}&rdquo;</p>
          </blockquote>
        </Section>
      )}

      {page.body && (
        <Section>
          <div className="mx-auto flex max-w-2xl flex-col gap-5 text-base text-foreground/80">
            {page.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </Section>
      )}

      {page.roleGroups && (
        <Section muted>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.roleGroups.map((group) => (
              <div key={group.groupTitle} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {group.groupTitle}
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.roles.map((role) => (
                    <li
                      key={role}
                      className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground"
                    >
                      {role} <span className="text-xs">— open</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {page.note && (
        <Section className="text-center">
          <a
            href="mailto:hello@aiuready.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail size={16} />
            {page.note}
          </a>
        </Section>
      )}
    </main>
  );
}
