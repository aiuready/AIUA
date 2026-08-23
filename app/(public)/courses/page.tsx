import { PagePlaceholder } from "@/components/page-placeholder";

// Public course catalog. Filter by School enum (see prisma/schema.prisma),
// rendered as a horizontal scrollable chip row on mobile per
// docs/WEBFLOW.md §3.2. Only status: PUBLISHED courses are queried here.
export default function CoursesPage() {
  return (
    <PagePlaceholder
      title="Course catalog"
      route="/courses"
      access="Public"
      note="Published courses, filterable by school. See docs/WEBFLOW.md §3.2."
    />
  );
}
