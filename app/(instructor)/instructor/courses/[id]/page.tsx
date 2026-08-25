import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import { ALL_SCHOOLS, SCHOOL_LABELS } from "@/lib/school-labels";
import {
  updateCourseAction,
  addModuleAction,
  updateModuleAction,
  deleteModuleAction,
  moveModuleAction,
  createQuizAction,
  addQuestionAction,
  deleteQuestionAction,
  gradeSubmissionAction,
} from "./actions";

// Course editor + grading queue (Webflow §6.2). Instructor sees only their
// own courses and students - ownership is re-checked in every action, not
// just here.
export default async function InstructorCourseEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; graded?: string }>;
}) {
  await requireRole(["INSTRUCTOR"]);
  const session = await auth();
  const { id } = await params;
  const { saved, graded } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { quiz: { include: { questions: { include: { options: true } } } } },
      },
      enrollments: { include: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!course || course.instructorId !== session!.user.id) notFound();

  const gradingQueue = await prisma.submission.findMany({
    where: { status: "SUBMITTED", quiz: { module: { courseId: course.id } } },
    include: {
      user: { select: { name: true } },
      quiz: { include: { module: true } },
      answers: { include: { question: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-4 py-10 sm:max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
        <p className="text-sm text-muted-foreground">
          {course.status} · {formatNaira(course.priceKobo)}
        </p>
      </div>
      {saved === "1" && <p className="text-sm text-success">Saved.</p>}
      {graded === "1" && <p className="text-sm text-success">Submission graded.</p>}

      {/* --- Course meta --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Course details
        </h2>
        <form action={updateCourseAction} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <input type="hidden" name="courseId" value={course.id} />
          <Field label="Title" name="title" defaultValue={course.title} />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            School
            <select name="school" defaultValue={course.school} className="rounded-lg border border-border px-4 py-3 text-base">
              {ALL_SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {SCHOOL_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Status
            <select name="status" defaultValue={course.status} className="rounded-lg border border-border px-4 py-3 text-base">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <Field
            label="Price (NGN)"
            name="priceNaira"
            type="number"
            defaultValue={String(course.priceKobo / 100)}
          />
          <TextAreaField label="Description" name="description" defaultValue={course.description} />
          <TextAreaField label="Outcomes" name="outcomes" defaultValue={course.outcomes} />
          <button type="submit" className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground sm:w-auto">
            Save course
          </button>
        </form>
      </section>

      {/* --- Modules --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Modules</h2>
        {course.modules.map((m, i) => (
          <div key={m.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{m.order}. {m.title}</span>
              <div className="flex gap-2 text-xs">
                <form action={moveModuleAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} className="underline disabled:opacity-30">Up</button>
                </form>
                <form action={moveModuleAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === course.modules.length - 1} className="underline disabled:opacity-30">Down</button>
                </form>
                <form action={deleteModuleAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <button type="submit" className="text-destructive underline">Delete</button>
                </form>
              </div>
            </div>

            <form action={updateModuleAction} className="flex flex-col gap-2">
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="moduleId" value={m.id} />
              <Field label="Title" name="title" defaultValue={m.title} />
              <Field label="Video URL" name="videoUrl" defaultValue={m.videoUrl ?? ""} />
              <Field label="PDF URL" name="pdfUrl" defaultValue={m.pdfUrl ?? ""} />
              <button type="submit" className="w-fit rounded-lg border border-border px-4 py-2 text-xs font-medium">
                Save module
              </button>
            </form>

            {m.quiz ? (
              <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Quiz: {m.quiz.title} (pass {m.quiz.passMark}%)
                </span>
                {m.quiz.questions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between text-sm">
                    <span>
                      {q.order}. [{q.type}] {q.prompt}
                    </span>
                    <form action={deleteQuestionAction}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="questionId" value={q.id} />
                      <button type="submit" className="text-xs text-destructive underline">Delete</button>
                    </form>
                  </div>
                ))}
                <AddQuestionForm courseId={course.id} quizId={m.quiz.id} />
              </div>
            ) : (
              <form action={createQuizAction} className="flex flex-wrap items-end gap-2 rounded-lg bg-muted p-3">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="moduleId" value={m.id} />
                <Field label="Quiz title" name="title" defaultValue="Module Check" />
                <Field label="Pass mark %" name="passMark" type="number" defaultValue="70" />
                <button type="submit" className="rounded-lg border border-border px-4 py-2.5 text-xs font-medium">
                  Add quiz
                </button>
              </form>
            )}
          </div>
        ))}

        <form action={addModuleAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4">
          <input type="hidden" name="courseId" value={course.id} />
          <Field label="New module title" name="title" />
          <Field label="Video URL" name="videoUrl" />
          <Field label="PDF URL" name="pdfUrl" />
          <button type="submit" className="w-fit rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
            Add module
          </button>
        </form>
      </section>

      {/* --- Own-students progress --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Students</h2>
        {course.enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {course.enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>{e.user.name} ({e.user.email})</span>
                <span className="text-muted-foreground">{e.percent}% · {e.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Grading queue --- */}
      <section id="grading" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Grading queue ({gradingQueue.length})
        </h2>
        {gradingQueue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing to grade.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {gradingQueue.map((s) => (
              <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-border p-4">
                <span className="text-sm font-medium">
                  {s.user.name} — {s.quiz.title} ({s.quiz.module.title})
                </span>
                {s.answers.map((a) => (
                  <div key={a.id} className="text-sm text-foreground/80">
                    <span className="font-medium">{a.question.prompt}</span>
                    <p>{a.textAnswer}</p>
                  </div>
                ))}
                <form action={gradeSubmissionAction} className="flex items-end gap-2">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="submissionId" value={s.id} />
                  <Field label="Score %" name="finalScore" type="number" defaultValue="0" />
                  <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground">
                    Grade
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function AddQuestionForm({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <form action={addQuestionAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="quizId" value={quizId} />
      <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
        Question type
        <select name="type" className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="MCQ">Multiple choice</option>
          <option value="SHORT_ANSWER">Short answer</option>
        </select>
      </label>
      <Field label="Prompt" name="prompt" />
      <p className="text-xs text-muted-foreground">
        For MCQ: fill options and pick the correct one (0-indexed). Blank
        options are ignored. Short-answer ignores these fields.
      </p>
      <Field label="Option 1" name="option1" />
      <Field label="Option 2" name="option2" />
      <Field label="Option 3" name="option3" />
      <Field label="Option 4" name="option4" />
      <Field label="Correct option index (0-3)" name="correctOption" type="number" defaultValue="0" />
      <Field label="Model answer (short-answer only)" name="modelAnswer" />
      <button type="submit" className="w-fit rounded-lg border border-border px-4 py-2 text-xs font-medium">
        Add question
      </button>
    </form>
  );
}
