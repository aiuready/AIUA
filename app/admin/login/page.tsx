"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";

// Admin's own path to log in - same pattern as /instructor/login
// (deliberately outside the (admin)-role-gated route group, since this
// must be reachable while signed out; reuses the exact loginAction, which
// already redirects by role). Unlike /instructor/login, this one is NOT
// linked from anywhere public (no footer link, no nav) - advertising an
// admin entry point to every visitor is its own risk, not just a UX
// question, so this is reachable only by whoever already has the URL.
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  const searchParams = useSearchParams();
  const deactivated = searchParams.get("deactivated") === "1";

  return (
    <AuthCard
      title="Admin login"
      footer={
        <Link href="/reset" className="font-medium text-primary hover:underline">
          Forgot your password?
        </Link>
      }
    >
      {deactivated && (
        <p className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          Your account has been deactivated. Contact another admin for help.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
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
