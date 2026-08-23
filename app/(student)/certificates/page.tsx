import { PagePlaceholder } from "@/components/page-placeholder";
import { requireRole } from "@/lib/require-role";

export default async function StudentCertificatesPage() {
  await requireRole(["STUDENT"]);
  return (
    <PagePlaceholder
      title="My certificates"
      route="/certificates"
      access="Student"
      note="Course, issue date, verification ID, Download PDF. See docs/WEBFLOW.md §5.3."
    />
  );
}
