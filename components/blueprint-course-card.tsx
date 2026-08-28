import { Award } from "lucide-react";

// Renders one course from the AIUA Blueprint's structured format
// (duration/format/audience, objectives, modules, outcomes,
// certification) — shared across every /programs/* page.
export function BlueprintCourseCard({
  title,
  duration,
  format,
  audience,
  objectives,
  modules,
  outcomes,
  certification,
}: {
  title: string;
  duration: string;
  format: string;
  audience: string;
  objectives: string[];
  modules: string[];
  outcomes: string[];
  certification: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h3 className="font-heading text-xl font-bold text-foreground">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">Duration:</strong> {duration}
        </span>
        <span>
          <strong className="text-foreground">Format:</strong> {format}
        </span>
        <span>
          <strong className="text-foreground">Audience:</strong> {audience}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Learning objectives
          </h4>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/80">
            {objectives.map((o) => (
              <li key={o} className="flex gap-2">
                <span className="text-primary">•</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Module outline
          </h4>
          <ol className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/80">
            {modules.map((m, i) => (
              <li key={m}>
                {i + 1}. {m}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Outcomes
        </h4>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/80">
          {outcomes.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="text-success">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
        <Award size={14} />
        Certification: {certification}
      </div>
    </div>
  );
}
