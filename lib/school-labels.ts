import type { School } from "@prisma/client";

export const SCHOOL_LABELS: Record<School, string> = {
  FOUNDATIONS: "Foundations",
  BUSINESS: "Business",
  CONTENT: "Content",
  CAREERS: "Careers",
  PROFESSIONALS: "Professionals",
  BUILDERS: "Builders",
  AFRICAN_AI: "African AI",
  INSTRUCTOR_TRACK: "Instructor Track",
};

export const ALL_SCHOOLS = Object.keys(SCHOOL_LABELS) as School[];
