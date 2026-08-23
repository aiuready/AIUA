import { PagePlaceholder } from "@/components/page-placeholder";
import { requireRole } from "@/lib/require-role";

// Student home: continue-learning card (most recent course + progress bar),
// enrolled courses list, quick links to certificates/purchases.
// Requires STUDENT role, enforced server-side. See docs/WEBFLOW.md §5.1.
export default async function StudentDashboardPage() {
  await requireRole(["STUDENT"]);
  return (
    <PagePlaceholder
      title="Dashboard"
      route="/dashboard"
      access="Student"
      note="Continue-learning card + enrolled courses. See docs/WEBFLOW.md §5.1."
    />
  );
}
