"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { sendVerificationEmail } from "@/lib/send-verification-email";

export async function resendVerificationEmailAction(): Promise<void> {
  const session = await requireRole(["STUDENT"]);
  await sendVerificationEmail(session.user.email!);
  redirect("/dashboard?verifyEmail=sent");
}
