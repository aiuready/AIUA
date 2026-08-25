"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";

// Instructors' own path to log in. Deliberately NOT under the
// (instructor)-role-gated route group - this page must be reachable
// while signed out. Reuses the exact same loginAction as the general
// /login (it already redirects by role), so an instructor logging in
// here still lands on /instructor either way; this route exists purely
// as their own discoverable, branded entry point since instructor
// accounts are never created via public signup.
export default function InstructorLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  const searchParams = useSearchParams();
  const deactivated = searchParams.get("deactivated") === "1";

  return (
    <AuthCard
      title="Instructor login"
      description="Instructor accounts are created by an admin - reach out if you need one."
      footer={
        <Link href="/reset" className="font-medium text-primary hover:underline">
          Forgot your password?
        </Link>
      }
    >
      {deactivated && (
        <p className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          Your account has been deactivated. Contact an admin for help.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        {/* No hardcoded callbackUrl - loginAction already falls back to
            roleHome(role), which correctly sends an instructor to
            /instructor without assuming everyone who lands on this page
            actually has that role. */}
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <button type="submit" disabled={pending} className={buttonVariants({ className: "w-full" })}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}
