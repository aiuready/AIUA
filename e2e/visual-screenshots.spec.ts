import { test } from "@playwright/test";
import { loginAs, SEEDED } from "./helpers";

// Not assertions - just captures for actual human/Claude visual review.
// Every other spec file verifies behavior; this is the first time this
// design system has ever been looked at rather than just tested.
const shots = "e2e/screenshots";

test.describe("Visual capture", () => {
  test("desktop: public pages", async ({ page }) => {
    await page.goto("/");
    await page.screenshot({ path: `${shots}/01-home-desktop.png`, fullPage: true });

    await page.goto("/courses");
    await page.screenshot({ path: `${shots}/02-courses-desktop.png`, fullPage: true });

    await page.goto("/courses/ai-foundations");
    await page.screenshot({ path: `${shots}/03-course-detail-desktop.png`, fullPage: true });

    await page.goto("/login");
    await page.screenshot({ path: `${shots}/04-login-desktop.png`, fullPage: true });

    await page.goto("/signup");
    await page.screenshot({ path: `${shots}/05-signup-desktop.png`, fullPage: true });

    await page.goto("/verify");
    await page.screenshot({ path: `${shots}/06-verify-desktop.png`, fullPage: true });
  });

  test("desktop: logged-in student/instructor/admin", async ({ page }) => {
    await loginAs(page, SEEDED.student.email, SEEDED.student.password);
    await page.screenshot({ path: `${shots}/07-student-dashboard-desktop.png`, fullPage: true });
    await page.goto("/profile");
    await page.screenshot({ path: `${shots}/08-profile-desktop.png`, fullPage: true });
    await page.goto("/purchases");
    await page.screenshot({ path: `${shots}/09-purchases-desktop.png`, fullPage: true });

    await loginAs(page, SEEDED.instructor.email, SEEDED.instructor.password);
    await page.screenshot({ path: `${shots}/10-instructor-dashboard-desktop.png`, fullPage: true });

    await loginAs(page, SEEDED.admin.email, SEEDED.admin.password);
    await page.screenshot({ path: `${shots}/11-admin-dashboard-desktop.png`, fullPage: true });
  });

  test("mobile (390px): key pages + nav", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/");
    await page.screenshot({ path: `${shots}/12-home-mobile.png`, fullPage: true });

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.screenshot({ path: `${shots}/13-mobile-nav-open.png` });

    await page.goto("/courses");
    await page.screenshot({ path: `${shots}/14-courses-mobile.png`, fullPage: true });

    await page.goto("/courses/ai-foundations");
    await page.screenshot({ path: `${shots}/15-course-detail-mobile.png`, fullPage: true });
  });
});
