import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import { SCHOOL_LABELS } from "@/lib/school-labels";

// Course detail. Mobile order: title -> price + sticky Enroll CTA ->
// description -> modules list -> outcomes -> instructor (Webflow §3.3).
// Unpublished courses are visible only to their instructor and admins.
export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { slug } = await params;
  const { checkout } = await searchParams;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { name: true, bio: true } },
      modules: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
    },
  });

  const isOwnerOrAdmin =
    session?.user &&
    (session.user.role === "ADMIN" ||
      (session.user.role === "INSTRUCTOR" && course?.instructorId === session.user.id));

  if (!course || (course.status !== "PUBLISHED" && !isOwnerOrAdmin)) {
    notFound();
  }

  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;
  const isEnrolled = enrollment && enrollment.status !== "REVOKED";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 sm:max-w-2xl">
      {course.status !== "PUBLISHED" && (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
          {course.status} — only visible to you as the owner/admin.
        </p>
      )}

      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {SCHOOL_LABELS[course.school]}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
      </div>

      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-y border-neutral-200 bg-white py-3">
        <span className="text-lg font-semibold">{formatNaira(course.priceKobo)}</span>

        {isEnrolled ? (
          <Link
            href={`/learn/${course.slug}`}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Go to course
          </Link>
        ) : !session?.user ? (
          <Link
            href={`/login?callbackUrl=/courses/${course.slug}`}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Log in to enroll
          </Link>
        ) : session.user.role === "STUDENT" ? (
          <form action="/api/checkout" method="POST" className="flex gap-2">
            <input type="hidden" name="courseId" value={course.id} />
            <button
              type="submit"
              name="provider"
              value="PAYSTACK"
              className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              Pay with Paystack
            </button>
            <button
              type="submit"
              name="provider"
              value="FLUTTERWAVE"
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium"
            >
              Pay with Flutterwave
            </button>
          </form>
        ) : (
          <span className="text-sm text-neutral-500">Instructors/admins can&rsquo;t enroll</span>
        )}
      </div>

      {checkout === "error" && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          Something went wrong starting checkout. Please try again.
        </p>
      )}

      <p className="text-sm text-neutral-700">{course.description}</p>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Modules
        </h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-neutral-500">No modules yet.</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {course.modules.map((m) => (
              <li key={m.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                {m.order}. {m.title}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Outcomes
        </h2>
        <p className="text-sm text-neutral-700">{course.outcomes}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Instructor
        </h2>
        <p className="text-sm font-medium text-neutral-900">{course.instructor.name}</p>
        {course.instructor.bio && (
          <p className="text-sm text-neutral-700">{course.instructor.bio}</p>
        )}
      </section>
    </main>
  );
}
