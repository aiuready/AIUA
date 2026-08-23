"use client";

import { useState } from "react";

type Result =
  | { status: "VALID"; holder: string; course: string; issuedAt: string }
  | { status: "REVOKED" }
  | { status: "NOT_FOUND" }
  | null;

// No-login certificate ID lookup (Webflow §3.4, PRD §3.6).
export default function VerifyPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(id)}`);
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verify a certificate</h1>
        <p className="mt-1 text-sm text-neutral-600">No login required.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
          Verification ID
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Checking…" : "Verify"}
        </button>
      </form>

      {result?.status === "VALID" && (
        <div className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-900">
          <p className="font-semibold">Valid certificate</p>
          <p>Holder: {result.holder}</p>
          <p>Course: {result.course}</p>
          <p>Issued: {new Date(result.issuedAt).toISOString().slice(0, 10)}</p>
        </div>
      )}
      {result?.status === "REVOKED" && (
        <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-900">
          This certificate has been revoked and is no longer valid.
        </p>
      )}
      {result?.status === "NOT_FOUND" && (
        <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          No certificate found for that ID.
        </p>
      )}
    </main>
  );
}
