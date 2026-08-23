"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/form-field";
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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-neutral-600">
          If an account exists for that address, a reset link is on its way. It
          expires in 1 hour.
        </p>
        <Link href="/login" className="text-sm font-medium text-neutral-900 underline">
          Back to log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Enter your email and we&rsquo;ll send you a reset link.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <FormField label="Email" name="email" type="email" autoComplete="email" />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </main>
  );
}
