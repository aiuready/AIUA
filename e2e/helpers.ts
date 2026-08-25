import type { Page } from "@playwright/test";

export const SEEDED = {
  admin: { email: "admin@aiua.africa", password: "admin12345" },
  instructor: { email: "instructor@aiua.africa", password: "instructor12345" },
  student: { email: "student@aiua.africa", password: "student12345" },
};

// Real UI login - types into the actual form and submits it, same as a
// person would, rather than forging a session cookie.
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForLoadState("networkidle");
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /log out/i }).click();
  await page.waitForLoadState("networkidle");
}
