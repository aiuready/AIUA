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

  test("signup creates a real account and lands on the student dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Test Student");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill("e2epassword123");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    const created = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(created?.role).toBe("STUDENT");
    expect(created?.isActive).toBe(true);
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
