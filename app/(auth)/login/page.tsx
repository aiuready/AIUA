"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";
  const deactivated = searchParams.get("deactivated") === "1";
  const verified = searchParams.get("verified") === "1";
  const verifyEmailInvalid = searchParams.get("verifyEmail") === "invalid";

  return (
    <AuthCard
      title="Log in"
      footer={
        <div className="flex flex-col gap-1">
          <Link href="/reset" className="font-medium text-primary hover:underline">
            Forgot your password?
          </Link>
          <p>
            Need an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      }
    >
      {deactivated && (
        <p className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          Your account has been deactivated. Contact an admin for help.
        </p>
      )}
      {verified && (
        <p className="mb-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Email verified. Log in to continue.
        </p>
      )}
      {verifyEmailInvalid && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          That verification link is invalid or has expired. Log in and resend it from your dashboard.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
