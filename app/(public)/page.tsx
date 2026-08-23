import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/course-card";
import { SchoolChips } from "@/components/school-chips";

export default async function HomePage() {
  const featured = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { slug: true, title: true, school: true, priceKobo: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-4 py-10 sm:max-w-2xl">
      <section className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Learn. Build. Earn with AI.
        </h1>
        <p className="text-sm text-neutral-600">
          AI University Africa — courses across Foundations, Business, Content,
          Careers, Professionals, Builders, African AI, and Instructor Track.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/courses"
            className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-center text-sm font-medium text-white sm:w-auto"
          >
            Browse courses
          </Link>
          <Link
            href="/signup"
            className="w-full rounded-lg border border-neutral-300 px-6 py-3 text-center text-sm font-medium sm:w-auto"
          >
            Sign up
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Schools
        </h2>
        <SchoolChips />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Featured courses
        </h2>
        {featured.length === 0 ? (
          <p className="text-sm text-neutral-500">No courses published yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {featured.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-neutral-500">
        Every certificate is publicly verifiable —{" "}
        <Link href="/verify" className="underline">
          check one now
        </Link>
        .
      </p>
    </main>
  );
}
