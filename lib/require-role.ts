import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/role-home";

// Server-side role gate (TRD §2, §5: "role-enforced access on every route
// ... never trust the client"). Call at the top of every server component
// page/layout, and re-check inside server actions/mutations that don't go
// through a gated page. Not logged in -> /login. Wrong role -> that user's
// own home, not an error page, since this is a routing mistake, not an
// attack signal worth surfacing as a hard failure.
//
// Also re-checks isActive on every call: the JWT session is stateless, so
// an admin deactivating a user mid-session wouldn't otherwise take effect
// until re-login. This costs one DB query per protected page load, which
// is the right trade on the TRD's co-located, low-latency architecture.
// Note: this only blocks access to gated content - it doesn't clear the
// session cookie mid-render (Next.js can't set cookies during render), so
// the SessionBar may still show the deactivated user as "signed in" even
// though every gated route bounces them to /login.
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });
  if (!dbUser || !dbUser.isActive) {
    redirect("/login?deactivated=1");
  }

  const role = session.user.role as Role;
  if (!allowed.includes(role)) {
    redirect(roleHome(role));
  }
  return session;
}
