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
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
        Title
        <input
          name="title"
          required
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
        School
        <select
          name="school"
          required
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
        >
          {schools.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
        Price (NGN)
        <input
          name="priceNaira"
          type="number"
          min={0}
          step="1"
          required
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
        Description
        <textarea
          name="description"
          required
          rows={3}
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
        Outcomes
        <textarea
          name="outcomes"
          required
          rows={2}
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating…" : "Create course (draft)"}
      </button>
    </form>
  );
}
