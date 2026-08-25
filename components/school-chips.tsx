import Link from "next/link";
import type { School } from "@prisma/client";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";

// Horizontal scrollable chip row, tag filter only (Webflow §3.2).
export function SchoolChips({ active }: { active?: School }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link
        href="/courses"
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          !active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-foreground/70 hover:border-primary/50"
        }`}
      >
        All
      </Link>
      {ALL_SCHOOLS.map((school) => (
        <Link
          key={school}
          href={`/courses?school=${school}`}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            active === school
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground/70 hover:border-primary/50"
          }`}
        >
          {SCHOOL_LABELS[school]}
        </Link>
      ))}
    </div>
  );
}
