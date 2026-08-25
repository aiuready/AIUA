import Link from "next/link";
import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import { SCHOOL_LABELS, ALL_SCHOOLS } from "@/lib/school-labels";
import { CreateCourseForm } from "@/components/create-course-form";

// Own courses (draft/published), create-course action, students-count and
// grading-queue summary (Webflow §6.1).
export default async function InstructorDashboardPage() {
  await requireRole(["INSTRUCTOR"]);
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: { instructorId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  const gradingQueueCount = await prisma.submission.count({
    where: { status: "SUBMITTED", quiz: { module: { course: { instructorId: session!.user.id } } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10 sm:max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Instructor dashboard</h1>

      <div className="flex gap-4">
        <div className="flex-1 rounded-lg border border-border p-4">
          <span className="text-2xl font-semibold">{courses.length}</span>
          <p className="text-xs text-muted-foreground">Courses</p>
        </div>
        <Link
          href="#grading"
          className="flex-1 rounded-lg border border-border p-4 hover:border-primary"
        >
          <span className="text-2xl font-semibold">{gradingQueueCount}</span>
          <p className="text-xs text-muted-foreground">Awaiting grading</p>
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses yet — create your first one below.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/instructor/courses/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{c.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {SCHOOL_LABELS[c.school]} · {c.status} · {formatNaira(c.priceKobo)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{c._count.enrollments} students</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Create a course
        </h2>
        <CreateCourseForm schools={ALL_SCHOOLS} labels={SCHOOL_LABELS} />
      </section>
    </main>
  );
}
