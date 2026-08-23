import type { School } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { SchoolChips } from "@/components/school-chips";
import { ALL_SCHOOLS } from "@/lib/school-labels";

// Public course catalog. Only PUBLISHED courses; filterable by school.
// See docs/WEBFLOW.md §3.2.
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ school?: string }>;
}) {
  const { school: schoolParam } = await searchParams;
  const school =
    schoolParam && ALL_SCHOOLS.includes(schoolParam as School)
      ? (schoolParam as School)
      : undefined;

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED", ...(school ? { school } : {}) },
    orderBy: { createdAt: "desc" },
    select: { slug: true, title: true, school: true, priceKobo: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10 sm:max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Course catalog</h1>
      <SchoolChips active={school} />

      {courses.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No published courses{school ? " in this school" : ""} yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
