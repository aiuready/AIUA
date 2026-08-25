import Link from "next/link";
import type { Course } from "@prisma/client";
import { formatNaira } from "@/lib/money";
import { SCHOOL_LABELS } from "@/lib/school-labels";

// Card: title, school, price, CTA (Webflow §3.2). One-per-row on mobile via
// the grid the caller wraps this in.
export function CourseCard({
  course,
}: {
  course: Pick<Course, "slug" | "title" | "school" | "priceKobo">;
}) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
        {SCHOOL_LABELS[course.school]}
      </span>
      <h3 className="font-heading text-base font-semibold text-foreground">{course.title}</h3>
      <span className="mt-auto text-sm font-medium text-foreground">
        {formatNaira(course.priceKobo)}
      </span>
    </Link>
  );
}
