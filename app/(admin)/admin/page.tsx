import { PagePlaceholder } from "@/components/page-placeholder";

// Courses (publish/unpublish/archive), Users (role changes), Payments
// (refunds), Certificates (issue/revoke), basic revenue/enrollment
// reporting. Requires ADMIN role. Mobile: tables become stacked cards.
// See docs/WEBFLOW.md §7.
export default function AdminDashboardPage() {
  return (
    <PagePlaceholder
      title="Admin"
      route="/admin"
      access="Admin"
      note="Courses, users, payments, certificates, reporting. See docs/WEBFLOW.md §7."
    />
  );
}
