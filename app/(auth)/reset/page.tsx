"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { requestResetAction, type ResetRequestState } from "./actions";

// Email -> sent-confirmation state (Webflow §4). Confirm step lives at
// /reset/[token], reached via the emailed link.
export default function ResetPage() {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(
    requestResetAction,
    undefined
  );

  if (state?.sent) {
    return (
      <AuthCard title="Check your email">
        <p className="text-sm text-muted-foreground">
          If an account exists for that address, a reset link is on its way. It
          expires in 1 hour.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Enter your email and we'll send you a reset link.">
      <form action={formAction} className="flex flex-col gap-4">
        <FormField label="Email" name="email" type="email" autoComplete="email" />

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <button type="submit" disabled={pending} className={buttonVariants({ className: "w-full" })}>
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
