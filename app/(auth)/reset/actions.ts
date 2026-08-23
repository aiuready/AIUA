"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createResetToken, verifyResetToken } from "@/lib/reset-token";
import { sendEmail } from "@/lib/email";

const requestSchema = z.object({ email: z.string().email("Enter a valid email.") });

export type ResetRequestState = { sent?: boolean; error?: string } | undefined;

export async function requestResetAction(
  _prevState: ResetRequestState,
  formData: FormData
): Promise<ResetRequestState> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always report success even when the account doesn't exist - don't leak
  // which emails are registered.
  if (user) {
    const token = createResetToken(user.email);
    const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your AIUA password",
      html: `<p>Reset your password: <a href="${url}">${url}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }

  return { sent: true };
}

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type ResetConfirmState = { error?: string } | undefined;

export async function confirmResetAction(
  _prevState: ResetConfirmState,
  formData: FormData
): Promise<ResetConfirmState> {
  const parsed = confirmSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const verified = verifyResetToken(parsed.data.token);
  if (!verified) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { email: verified.email },
    data: { passwordHash },
  });

  redirect("/login");
}
