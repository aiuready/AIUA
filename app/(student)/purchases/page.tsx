import { PagePlaceholder } from "@/components/page-placeholder";

// Transaction list: course, amount, status, date, receipt link.
// Failed items show a Retry action (reuses the same Payment.attempts flow).
export default function PurchasesPage() {
  return (
    <PagePlaceholder
      title="Purchases"
      route="/purchases"
      access="Student"
      note="Transaction history with retry on failed payments. See docs/WEBFLOW.md §5.4."
    />
  );
}
