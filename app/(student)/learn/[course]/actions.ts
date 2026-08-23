"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recomputeEnrollmentProgress } from "@/lib/progress";

async function getActiveEnrollment(courseSlug: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) redirect("/courses");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (!enrollment || enrollment.status === "REVOKED") redirect(`/courses/${courseSlug}`);

  return { session, course, enrollment };
}

// Mark-complete for modules with no quiz (PRD §3.4). Quiz modules complete
// via submitQuizAction on a pass (PRD §3.5: "completion depends on passing
// its assessments") - this action refuses to complete a quiz module.
export async function markModuleCompleteAction(formData: FormData): Promise<void> {
  const courseSlug = String(formData.get("courseSlug"));
  const moduleId = String(formData.get("moduleId"));
  const { course, enrollment } = await getActiveEnrollment(courseSlug);

  const moduleRow = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { quiz: true },
  });
  if (!moduleRow || moduleRow.courseId !== course.id) redirect(`/learn/${courseSlug}`);
  if (moduleRow.quiz) redirect(`/learn/${courseSlug}?module=${moduleId}`);

  await prisma.moduleProgress.upsert({
    where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId } },
    create: { enrollmentId: enrollment.id, moduleId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });
  await recomputeEnrollmentProgress(enrollment.id);

  redirect(`/learn/${courseSlug}?module=${moduleId}&done=1`);
}

// MCQ-only quizzes auto-grade immediately (PRD §3.5) and, on a pass, mark
// the module complete. Quizzes containing any short-answer question stay
// SUBMITTED for instructor grading (Phase 7) - the module then completes
// once that grading marks the submission passed.
export async function submitQuizAction(formData: FormData): Promise<void> {
  const courseSlug = String(formData.get("courseSlug"));
  const moduleId = String(formData.get("moduleId"));
  const quizId = String(formData.get("quizId"));
  const { session, course, enrollment } = await getActiveEnrollment(courseSlug);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) redirect(`/learn/${courseSlug}`);
  const moduleRow = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!moduleRow || moduleRow.courseId !== course.id) redirect(`/learn/${courseSlug}`);

  const submission = await prisma.submission.create({
    data: { quizId, userId: session.user.id, status: "SUBMITTED" },
  });

  const hasShortAnswer = quiz.questions.some((q) => q.type === "SHORT_ANSWER");
  const mcqCount = quiz.questions.filter((q) => q.type === "MCQ").length;
  let correct = 0;

  for (const question of quiz.questions) {
    if (question.type === "MCQ") {
      const selectedOptionId = String(formData.get(`q_${question.id}`) ?? "");
      const selected = question.options.find((o) => o.id === selectedOptionId);
      if (selected?.isCorrect) correct += 1;
      await prisma.answer.create({
        data: {
          submissionId: submission.id,
          questionId: question.id,
          selectedOptionId: selectedOptionId || null,
        },
      });
    } else {
      const textAnswer = String(formData.get(`q_${question.id}`) ?? "");
      await prisma.answer.create({
        data: { submissionId: submission.id, questionId: question.id, textAnswer },
      });
    }
  }

  if (!hasShortAnswer && mcqCount > 0) {
    const autoScore = Math.round((correct / mcqCount) * 100);
    const passed = autoScore >= quiz.passMark;
    await prisma.submission.update({
      where: { id: submission.id },
      data: { autoScore, finalScore: autoScore, passed, status: "GRADED", gradedAt: new Date() },
    });
    if (passed) {
      await prisma.moduleProgress.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId } },
        create: { enrollmentId: enrollment.id, moduleId, completed: true, completedAt: new Date() },
        update: { completed: true, completedAt: new Date() },
      });
      await recomputeEnrollmentProgress(enrollment.id);
    }
  }

  redirect(`/learn/${courseSlug}?module=${moduleId}&quiz=submitted`);
}
