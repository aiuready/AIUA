import { PagePlaceholder } from "@/components/page-placeholder";

// name, email, password. Role defaults to STUDENT; instructors are
// upgraded by an admin (see AIUA_Phase2_PRD.md §3.1).
export default function SignupPage() {
  return (
    <PagePlaceholder
      title="Sign up"
      route="/signup"
      access="Public"
      note="Name, email, password. Role defaults to student. See docs/WEBFLOW.md §4."
    />
  );
}
