import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAs, SEEDED } from "./helpers";

const prisma = new PrismaClient();

// The one flow never actually driven through a browser before: enroll ->
// complete a plain module -> fail a quiz -> pass a quiz -> reach 100% ->
// certificate appears -> public /verify confirms it. Real payment can't
// complete without gateway keys, so the ACTIVE enrollment is seeded
// directly (mirrors what a successful webhook would produce), then every
// remaining step is driven through real clicks in a real browser.
test.describe.serial("Full learning -> quiz -> certificate loop", () => {
  let courseId: string;
  let module2Id: string;

  test.beforeAll(async () => {
    const student = await prisma.user.findUniqueOrThrow({ where: { email: SEEDED.student.email } });
    const course = await prisma.course.findUniqueOrThrow({
      where: { slug: "ai-foundations" },
      include: { modules: { orderBy: { order: "asc" } } },
    });
    courseId = course.id;
    module2Id = course.modules[1].id;

    // Clean slate
    await prisma.certificate.deleteMany({ where: { userId: student.id, courseId } });
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    });
    if (existing) {
      await prisma.moduleProgress.deleteMany({ where: { enrollmentId: existing.id } });
      await prisma.enrollment.delete({ where: { id: existing.id } });
    }
    const quiz = await prisma.quiz.findUnique({ where: { moduleId: module2Id } });
    if (quiz) await prisma.submission.deleteMany({ where: { quizId: quiz.id, userId: student.id } });

    await prisma.enrollment.create({
      data: { userId: student.id, courseId, status: "ACTIVE", percent: 0 },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("module 1 (no quiz) can be marked complete via the UI", async ({ page }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
    await page.goto("/learn/ai-foundations");

    await expect(page.getByRole("heading", { name: "Module 1: Orientation" })).toBeVisible();
    await expect(page.locator("iframe")).toBeVisible(); // video embed actually renders

    await page.getByRole("button", { name: /mark complete/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Module marked complete.")).toBeVisible();
    await expect(page.getByText("50%")).toBeVisible();
  });

  test("submitting the wrong quiz answer correctly blocks module completion", async ({ page }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
    await page.goto(`/learn/ai-foundations?module=${module2Id}`);

    await expect(page.getByText("What does AI stand for?")).toBeVisible();
    await page.getByLabel("Automated Interface").check();
    await page.getByRole("button", { name: /submit quiz/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/not quite/i)).toBeVisible();
    await expect(page.getByText("50%")).toBeVisible(); // unchanged
  });

  test("submitting the correct quiz answer passes, completes the module, and reaches 100%", async ({
    page,
  }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
    await page.goto(`/learn/ai-foundations?module=${module2Id}`);

    await page.getByLabel("Artificial Intelligence").check();
    await page.getByRole("button", { name: /submit quiz/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/quiz passed/i)).toBeVisible();
    // "100%" also appears inside the "Quiz passed (100%)" message - scope
    // to the progress indicator specifically (a plain <span>, distinct
    // element/class from that message's <p>) to avoid strict-mode ambiguity.
    await expect(page.locator("span.text-muted-foreground", { hasText: "100%" })).toBeVisible();

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: (await prisma.user.findUniqueOrThrow({ where: { email: SEEDED.student.email } })).id, courseId } },
    });
    expect(enrollment.status).toBe("COMPLETED");
  });

  test("certificate appears on /certificates with a working Download PDF link", async ({ page }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
    await page.goto("/certificates");

    await expect(page.getByText("AI Foundations for Everyone")).toBeVisible();
    const downloadLink = page.getByRole("link", { name: /download pdf/i });
    await expect(downloadLink).toBeVisible();
    const href = await downloadLink.getAttribute("href");
    expect(href).toBeTruthy();

    // Fetch the PDF directly and confirm it's a real, non-trivial file
    const resp = await page.request.get(href!);
    expect(resp.status()).toBe(200);
    const bytes = await resp.body();
    expect(bytes.byteLength).toBeGreaterThan(500);
    expect(bytes.subarray(0, 4).toString("latin1")).toBe("%PDF");
  });

  test("the real verification ID validates on the public /verify page - no login required", async ({
    browser,
  }) => {
    const student = await prisma.user.findUniqueOrThrow({ where: { email: SEEDED.student.email } });
    const cert = await prisma.certificate.findFirstOrThrow({ where: { userId: student.id, courseId } });

    // Fresh, fully logged-out context - proves this genuinely needs no auth
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/verify");
    await page.getByLabel("Verification ID").fill(cert.verificationId);
    await page.getByRole("button", { name: "Verify" }).click();

    await expect(page.getByText(/valid certificate/i)).toBeVisible();
    await expect(page.getByText("Chidi Okafor")).toBeVisible();
    await expect(page.getByText("AI Foundations for Everyone")).toBeVisible();
    await context.close();
  });
});
