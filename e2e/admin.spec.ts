import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAs, SEEDED } from "./helpers";

const prisma = new PrismaClient();
const throwawayEmail = `e2e-admin-target-${Date.now()}@aiua.africa`;

// A read via this test file's own PrismaClient, taken immediately after a
// UI-triggered write, was observed to occasionally return a stale value on
// the first attempt against local MySQL (confirmed reproducible, and
// confirmed NOT an app bug: the page's own post-redirect re-render already
// shows the correct persisted value at the same moment the raw DB read is
// stale). Poll briefly rather than trust a single immediate read.
async function pollUntil<T>(read: () => Promise<T>, predicate: (v: T) => boolean, attempts = 5): Promise<T> {
  let value = await read();
  for (let i = 0; i < attempts && !predicate(value); i++) {
    await new Promise((r) => setTimeout(r, 200));
    value = await read();
  }
  return value;
}

test.describe.serial("Admin dashboard", () => {
  let throwawayUserId: string;

  test.beforeAll(async () => {
    const bcrypt = await import("bcryptjs");
    const user = await prisma.user.create({
      data: {
        email: throwawayEmail,
        name: "E2E Throwaway User",
        passwordHash: await bcrypt.hash("throwaway12345", 10),
        role: "STUDENT",
      },
    });
    throwawayUserId = user.id;
  });

  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: throwawayEmail } });
    await prisma.$disconnect();
  });

  test("all sections render with real data: reporting, courses, users, payments, certificates", async ({
    page,
  }) => {
    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();

    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Active enrollments")).toBeVisible();
    // "AI Foundations for Everyone" can also appear in a Payments row
    // (e.g. "Chidi Okafor — AI Foundations for Everyone") - scope to the
    // Courses section specifically to avoid strict-mode ambiguity.
    await expect(page.locator("#courses").getByText("AI Foundations for Everyone")).toBeVisible();
    await expect(page.getByText("E2E Throwaway User")).toBeVisible();
  });

  test("user row shows role as read-only text, not an editable control (role-change UI was deliberately removed)", async ({
    page,
  }) => {
    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);

    // .rounded-lg uniquely identifies the row container within #users -
    // the Courses section also has "Update" buttons, so this must be
    // scoped past #users, not just page-wide `.first()`.
    const row = page.locator("#users div.rounded-lg").filter({ hasText: throwawayEmail });
    await expect(row).toHaveCount(1);
    await expect(row.getByText("STUDENT")).toBeVisible();
    await expect(row.getByRole("combobox")).toHaveCount(0);

    // The role never changes without a schema-level/DB action now -
    // instructor accounts are created directly (createInstructorAction),
    // not promoted from student.
    const user = await prisma.user.findUniqueOrThrow({ where: { id: throwawayUserId } });
    expect(user.role).toBe("STUDENT");
  });

  test("deactivating and reactivating a user actually flips isActive, and login is blocked while deactivated", async ({
    page,
    context,
  }) => {
    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);
    const row = page.locator("#users div.rounded-lg").filter({ hasText: throwawayEmail });

    await row.getByRole("button", { name: "Deactivate" }).click();
    await page.waitForLoadState("networkidle");

    await expect(row.getByText("(deactivated)")).toBeVisible();
    let target = await pollUntil(
      () => prisma.user.findUniqueOrThrow({ where: { id: throwawayUserId } }),
      (u) => u.isActive === false
    );
    expect(target.isActive).toBe(false);

    // Deactivated user genuinely cannot log in, from a fresh logged-out context
    const anonPage = await context.newPage();
    await anonPage.goto("/login");
    await anonPage.getByLabel("Email").fill(throwawayEmail);
    await anonPage.getByLabel("Password").fill("throwaway12345");
    await anonPage.getByRole("button", { name: /log in/i }).click();
    await expect(anonPage.getByText(/invalid email or password/i)).toBeVisible();
    await anonPage.close();

    await row.getByRole("button", { name: "Reactivate" }).click();
    await page.waitForLoadState("networkidle");
    await expect(row.getByText("(deactivated)")).toHaveCount(0);

    target = await pollUntil(
      () => prisma.user.findUniqueOrThrow({ where: { id: throwawayUserId } }),
      (u) => u.isActive === true
    );
    expect(target.isActive).toBe(true);
  });

  test("refunding a SUCCESS payment flips it to REFUNDED", async ({ page }) => {
    const course = await prisma.course.findUniqueOrThrow({ where: { slug: "ai-foundations" } });
    const payment = await prisma.payment.create({
      data: {
        userId: throwawayUserId,
        courseId: course.id,
        provider: "PAYSTACK",
        status: "SUCCESS",
        amountKobo: course.priceKobo,
        reference: `e2e-refund-${Date.now()}`,
      },
    });

    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);
    const row = page.locator("#payments div.rounded-lg").filter({ hasText: "E2E Throwaway User" });
    await expect(row).toHaveCount(1);
    await expect(row.getByText("SUCCESS")).toBeVisible();
    await row.getByRole("button", { name: "Refund" }).click();
    await page.waitForLoadState("networkidle");

    // Refund button disappears once status !== SUCCESS - direct UI proof.
    await expect(row.getByRole("button", { name: "Refund" })).toHaveCount(0);

    const refunded = await pollUntil(
      () => prisma.payment.findUniqueOrThrow({ where: { id: payment.id } }),
      (p) => p.status === "REFUNDED"
    );
    expect(refunded.status).toBe("REFUNDED");
    await prisma.payment.delete({ where: { id: payment.id } });
  });

  test("revoking a certificate actually flips its status and the public /verify page reflects it immediately", async ({
    page,
  }) => {
    const course = await prisma.course.findUniqueOrThrow({ where: { slug: "ai-foundations" } });
    const cert = await prisma.certificate.create({
      data: {
        userId: throwawayUserId,
        courseId: course.id,
        verificationId: `e2e-revoke-${Date.now()}`,
        pdfUrl: "/api/uploads/e2e-fake.pdf",
        status: "VALID",
      },
    });

    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);
    const row = page.locator("#certificates div.rounded-lg").filter({ hasText: cert.verificationId });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Revoke" }).click();
    await page.waitForLoadState("networkidle");

    // Revoke button disappears once status !== VALID - direct UI proof.
    await expect(row.getByRole("button", { name: "Revoke" })).toHaveCount(0);

    const revoked = await pollUntil(
      () => prisma.certificate.findUniqueOrThrow({ where: { id: cert.id } }),
      (c) => c.status === "REVOKED"
    );
    expect(revoked.status).toBe("REVOKED");

    // Public verify page must reflect this immediately, no caching issue
    const verifyPage = await page.context().newPage();
    await verifyPage.goto("/verify");
    await verifyPage.getByLabel("Verification ID").fill(cert.verificationId);
    await verifyPage.getByRole("button", { name: "Verify" }).click();
    await expect(verifyPage.getByText(/revoked/i)).toBeVisible();
    await verifyPage.close();

    await prisma.certificate.delete({ where: { id: cert.id } });
  });
});
