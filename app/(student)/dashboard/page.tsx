import { PagePlaceholder } from "@/components/page-placeholder";

// Student home: continue-learning card (most recent course + progress bar),
// enrolled courses list, quick links to certificates/purchases.
// Requires STUDENT role, enforced server-side. See docs/WEBFLOW.md §5.1.
export default function StudentDashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      route="/dashboard"
      access="Student"
      note="Continue-learning card + enrolled courses. See docs/WEBFLOW.md §5.1."
    />
  );
}
