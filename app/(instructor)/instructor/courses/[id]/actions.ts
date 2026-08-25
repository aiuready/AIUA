"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recomputeEnrollmentProgress } from "@/lib/progress";
import { uploadFile } from "@/lib/storage";
import { MAX_DOCUMENT_BYTES, PDF_TYPES, SLIDES_TYPES, extFor } from "@/lib/upload-validation";

// Every action here re-checks Course.instructorId === session.user.id
// (Webflow §6.2, TRD §2) - ownership is never assumed from the URL alone.
async function requireOwnedCourse(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") redirect("/login");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== session.user.id) redirect("/instructor");

  return { session, course };
}

// Uploads a module document (PDF for "pdf", PDF/PPT/PPTX for "slides") if
// one was actually chosen. Returns undefined (leave field untouched) when
// no file was picked, or the new URL on success. Throws a tagged error the
// caller turns into a redirect query param on bad type/size, rather than
// silently dropping a bad upload.
class UploadError extends Error {}

async function handleDocumentUpload(
  formData: FormData,
  fieldName: string,
  allowed: Record<string, string>,
  keyPrefix: string
): Promise<string | undefined> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = extFor(file, allowed);
  if (!ext) throw new UploadError("type");
  if (file.size > MAX_DOCUMENT_BYTES) throw new UploadError("size");

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadFile(`${keyPrefix}/${Date.now()}.${ext}`, buffer, file.type);
}

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  outcomes: z.string().min(1),
  school: z.enum([
    "FOUNDATIONS",
    "BUSINESS",
    "CONTENT",
    "CAREERS",
    "PROFESSIONALS",
    "BUILDERS",
    "AFRICAN_AI",
    "INSTRUCTOR_TRACK",
  ]),
  priceNaira: z.coerce.number().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function updateCourseAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);

  const parsed = courseSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    outcomes: formData.get("outcomes"),
    school: formData.get("school"),
    priceNaira: formData.get("priceNaira"),
    status: formData.get("status"),
  });

  await prisma.course.update({
    where: { id: course.id },
    data: {
      title: parsed.title,
      description: parsed.description,
      outcomes: parsed.outcomes,
      school: parsed.school,
      priceKobo: Math.round(parsed.priceNaira * 100),
      status: parsed.status,
    },
  });

  redirect(`/instructor/courses/${course.id}?saved=1`);
}

export async function addModuleAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/instructor/courses/${course.id}`);

  // videoUrl is a pasted embed link (YouTube/Vimeo/any platform); pdf and
  // slides are real uploads via lib/storage.ts.
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;

  let pdfUrl: string | undefined;
  let slidesUrl: string | undefined;
  try {
    pdfUrl = await handleDocumentUpload(formData, "pdf", PDF_TYPES, `modules/${course.id}/pdf`);
    slidesUrl = await handleDocumentUpload(formData, "slides", SLIDES_TYPES, `modules/${course.id}/slides`);
  } catch (err) {
    const kind = err instanceof UploadError ? err.message : "unknown";
    redirect(`/instructor/courses/${course.id}?error=upload-${kind}`);
  }

  const maxOrder = await prisma.module.aggregate({
    where: { courseId: course.id },
    _max: { order: true },
  });

  await prisma.module.create({
    data: {
      courseId: course.id,
      title,
      videoUrl,
      pdfUrl,
      slidesUrl,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  redirect(`/instructor/courses/${course.id}`);
}

export async function updateModuleAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const moduleId = String(formData.get("moduleId"));

  const moduleRow = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!moduleRow || moduleRow.courseId !== course.id) redirect(`/instructor/courses/${course.id}`);

  let pdfUrl: string | undefined;
  let slidesUrl: string | undefined;
  try {
    pdfUrl = await handleDocumentUpload(formData, "pdf", PDF_TYPES, `modules/${course.id}/pdf`);
    slidesUrl = await handleDocumentUpload(formData, "slides", SLIDES_TYPES, `modules/${course.id}/slides`);
  } catch (err) {
    const kind = err instanceof UploadError ? err.message : "unknown";
    redirect(`/instructor/courses/${course.id}?error=upload-${kind}`);
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      title: String(formData.get("title") ?? moduleRow.title),
      videoUrl: String(formData.get("videoUrl") ?? "").trim() || null,
      // A file was chosen -> replace. Nothing chosen -> keep what's there
      // (re-uploading on every save, even when the instructor is only
      // editing the title, would be wrong).
      ...(pdfUrl !== undefined ? { pdfUrl } : {}),
      ...(slidesUrl !== undefined ? { slidesUrl } : {}),
    },
  });

  redirect(`/instructor/courses/${course.id}`);
}

export async function deleteModuleAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const moduleId = String(formData.get("moduleId"));

  const moduleRow = await prisma.module.findUnique({ where: { id: moduleId } });
  if (moduleRow && moduleRow.courseId === course.id) {
    // onDelete: Cascade on Quiz/ModuleProgress (schema.prisma) handles the rest.
    await prisma.module.delete({ where: { id: moduleId } });
  }

  redirect(`/instructor/courses/${course.id}`);
}

export async function moveModuleAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const moduleId = String(formData.get("moduleId"));
  const direction = String(formData.get("direction"));

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
  });
  const idx = modules.findIndex((m) => m.id === moduleId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;

  if (idx >= 0 && swapIdx >= 0 && swapIdx < modules.length) {
    const a = modules[idx];
    const b = modules[swapIdx];
    // Swap through a temporary order value to dodge the @@unique([courseId, order]) constraint.
    await prisma.$transaction([
      prisma.module.update({ where: { id: a.id }, data: { order: -1 } }),
      prisma.module.update({ where: { id: b.id }, data: { order: a.order } }),
      prisma.module.update({ where: { id: a.id }, data: { order: b.order } }),
    ]);
  }

  redirect(`/instructor/courses/${course.id}`);
}

export async function createQuizAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const moduleId = String(formData.get("moduleId"));

  const moduleRow = await prisma.module.findUnique({ where: { id: moduleId }, include: { quiz: true } });
  if (!moduleRow || moduleRow.courseId !== course.id || moduleRow.quiz) {
    redirect(`/instructor/courses/${course.id}`);
  }

  const title = String(formData.get("title") ?? "Quiz").trim() || "Quiz";
  const passMark = Math.min(100, Math.max(0, Number(formData.get("passMark") ?? 70)));

  await prisma.quiz.create({ data: { moduleId, title, passMark } });

  redirect(`/instructor/courses/${course.id}`);
}

export async function addQuestionAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const quizId = String(formData.get("quizId"));

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: true, questions: true },
  });
  if (!quiz || quiz.module.courseId !== course.id) redirect(`/instructor/courses/${course.id}`);

  const type = String(formData.get("type"));
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) redirect(`/instructor/courses/${course.id}`);

  const order = quiz.questions.length + 1;

  if (type === "MCQ") {
    const optionTexts = [1, 2, 3, 4]
      .map((i) => String(formData.get(`option${i}`) ?? "").trim())
      .filter(Boolean);
    const correctIndex = Number(formData.get("correctOption"));
    if (optionTexts.length < 2) redirect(`/instructor/courses/${course.id}`);

    await prisma.question.create({
      data: {
        quizId,
        type: "MCQ",
        prompt,
        order,
        options: {
          create: optionTexts.map((text, i) => ({ text, isCorrect: i === correctIndex })),
        },
      },
    });
  } else {
    const modelAnswer = String(formData.get("modelAnswer") ?? "").trim() || null;
    await prisma.question.create({
      data: { quizId, type: "SHORT_ANSWER", prompt, order, modelAnswer },
    });
  }

  redirect(`/instructor/courses/${course.id}`);
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const questionId = String(formData.get("questionId"));

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: true } } },
  });
  if (question && question.quiz.module.courseId === course.id) {
    await prisma.question.delete({ where: { id: questionId } });
  }

  redirect(`/instructor/courses/${course.id}`);
}

// Grading queue action (PRD §3.5: short-answer/file assignments route to
// the instructor). Sets finalScore/passed; a pass completes the module the
// same way an auto-graded MCQ pass does (lib/progress.ts).
export async function gradeSubmissionAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { session, course } = await requireOwnedCourse(courseId);
  const submissionId = String(formData.get("submissionId"));
  const finalScore = Math.min(100, Math.max(0, Number(formData.get("finalScore") ?? 0)));

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { quiz: { include: { module: true } } },
  });
  if (!submission || submission.quiz.module.courseId !== course.id) {
    redirect(`/instructor/courses/${course.id}`);
  }

  const passed = finalScore >= submission.quiz.passMark;

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      finalScore,
      passed,
      status: "GRADED",
      gradedById: session.user.id,
      gradedAt: new Date(),
    },
  });

  if (passed) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: submission.userId, courseId: course.id } },
    });
    if (enrollment) {
      await prisma.moduleProgress.upsert({
        where: {
          enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: submission.quiz.module.id },
        },
        create: {
          enrollmentId: enrollment.id,
          moduleId: submission.quiz.module.id,
          completed: true,
          completedAt: new Date(),
        },
        update: { completed: true, completedAt: new Date() },
      });
      await recomputeEnrollmentProgress(enrollment.id);
    }
  }

  redirect(`/instructor/courses/${course.id}?graded=1`);
}

// Push info to students (live class links, updates, "and so on"). Instructor
// posts start PENDING and are invisible to students until an admin
// approves them - admin must approve everything an instructor pushes.
export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { session, course } = await requireOwnedCourse(courseId);

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!title || !message) redirect(`/instructor/courses/${course.id}?error=announcement#announcements`);

  const link = String(formData.get("link") ?? "").trim() || null;

  await prisma.announcement.create({
    data: {
      courseId: course.id,
      authorId: session.user.id,
      title,
      message,
      link,
      status: "PENDING",
    },
  });

  redirect(`/instructor/courses/${course.id}?announced=1#announcements`);
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const courseId = String(formData.get("courseId"));
  const { course } = await requireOwnedCourse(courseId);
  const announcementId = String(formData.get("announcementId"));

  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (announcement && announcement.courseId === course.id) {
    await prisma.announcement.delete({ where: { id: announcementId } });
  }

  redirect(`/instructor/courses/${course.id}#announcements`);
}
