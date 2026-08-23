import { PagePlaceholder } from "@/components/page-placeholder";

export default function StudentCertificatesPage() {
  return (
    <PagePlaceholder
      title="My certificates"
      route="/certificates"
      access="Student"
      note="Course, issue date, verification ID, Download PDF. See docs/WEBFLOW.md §5.3."
    />
  );
}
