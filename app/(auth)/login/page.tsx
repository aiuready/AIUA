"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormField } from "@/components/form-field";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <FormField label="Email" name="email" type="email" autoComplete="email" />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="flex flex-col gap-1 text-sm text-neutral-600">
        <Link href="/reset" className="font-medium text-neutral-900 underline">
          Forgot your password?
        </Link>
        <p>
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
