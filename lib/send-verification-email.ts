import { createVerifyEmailToken } from "@/lib/reset-token";
import { sendEmail } from "@/lib/email";

// Shared by signup (first send) and the dashboard's "Resend" action.
export async function sendVerificationEmail(email: string): Promise<void> {
  const token = createVerifyEmailToken(email);
  const link = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your AIUA email",
    html: `<p>Confirm your email to enroll in courses on AI University Africa:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
  });
}
