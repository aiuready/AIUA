import { PagePlaceholder } from "@/components/page-placeholder";

// Course editor + grading queue. Instructor sees only their own courses and
// students - enforce Course.instructorId === session.user.id server-side on
// every read/write here. See docs/WEBFLOW.md §6.2.
export default async function InstructorCourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PagePlaceholder
      title={`Edit course: ${id}`}
      route="/instructor/courses/[id]"
      access="Instructor"
      note="Modules, quizzes, grading queue. Own-courses-only. See docs/WEBFLOW.md §6.2."
    />
  );
}
