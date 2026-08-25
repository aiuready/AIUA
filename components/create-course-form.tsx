"use client";

import { useActionState } from "react";
import type { School } from "@prisma/client";
import { createCourseAction, type CreateCourseState } from "@/app/(instructor)/instructor/actions";

export function CreateCourseForm({
  schools,
  labels,
}: {
  schools: School[];
  labels: Record<School, string>;
}) {
  const [state, formAction, pending] = useActionState<CreateCourseState, FormData>(
    createCourseAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Title
        <input
          name="title"
          required
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        School
        <select
          name="school"
          required
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
        >
          {schools.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Price (NGN)
        <input
          name="priceNaira"
          type="number"
          min={0}
          step="1"
          required
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Description
        <textarea
          name="description"
          required
          rows={3}
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Outcomes
        <textarea
          name="outcomes"
          required
          rows={2}
          className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
        />
      </label>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating…" : "Create course (draft)"}
      </button>
    </form>
  );
}
