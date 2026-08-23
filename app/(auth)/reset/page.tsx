import { PagePlaceholder } from "@/components/page-placeholder";

export default function ResetPage() {
  return (
    <PagePlaceholder
      title="Reset password"
      route="/reset"
      access="Public"
      note="Email -> sent-confirmation state. See docs/WEBFLOW.md §4."
    />
  );
}
