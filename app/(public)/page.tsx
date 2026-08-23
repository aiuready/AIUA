import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10 sm:max-w-2xl">
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
      {/* Schools strip, featured courses, and trust/verification mention per
          docs/WEBFLOW.md §3.1 land here once /courses data is wired up. */}
    </main>
  );
}
