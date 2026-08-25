import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAs, SEEDED } from "./helpers";

const prisma = new PrismaClient();
const testCourseTitle = `E2E Test Course ${Date.now()}`;

test.describe.serial("Instructor: course editor", () => {
  test.afterAll(async () => {
    // Course has no enrollments/certificates, so this cascades cleanly
    // (the schema bug that used to block this was fixed earlier in the build).
    await prisma.course.deleteMany({ where: { title: testCourseTitle } });
    await prisma.$disconnect();
  });

  test("dashboard shows real own-courses list and a working create-course form", async ({ page }) => {
    await loginAs(page, SEEDED.instructor.email, SEEDED.instructor.password);
    await expect(page.getByRole("heading", { name: "Instructor dashboard" })).toBeVisible();
    await expect(page.getByText("AI Foundations for Everyone")).toBeVisible();

    await page.getByLabel("Title").fill(testCourseTitle);
    await page.getByLabel("School").selectOption("BUILDERS");
    await page.getByLabel("Price (NGN)").fill("5000");
    await page.getByLabel("Description").fill("An E2E test course.");
    await page.getByLabel("Outcomes").fill("Prove the editor works end to end.");
    await page.getByRole("button", { name: /create course/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/instructor\/courses\//);
    await expect(page.getByRole("heading", { name: testCourseTitle })).toBeVisible();
    // "DRAFT" also appears as an <option> in the status <select> - match
    // the specific status line, not the bare word, to avoid ambiguity.
    await expect(page.getByText("DRAFT ·")).toBeVisible();
  });

  test("add a module, add a quiz with an MCQ question, and see it reflected", async ({ page }) => {
    await loginAs(page, SEEDED.instructor.email, SEEDED.instructor.password);
    const course = await prisma.course.findFirstOrThrow({ where: { title: testCourseTitle } });
    await page.goto(`/instructor/courses/${course.id}`);

    // Add module
    const moduleForm = page.locator("form", { has: page.getByRole("button", { name: /add module/i }) });
    await moduleForm.getByLabel("New module title").fill("E2E Module 1");
    await moduleForm.getByRole("button", { name: /add module/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("1. E2E Module 1")).toBeVisible();

    // Add quiz to that module
    const quizForm = page.locator("form", { has: page.getByRole("button", { name: /add quiz/i }) });
    await quizForm.getByRole("button", { name: /add quiz/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Quiz: Module Check/)).toBeVisible();

    // Add an MCQ question to that quiz
    await page.getByLabel("Prompt").fill("Is this an E2E test?");
    await page.getByLabel("Option 1").fill("Yes");
    await page.getByLabel("Option 2").fill("No");
    await page.getByLabel("Correct option index (0-3)").fill("0");
    await page.getByRole("button", { name: /add question/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("[MCQ] Is this an E2E test?")).toBeVisible();
  });

  test("grading queue count on the dashboard reflects a real pending submission", async ({ page }) => {
    // Seed a SUBMITTED short-answer submission directly (mirrors what a
    // student action would create) to prove the instructor dashboard's
    // count is live, not hardcoded.
    const course = await prisma.course.findFirstOrThrow({
      where: { title: testCourseTitle },
      include: { modules: { include: { quiz: true } } },
    });
    const quiz = course.modules[0].quiz!;
    const question = await prisma.question.create({
      data: { quizId: quiz.id, type: "SHORT_ANSWER", prompt: "Explain.", order: 2 },
    });
    const student = await prisma.user.findUniqueOrThrow({ where: { email: SEEDED.student.email } });
    const submission = await prisma.submission.create({
      data: { quizId: quiz.id, userId: student.id, status: "SUBMITTED" },
    });
    await prisma.answer.create({
      data: { submissionId: submission.id, questionId: question.id, textAnswer: "An E2E test answer." },
    });

    await loginAs(page, SEEDED.instructor.email, SEEDED.instructor.password);
    await expect(page.getByText("Awaiting grading")).toBeVisible();

    await page.goto(`/instructor/courses/${course.id}#grading`);
    await expect(page.getByText("An E2E test answer.")).toBeVisible();

    // Grade it, confirm it drops off the queue
    await page.getByLabel("Score %").fill("90");
    await page.getByRole("button", { name: "Grade" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Submission graded.")).toBeVisible();

    const graded = await prisma.submission.findUniqueOrThrow({ where: { id: submission.id } });
    expect(graded.status).toBe("GRADED");
    expect(graded.passed).toBe(true);
  });
});
