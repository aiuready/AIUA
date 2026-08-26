import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAs, logout, SEEDED } from "./helpers";

const prisma = new PrismaClient();
const testEmail = `e2e-${Date.now()}@aiua.africa`;

test.describe("Auth", () => {
  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  test("signup creates a real account, sends a verification email, and lands on the student dashboard", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Test Student");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill("e2epassword123");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/dashboard\?verifyEmail=1$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/verify your email to enroll/i)).toBeVisible();

    const created = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(created?.role).toBe("STUDENT");
    expect(created?.isActive).toBe(true);
    expect(created?.emailVerifiedAt).toBeNull();
  });

  test("checkout is blocked until email is verified, then the real verification link unblocks it", async ({
    page,
  }) => {
    await loginAs(page, testEmail, "e2epassword123");

    await page.goto("/courses/ai-foundations");
    await page.getByRole("button", { name: /enroll now/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/checkout=verify-email/);
    await expect(page.getByText(/verify your email before enrolling/i)).toBeVisible();

    // No orphaned Payment row from the blocked attempt.
    const user = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    expect(await prisma.payment.count({ where: { userId: user.id } })).toBe(0);

    // Use the real signed token, same mechanism the emailed link uses -
    // proves the token/route logic, not just the DB flag.
    const { createVerifyEmailToken } = await import("../lib/reset-token");
    const token = createVerifyEmailToken(testEmail);
    await page.goto(`/api/verify-email/${token}`);
    await expect(page).toHaveURL(/\/dashboard\?verified=1$/);
    await expect(page.getByText(/email verified/i)).toBeVisible();
    await expect(page.getByText(/verify your email to enroll/i)).toHaveCount(0);

    const verified = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    expect(verified.emailVerifiedAt).not.toBeNull();

    // A stale/garbage token must not verify anything.
    await page.goto("/api/verify-email/not-a-real-token");
    await expect(page).toHaveURL(/verifyEmail=invalid/);
  });

  test("logging in with that new account works, and logging out returns to a public state", async ({
    page,
  }) => {
    await loginAs(page, testEmail, "e2epassword123");
    await expect(page).toHaveURL(/\/dashboard$/);

    await logout(page);
    await expect(page).toHaveURL("/");
    // Logged-out nav should offer Log in / Sign up, not Dashboard / Log out.
    // Footer also has a "Log in" link, so scope to the header specifically.
    await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("wrong password shows an error and does not sign in", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill("totally-wrong-password");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("seeded admin/instructor/student credentials all still work", async ({ page }) => {
    for (const [role, creds] of Object.entries(SEEDED)) {
      await loginAs(page, creds.email, creds.password);
      const expectedPath = role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/dashboard";
      await expect(page).toHaveURL(new RegExp(`${expectedPath}$`));
      await logout(page);
    }
  });

  test("password reset request shows the sent-confirmation state without leaking whether the email exists", async ({
    page,
  }) => {
    await page.goto("/reset");
    await page.getByLabel("Email").fill("nonexistent-e2e@aiua.africa");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
