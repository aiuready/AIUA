"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/role-home";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // signIn(..., { redirect: false }) returns the callback redirect URL as a
  // string; a failed attempt carries an "error" query param on that URL.
  const redirectUrl = await signIn("credentials", { email, password, redirect: false });
  const failed =
    typeof redirectUrl === "string" &&
    new URL(redirectUrl, process.env.NEXTAUTH_URL ?? "http://localhost:3000").searchParams.get(
      "error"
    );
  if (failed) {
    return { error: "Invalid email or password." };
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  redirect(user ? roleHome(user.role) : "/dashboard");
}
