"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { AuthCard } from "@/components/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { signupAction, type SignupState } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signupAction,
    undefined
  );

  return (
    <AuthCard
      title="Create your account"
      description="Role defaults to student."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <FormField label="Name" name="name" autoComplete="name" />
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
        />

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <button type="submit" disabled={pending} className={buttonVariants({ className: "w-full" })}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
