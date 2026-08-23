"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { issueCertificateIfNeeded } from "@/lib/certificates";

export async function setCourseStatusAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const courseId = String(formData.get("courseId"));
  const status = String(formData.get("status"));
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) redirect("/admin");

  await prisma.course.update({
    where: { id: courseId },
    data: { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" },
  });
  redirect("/admin?saved=1#courses");
}

// Role upgrade path (PRD §2: "instructors are approved/upgraded by an
// admin"). Also the only place a role changes post-signup.
export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));
  if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) redirect("/admin");

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as "STUDENT" | "INSTRUCTOR" | "ADMIN" },
  });
  redirect("/admin?saved=1#users");
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  const session = await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  if (userId === session.user.id) redirect("/admin?error=self#users"); // can't deactivate yourself

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  redirect("/admin?saved=1#users");
}

export async function refundPaymentAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const paymentId = String(formData.get("paymentId"));

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (payment?.status === "SUCCESS") {
    // Flips our own record only - calling the gateway's refund API is a
    // separate integration not in scope here (TASKS.md §8 notes this).
    await prisma.payment.update({ where: { id: paymentId }, data: { status: "REFUNDED" } });
  }
  redirect("/admin?saved=1#payments");
}

export async function revokeCertificateAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const certificateId = String(formData.get("certificateId"));

  await prisma.certificate.update({
    where: { id: certificateId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  redirect("/admin?saved=1#certificates");
}

// Manual issuance for the edge case of a COMPLETED enrollment somehow
// missing a certificate (data repair, not the normal path - that's
// automatic in lib/progress.ts on reaching 100%).
export async function issueCertificateAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId"));
  const courseId = String(formData.get("courseId"));

  await issueCertificateIfNeeded(userId, courseId);
  redirect("/admin?saved=1#certificates");
}
