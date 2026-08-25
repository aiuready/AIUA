"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

const schema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupState = { error?: string } | undefined;

// name, email, password; role defaults to STUDENT (PRD §3.1).
export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "STUDENT" },
  });

  // See app/(auth)/login/actions.ts for why this is wrapped in try/catch -
  // a failed signIn() throws in practice (confirmed via a real Playwright
  // run), it doesn't just return a URL with an "error" param as documented.
  let redirectUrl: string | undefined;
  try {
    redirectUrl = await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created — please log in." };
    }
    throw err;
  }
  const failed =
    typeof redirectUrl === "string" &&
    new URL(redirectUrl, process.env.NEXTAUTH_URL ?? "http://localhost:3000").searchParams.get(
      "error"
    );
  if (failed) {
    return { error: "Account created — please log in." };
  }

  redirect("/dashboard");
}
