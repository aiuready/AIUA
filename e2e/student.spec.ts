import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAs, SEEDED } from "./helpers";

const prisma = new PrismaClient();

test.describe("Student flows", () => {
  test.beforeAll(async () => {
    // Test files don't run in a guaranteed order (learning.spec.ts
    // deliberately leaves a COMPLETED enrollment + certificate behind as
    // proof of the full loop) - reset the seeded student to a clean slate
    // here so this file's empty-state assertions are correct regardless
    // of what ran before it.
    const student = await prisma.user.findUniqueOrThrow({ where: { email: SEEDED.student.email } });
    await prisma.certificate.deleteMany({ where: { userId: student.id } });
    const enrollments = await prisma.enrollment.findMany({ where: { userId: student.id } });
    for (const e of enrollments) {
      await prisma.moduleProgress.deleteMany({ where: { enrollmentId: e.id } });
    }
    await prisma.enrollment.deleteMany({ where: { userId: student.id } });
    await prisma.answer.deleteMany({ where: { submission: { userId: student.id } } });
    await prisma.submission.deleteMany({ where: { userId: student.id } });
  });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("dashboard, purchases, certificates show correct empty states with no enrollments", async ({
    page,
  }) => {
    await expect(page.getByText(/not enrolled in a course yet/i)).toBeVisible();

    await page.goto("/purchases");
    await expect(page.getByText(/no purchases yet/i)).toBeVisible();

    await page.goto("/certificates");
    await expect(page.getByText(/no certificates yet/i)).toBeVisible();
  });

  test("clicking Enroll now on a course gracefully reports unavailable (no gateway keys in this env)", async ({
    page,
  }) => {
    await page.goto("/courses/ai-foundations");
    await expect(page.getByText("Paystack")).toHaveCount(0);
    await expect(page.getByText("Flutterwave")).toHaveCount(0);
    await page.getByRole("button", { name: /enroll now/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/enrollment payment isn.t available right now/i)).toBeVisible();

    // Confirm no orphaned PENDING payment was left behind by this click
    const stray = await prisma.payment.count({ where: { reference: { contains: "ai-foundations" } } });
    expect(stray).toBe(0);
  });

  test("profile page: student sees no bio field, name update actually persists", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByLabel("Name")).toHaveValue("Chidi Okafor");
    await expect(page.getByLabel("Bio")).toHaveCount(0); // instructor-only field

    await page.getByLabel("Name").fill("Chidi Okafor Edited");
    await page.getByRole("button", { name: /save changes/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Saved.")).toBeVisible();

    const updated = await prisma.user.findUnique({ where: { email: SEEDED.student.email } });
    expect(updated?.name).toBe("Chidi Okafor Edited");

    // restore
    await prisma.user.update({ where: { email: SEEDED.student.email }, data: { name: "Chidi Okafor" } });
  });
});
