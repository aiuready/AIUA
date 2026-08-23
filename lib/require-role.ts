import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { roleHome } from "@/lib/role-home";

// Server-side role gate (TRD §2, §5: "role-enforced access on every route
// ... never trust the client"). Call at the top of every server component
// page/layout, and re-check inside server actions/mutations that don't go
// through a gated page. Not logged in -> /login. Wrong role -> that user's
// own home, not an error page, since this is a routing mistake, not an
// attack signal worth surfacing as a hard failure.
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const role = session.user.role as Role;
  if (!allowed.includes(role)) {
    redirect(roleHome(role));
  }
  return session;
}
