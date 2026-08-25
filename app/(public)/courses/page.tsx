import type { School } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { SchoolChips } from "@/components/school-chips";
import { Container } from "@/components/ui/container";
import { ALL_SCHOOLS } from "@/lib/school-labels";

export const metadata = { title: "Courses" };

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
    <main className="py-10 sm:py-14">
      <Container className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Course catalog
        </h1>
        <SchoolChips active={school} />

        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published courses{school ? " in this school" : ""} yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
