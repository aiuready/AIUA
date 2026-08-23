import type { Role } from "@prisma/client";

// Where each role lands after auth (PRD §2, Webflow §4).
export function roleHome(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    default:
      return "/dashboard";
  }
}
