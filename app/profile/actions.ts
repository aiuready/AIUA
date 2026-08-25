"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { uploadFile } from "@/lib/storage";

// name, photo, bio (instructors), purchase history (students) - PRD §3.1.
// Not in the original Webflow route map; added under /profile, reachable
// by any authenticated role from the site header.
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const schema = z.object({
  name: z.string().min(2, "Name is too short."),
  bio: z.string().max(2000, "Bio is too long.").optional(),
});

export type UpdateProfileState = { error?: string } | undefined;

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await requireRole(["STUDENT", "INSTRUCTOR", "ADMIN"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data: { name: string; bio?: string; photoUrl?: string } = {
    name: parsed.data.name,
  };
  // bio is schema-wide (not role-restricted at the DB level) but only
  // meaningful for instructors per PRD §3.1 - the form only shows/sends
  // it for that role, so a student's bio field naturally stays untouched.
  if (parsed.data.bio !== undefined) {
    data.bio = parsed.data.bio;
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
      return { error: "Photo must be a JPEG, PNG, or WebP image." };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: "Photo must be under 2MB." };
    }
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const buffer = Buffer.from(await photo.arrayBuffer());
    data.photoUrl = await uploadFile(
      `avatars/${session.user.id}-${Date.now()}.${ext}`,
      buffer,
      photo.type
    );
  }

  await prisma.user.update({ where: { id: session.user.id }, data });

  redirect("/profile?saved=1");
}
