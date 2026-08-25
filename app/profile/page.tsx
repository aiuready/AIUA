import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { ProfileForm } from "@/components/profile-form";

// Profile: name, photo, bio (instructors), purchase history (students) -
// PRD §3.1. Not in the original Webflow route map; reachable by every
// role from the site header rather than a role-specific route group.
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireRole(["STUDENT", "INSTRUCTOR", "ADMIN"]);
  const { saved } = await searchParams;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, bio: true, photoUrl: true },
  });

  return (
    <main className="py-8 sm:py-12">
      <Container className="flex flex-col gap-6 !max-w-2xl">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.email} &middot; {user.role}
          </p>
        </div>

        {saved === "1" && (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Saved.</p>
        )}

        <ProfileForm
          name={user.name}
          bio={user.bio ?? ""}
          photoUrl={user.photoUrl}
          showBio={user.role === "INSTRUCTOR"}
        />

        {user.role === "STUDENT" && (
          <Link href="/purchases" className="text-sm font-medium text-primary hover:underline">
            View purchase history →
          </Link>
        )}
      </Container>
    </main>
  );
}
