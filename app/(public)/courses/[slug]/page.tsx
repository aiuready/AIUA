import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import { SCHOOL_LABELS } from "@/lib/school-labels";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { buttonVariants } from "@/components/ui/button";

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
    <main className="py-8 sm:py-12">
      <Container className="flex flex-col gap-6 !max-w-2xl">
        {course.status !== "PUBLISHED" && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent-hover">
            {course.status} — only visible to you as the owner/admin.
          </p>
        )}

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {SCHOOL_LABELS[course.school]}
          </span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>
        </div>

        <div className="sticky top-16 z-10 flex items-center justify-between gap-4 border-y border-border bg-background/95 py-3 backdrop-blur">
          <span className="font-heading text-lg font-bold text-foreground">
            {formatNaira(course.priceKobo)}
          </span>

          {isEnrolled ? (
            <ButtonLink href={`/learn/${course.slug}`} size="sm">
              Go to course
            </ButtonLink>
          ) : !session?.user ? (
            <ButtonLink href={`/login?callbackUrl=/courses/${course.slug}`} size="sm">
              Log in to enroll
            </ButtonLink>
          ) : session.user.role === "STUDENT" ? (
            <form action="/api/checkout" method="POST" className="flex gap-2">
              <input type="hidden" name="courseId" value={course.id} />
              <button type="submit" name="provider" value="PAYSTACK" className={buttonVariants({ size: "sm" })}>
                Paystack
              </button>
              <button
                type="submit"
                name="provider"
                value="FLUTTERWAVE"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Flutterwave
              </button>
            </form>
          ) : (
            <span className="text-sm text-muted-foreground">Instructors/admins can&rsquo;t enroll</span>
          )}
        </div>

        {checkout === "error" && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Something went wrong starting checkout. Please try again.
          </p>
        )}

        <p className="text-sm text-foreground/80">{course.description}</p>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Modules
          </h2>
          {course.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules yet.</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {course.modules.map((m) => (
                <li key={m.id} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  {m.order}. {m.title}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Outcomes
          </h2>
          <p className="text-sm text-foreground/80">{course.outcomes}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Instructor
          </h2>
          <p className="text-sm font-medium text-foreground">{course.instructor.name}</p>
          {course.instructor.bio && (
            <p className="text-sm text-foreground/80">{course.instructor.bio}</p>
          )}
        </section>
      </Container>
    </main>
  );
}
