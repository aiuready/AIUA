import { PagePlaceholder } from "@/components/page-placeholder";
import { requireRole } from "@/lib/require-role";

// Learning experience. Mobile: module list collapses into a drawer, active
// module fills the screen (video -> PDF -> quiz), progress bar pinned at
// top, full-width "Mark complete / Next" bottom action. Live-class link
// shown if a Cohort exists for the course. Requires an ACTIVE Enrollment.
// See docs/WEBFLOW.md §5.2.
export default async function LearnPage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  await requireRole(["STUDENT"]);
  const { course } = await params;
  return (
    <PagePlaceholder
      title={`Learning: ${course}`}
      route="/learn/[course]"
      access="Student"
      note="Module drawer + active module (video/PDF/quiz). See docs/WEBFLOW.md §5.2."
    />
  );
}
