import { PagePlaceholder } from "@/components/page-placeholder";
import { requireRole } from "@/lib/require-role";

// Own courses (draft/published), create-course action, students-count and
// grading-queue summary. Requires INSTRUCTOR role. See docs/WEBFLOW.md §6.1.
export default async function InstructorDashboardPage() {
  await requireRole(["INSTRUCTOR"]);
  return (
    <PagePlaceholder
      title="Instructor dashboard"
      route="/instructor"
      access="Instructor"
      note="Own courses + grading queue summary. See docs/WEBFLOW.md §6.1."
    />
  );
}
