import Link from "next/link";
import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { ProgressBar } from "@/components/progress-bar";

// Student home: continue-learning card + enrolled courses list, quick
// links to certificates/purchases (Webflow §5.1).
export default async function StudentDashboardPage() {
  await requireRole(["STUDENT"]);
  const session = await auth();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session!.user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: { course: { select: { title: true, slug: true } } },
    orderBy: { enrolledAt: "desc" },
  });

  const continueLearning = enrollments.find((e) => e.status === "ACTIVE") ?? enrollments[0];

  // Platform-wide announcements + ones for courses this student is
  // enrolled in - only ever APPROVED ones (instructor posts are invisible
  // to students until an admin approves them).
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const announcements = await prisma.announcement.findMany({
    where: {
      status: "APPROVED",
      OR: [{ courseId: null }, { courseId: { in: enrolledCourseIds } }],
    },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10 sm:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {continueLearning ? (
        <Link
          href={`/learn/${continueLearning.course.slug}`}
          className="flex flex-col gap-2 rounded-xl border border-primary p-4"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Continue learning
          </span>
          <span className="text-base font-semibold">{continueLearning.course.title}</span>
          <ProgressBar percent={continueLearning.percent} />
          <span className="text-xs text-muted-foreground">{continueLearning.percent}% complete</span>
        </Link>
      ) : (
        <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          You&rsquo;re not enrolled in a course yet.{" "}
          <Link href="/courses" className="font-medium underline">
            Browse courses
          </Link>
          .
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Enrolled courses
        </h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enrolled courses yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {enrollments.map((e) => (
              <Link
                key={e.id}
                href={`/learn/${e.course.slug}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm font-medium">{e.course.title}</span>
                <span className="text-xs text-muted-foreground">{e.percent}%</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {announcements.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Announcements
          </h2>
          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.course?.title ?? "Platform-wide"}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{a.message}</p>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    {a.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-4 text-sm font-medium">
        <Link href="/certificates" className="underline">
          Certificates
        </Link>
        <Link href="/purchases" className="underline">
          Purchases
        </Link>
      </div>
    </main>
  );
}
