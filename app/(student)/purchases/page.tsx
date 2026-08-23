import { PagePlaceholder } from "@/components/page-placeholder";
import { requireRole } from "@/lib/require-role";

// Transaction list: course, amount, status, date, receipt link.
// Failed items show a Retry action (reuses the same Payment.attempts flow).
export default async function PurchasesPage() {
  await requireRole(["STUDENT"]);
  return (
    <PagePlaceholder
      title="Purchases"
      route="/purchases"
      access="Student"
      note="Transaction history with retry on failed payments. See docs/WEBFLOW.md §5.4."
    />
  );
}
