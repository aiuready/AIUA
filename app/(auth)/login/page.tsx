import { PagePlaceholder } from "@/components/page-placeholder";

// Email + password login via Auth.js. On success, route by role:
// student -> /dashboard, instructor -> /instructor, admin -> /admin.
export default function LoginPage() {
  return (
    <PagePlaceholder
      title="Log in"
      route="/login"
      access="Public"
      note="Email + password. See docs/WEBFLOW.md §4."
    />
  );
}
