import { test, expect } from "@playwright/test";
import { SEEDED } from "./helpers";

// Self-contained mobile-viewport tests - deliberately not sharing
// helpers.ts's loginAs/logout, since those click the desktop nav's
// always-rendered buttons, which are hidden (not just visually, but via
// `hidden lg:flex`) at this breakpoint.
test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile viewport (390px, Webflow §1 mobile-first)", () => {
  test("no horizontal overflow on key pages at 390px", async ({ page }) => {
    for (const path of ["/", "/courses", "/courses/ai-foundations", "/about", "/verify", "/login"]) {
      await page.goto(path);
      const overflowing = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflowing, `${path} has horizontal overflow at 390px`).toBe(false);
    }
  });

  test("hamburger menu opens/closes and its links work (logged out)", async ({ page }) => {
    await page.goto("/");
    // Desktop-only nav must be actually hidden (display:none via `lg:flex`
    // on a `hidden` base class), not just visually off-screen
    await expect(page.locator("nav.hidden")).not.toBeVisible();

    const menuButton = page.getByRole("button", { name: "Open menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    // Portaled to document.body (see components/mobile-nav.tsx for why:
    // backdrop-filter on the header traps position:fixed descendants
    // otherwise) - fixed/top-16 now, not absolute/top-full.
    const menu = page.locator("div.fixed.inset-x-0.top-16");
    await expect(menu.getByRole("link", { name: "Courses", exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Sign up" })).toBeVisible();

    await menu.getByRole("link", { name: "Courses", exact: true }).click();
    await expect(page).toHaveURL(/\/courses$/);
  });

  test("logged-in mobile nav shows Profile/Dashboard/Log out and log out actually works", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(SEEDED.student.email);
    await page.getByLabel("Password").fill(SEEDED.student.password);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Open menu" }).click();
    // Portaled to document.body (see components/mobile-nav.tsx for why:
    // backdrop-filter on the header traps position:fixed descendants
    // otherwise) - fixed/top-16 now, not absolute/top-full.
    const menu = page.locator("div.fixed.inset-x-0.top-16");
    await expect(menu.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Dashboard" })).toBeVisible();

    await menu.getByRole("button", { name: /log out/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
  });
});
