import { PagePlaceholder } from "@/components/page-placeholder";

// Course detail. Mobile order: title -> price + sticky Enroll CTA ->
// description -> modules list -> outcomes -> instructor.
// Enroll CTA requires auth; unpublished courses are visible only to their
// instructor and admins. See docs/WEBFLOW.md §3.3.
export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Course: ${slug}`}
      route="/courses/[slug]"
      access="Public"
      note="Course detail + Enroll CTA. See docs/WEBFLOW.md §3.3."
    />
  );
}
