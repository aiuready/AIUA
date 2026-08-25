import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { toEmbedUrl } from "@/lib/video-embed";
import { ProgressBar } from "@/components/progress-bar";
import { markModuleCompleteAction, submitQuizAction } from "./actions";

// Learning experience (Webflow §5.2). Module list + active module (video ->
// PDF -> quiz), progress bar, mark-complete/quiz gating, live-class link.
export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ module?: string; done?: string; quiz?: string }>;
}) {
  await requireRole(["STUDENT"]);
  const session = await auth();
  const { course: courseSlug } = await params;
  const { module: moduleParam, done, quiz: quizResult } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { quiz: { include: { questions: { include: { options: true } } } } },
      },
      cohorts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId: course.id } },
  });
  if (!enrollment || enrollment.status === "REVOKED") {
    redirect(`/courses/${courseSlug}`);
  }

  const progressRows = await prisma.moduleProgress.findMany({
    where: { enrollmentId: enrollment.id },
  });
  const completedModuleIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.moduleId)
  );

  const quizIds = course.modules.map((m) => m.quiz?.id).filter((id): id is string => !!id);
  const latestSubmissions = quizIds.length
    ? await prisma.submission.findMany({
        where: { quizId: { in: quizIds }, userId: session!.user.id },
        orderBy: { submittedAt: "desc" },
      })
    : [];
  const latestSubmissionByQuiz = new Map<string, (typeof latestSubmissions)[number]>();
  for (const s of latestSubmissions) {
    if (!latestSubmissionByQuiz.has(s.quizId)) latestSubmissionByQuiz.set(s.quizId, s);
  }

  const activeModule =
    course.modules.find((m) => m.id === moduleParam) ??
    course.modules.find((m) => !completedModuleIds.has(m.id)) ??
    course.modules[0];

  const cohort = course.cohorts[0];

  const announcements = await prisma.announcement.findMany({
    where: { courseId: course.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6 sm:max-w-3xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{course.title}</span>
          <span className="text-muted-foreground">{enrollment.percent}%</span>
        </div>
        <ProgressBar percent={enrollment.percent} />
      </div>

      {cohort && (
        <a
          href={cohort.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
        >
          Live class: {cohort.name} — join link ↗
        </a>
      )}

      {announcements.length > 0 && (
        <div className="flex flex-col gap-2">
          {announcements.map((a) => (
            <div key={a.id} className="flex flex-col gap-1 rounded-lg bg-accent/5 px-3 py-2">
              <span className="text-sm font-medium text-foreground">{a.title}</span>
              <p className="text-sm text-foreground/80">{a.message}</p>
              {a.link && (
                <a href={a.link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                  {a.link}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Module list - collapses to a simple list here; a true drawer
            overlay is a mobile-viewport interaction left for a UI pass. */}
        <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-56 sm:flex-col sm:overflow-visible">
          {course.modules.map((m) => (
            <Link
              key={m.id}
              href={`/learn/${courseSlug}?module=${m.id}`}
              className={`shrink-0 rounded-lg border px-3 py-2 text-sm ${
                m.id === activeModule?.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground/80"
              }`}
            >
              {completedModuleIds.has(m.id) ? "✓ " : ""}
              {m.order}. {m.title}
            </Link>
          ))}
        </nav>

        {!activeModule ? (
          <p className="text-sm text-muted-foreground">No modules yet.</p>
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-lg font-semibold">{activeModule.title}</h2>

            {activeModule.videoUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={toEmbedUrl(activeModule.videoUrl)}
                  className="h-full w-full"
                  allowFullScreen
                  title={activeModule.title}
                />
              </div>
            )}

            {(activeModule.pdfUrl || activeModule.slidesUrl) && (
              <div className="flex gap-4">
                {activeModule.pdfUrl && (
                  <a
                    href={activeModule.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-foreground underline"
                  >
                    Download module PDF
                  </a>
                )}
                {activeModule.slidesUrl && (
                  <a
                    href={activeModule.slidesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-foreground underline"
                  >
                    Download slides
                  </a>
                )}
              </div>
            )}

            {done === "1" && (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                Module marked complete.
              </p>
            )}

            {activeModule.quiz ? (
              <QuizBlock
                courseSlug={courseSlug}
                moduleId={activeModule.id}
                quiz={activeModule.quiz}
                latestSubmission={latestSubmissionByQuiz.get(activeModule.quiz.id)}
                justSubmitted={quizResult === "submitted"}
              />
            ) : completedModuleIds.has(activeModule.id) ? (
              <p className="text-sm font-medium text-success">Completed</p>
            ) : (
              <form action={markModuleCompleteAction}>
                <input type="hidden" name="courseSlug" value={courseSlug} />
                <input type="hidden" name="moduleId" value={activeModule.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground sm:w-auto"
                >
                  Mark complete
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function QuizBlock({
  courseSlug,
  moduleId,
  quiz,
  latestSubmission,
  justSubmitted,
}: {
  courseSlug: string;
  moduleId: string;
  quiz: {
    id: string;
    title: string;
    passMark: number;
    questions: {
      id: string;
      type: "MCQ" | "SHORT_ANSWER";
      prompt: string;
      options: { id: string; text: string }[];
    }[];
  };
  latestSubmission?: { passed: boolean | null; status: string; finalScore: number | null };
  justSubmitted: boolean;
}) {
  if (latestSubmission?.passed) {
    return (
      <p className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
        Quiz passed{latestSubmission.finalScore != null ? ` (${latestSubmission.finalScore}%)` : ""}.
      </p>
    );
  }

  if (latestSubmission && latestSubmission.status === "SUBMITTED" && latestSubmission.passed === null) {
    return (
      <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
        Submitted — waiting on instructor grading.
      </p>
    );
  }

  return (
    <form action={submitQuizAction} className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="quizId" value={quiz.id} />

      <h3 className="text-sm font-semibold">{quiz.title}</h3>

      {justSubmitted && latestSubmission?.passed === false && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Not quite — pass mark is {quiz.passMark}%. Try again.
        </p>
      )}

      {quiz.questions.map((q, i) => (
        <fieldset key={q.id} className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">
            {i + 1}. {q.prompt}
          </legend>
          {q.type === "MCQ" ? (
            q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm text-foreground/80">
                <input type="radio" name={`q_${q.id}`} value={opt.id} required />
                {opt.text}
              </label>
            ))
          ) : (
            <textarea
              name={`q_${q.id}`}
              required
              rows={3}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          )}
        </fieldset>
      ))}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground sm:w-auto"
      >
        Submit quiz
      </button>
    </form>
  );
}
