"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { confirmResetAction, type ResetConfirmState } from "@/app/(auth)/reset/actions";

export function ResetConfirmForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetConfirmState, FormData>(
    confirmResetAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <FormField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
