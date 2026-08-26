"use server";

import { z } from "zod";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { issueCertificateIfNeeded } from "@/lib/certificates";
import { createResetToken } from "@/lib/reset-token";
import { sendEmail } from "@/lib/email";

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

// Instructors sign up SOLELY from the backend - only an admin can create an
// instructor account (no public signup path ever offers the INSTRUCTOR
// role). The account gets a random password nobody knows; a reset token
// (the same mechanism as forgot-password, see lib/reset-token.ts) is
// emailed to them so they set their own password via /reset/[token]. The
// link is also surfaced on this page since real email delivery isn't
// guaranteed configured in every environment - the admin can copy/share it
// directly if needed.
const createInstructorSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("Enter a valid email."),
});

export async function createInstructorAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);

  const parsed = createInstructorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) redirect("/admin?error=instructor#users");

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) redirect("/admin?error=instructor-exists#users");

  const randomPassword = crypto.randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "INSTRUCTOR",
    },
  });

  const token = createResetToken(parsed.data.email);
  const setupLink = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset/${token}`;

  await sendEmail({
    to: parsed.data.email,
    subject: "Set up your AIUA instructor account",
    html: `<p>An AIUA admin created an instructor account for you.</p><p>Set your password to get started: <a href="${setupLink}">${setupLink}</a></p><p>This link expires in 1 hour. Log in afterwards at ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/instructor/login.</p>`,
  });

  redirect(`/admin?instructorCreated=1&setupLink=${encodeURIComponent(setupLink)}#users`);
}

// --- Announcement moderation (admin must approve everything an
// instructor pushes to students) + admin's own announcements, which are
// self-approved since the admin is the approver. ---

export async function approveAnnouncementAction(formData: FormData): Promise<void> {
  const session = await requireRole(["ADMIN"]);
  const announcementId = String(formData.get("announcementId"));

  await prisma.announcement.update({
    where: { id: announcementId },
    data: { status: "APPROVED", reviewedById: session.user.id, reviewedAt: new Date() },
  });
  redirect("/admin?saved=1#announcements");
}

export async function rejectAnnouncementAction(formData: FormData): Promise<void> {
  const session = await requireRole(["ADMIN"]);
  const announcementId = String(formData.get("announcementId"));

  await prisma.announcement.update({
    where: { id: announcementId },
    data: { status: "REJECTED", reviewedById: session.user.id, reviewedAt: new Date() },
  });
  redirect("/admin?saved=1#announcements");
}

export async function deleteAnnouncementAdminAction(formData: FormData): Promise<void> {
  await requireRole(["ADMIN"]);
  const announcementId = String(formData.get("announcementId"));
  await prisma.announcement.delete({ where: { id: announcementId } });
  redirect("/admin?saved=1#announcements");
}

export async function createAdminAnnouncementAction(formData: FormData): Promise<void> {
  const session = await requireRole(["ADMIN"]);
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!title || !message) redirect("/admin?error=announcement#announcements");

  const link = String(formData.get("link") ?? "").trim() || null;
  const courseId = String(formData.get("courseId") ?? "").trim() || null; // "" = platform-wide

  await prisma.announcement.create({
    data: {
      courseId,
      authorId: session.user.id,
      title,
      message,
      link,
      status: "APPROVED", // admin is the approver - no self-review needed
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });
  redirect("/admin?saved=1#announcements");
}
