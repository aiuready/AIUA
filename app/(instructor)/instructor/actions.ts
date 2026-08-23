"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  title: z.string().min(3, "Title is too short."),
  description: z.string().min(1, "Description is required."),
  outcomes: z.string().min(1, "Outcomes are required."),
  school: z.enum([
    "FOUNDATIONS",
    "BUSINESS",
    "CONTENT",
    "CAREERS",
    "PROFESSIONALS",
    "BUILDERS",
    "AFRICAN_AI",
    "INSTRUCTOR_TRACK",
  ]),
  priceNaira: z.coerce.number().min(0, "Price can't be negative."),
});

export type CreateCourseState = { error?: string } | undefined;

// Own-serve course creation (PRD §1.1: "instructors a self-serve way to
// publish and manage their own courses"). Always starts DRAFT.
export async function createCourseAction(
  _prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    redirect("/login");
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    outcomes: formData.get("outcomes"),
    school: formData.get("school"),
    priceNaira: formData.get("priceNaira"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const baseSlug = slugify(parsed.data.title) || "course";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      outcomes: parsed.data.outcomes,
      school: parsed.data.school,
      priceKobo: Math.round(parsed.data.priceNaira * 100),
      status: "DRAFT",
      instructorId: session.user.id,
    },
  });

  redirect(`/instructor/courses/${course.id}`);
}
