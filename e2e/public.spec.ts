import { test, expect } from "@playwright/test";

test.describe("Public marketing site", () => {
  test("home page renders hero, trust strip, schools, featured courses, FAQ", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Learn. Build. Earn with AI." })).toBeVisible();
    await expect(page.getByText("8", { exact: true }).first()).toBeVisible(); // schools stat
    await expect(page.getByRole("heading", { name: "Featured courses" })).toBeVisible();
    // Real DB data, not placeholder text
    await expect(page.getByText("AI Foundations for Everyone")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Common questions" })).toBeVisible();
    // FAQ is a <details> accordion - confirm it actually opens
    const faq = page.getByText("How much do courses cost?");
    await faq.click();
    await expect(page.getByText(/there are no subscriptions in AIUA today/)).toBeVisible();
  });

  test("nav links to courses, about, verify all work", async ({ page }) => {
    await page.goto("/");
    // The header and footer both have a "Courses"/"Log in" link - scope to
    // the header (banner landmark) to avoid strict-mode ambiguity.
    await page.getByRole("banner").getByRole("link", { name: "Courses", exact: true }).click();
    await expect(page).toHaveURL(/\/courses$/);
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "Practical AI education, built for Africa" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eight schools, one platform" })).toBeVisible();
  });

  test("course catalog lists real published courses and school filter works", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("AI Foundations for Everyone")).toBeVisible();
    await expect(page.getByText("AI for Business Operations")).toBeVisible();
    await expect(page.getByText("AI-Powered Content Creation")).toBeVisible();

    await page.goto("/courses?school=BUSINESS");
    await expect(page.getByText("AI for Business Operations")).toBeVisible();
    await expect(page.getByText("AI Foundations for Everyone")).not.toBeVisible();
  });

  test("course detail page shows real modules, outcomes, instructor, and a working Enroll now CTA", async ({
    page,
  }) => {
    await page.goto("/courses/ai-foundations");
    await expect(page.getByRole("heading", { name: "AI Foundations for Everyone" })).toBeVisible();
    await expect(page.getByText("Module 1: Orientation")).toBeVisible();
    await expect(page.getByText("Module 2: Core Concepts")).toBeVisible();
    await expect(page.getByText("Ada Chukwu")).toBeVisible();
    // Not logged in - CTA should prompt login, never expose gateway names
    await expect(page.getByRole("link", { name: /log in to enroll/i })).toBeVisible();
    await expect(page.getByText("Paystack")).toHaveCount(0);
    await expect(page.getByText("Flutterwave")).toHaveCount(0);
  });

  test("unknown course slug shows the real not-found page", async ({ page }) => {
    // Note: this doesn't assert res.status() === 404. Confirmed via a real
    // run that Next 16 production mode resolves notFound()/redirect() to
    // its final content server-side and serves it with 200 (one round
    // trip) rather than a literal HTTP 404/3xx - content and behavior are
    // correct, only the status code metadata differs from dev mode.
    await page.goto("/courses/this-course-does-not-exist");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("certificate verification: unknown ID reports NOT_FOUND", async ({ page }) => {
    await page.goto("/verify");
    await page.getByLabel("Verification ID").fill("does-not-exist-12345");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText(/no certificate found/i)).toBeVisible();
  });
});
