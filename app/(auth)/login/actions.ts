"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
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
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // signIn(..., { redirect: false }) is documented to return the callback
  // URL as a string with an "error" query param on a failed attempt - but
  // in practice (confirmed via a real Playwright run, not just reading the
  // docs) a bad credentials attempt THROWS a CredentialsSignin instead when
  // called this way from a Server Action. Both paths are handled: the
  // thrown case is the one that actually happens; the URL-param check
  // stays as a defensive fallback in case that ever changes.
  let redirectUrl: string | undefined;
  try {
    redirectUrl = await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
  const failed =
    typeof redirectUrl === "string" &&
    new URL(redirectUrl, process.env.NEXTAUTH_URL ?? "http://localhost:3000").searchParams.get(
      "error"
    );
  if (failed) {
    return { error: "Invalid email or password." };
  }

  // Only ever redirect to a same-origin relative path - never trust an
  // absolute/external callbackUrl (open-redirect guard).
  const safeCallback = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//");

  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  redirect(safeCallback ? callbackUrl : user ? roleHome(user.role) : "/dashboard");
}
