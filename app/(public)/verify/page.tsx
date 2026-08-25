"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

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
    <main className="py-14 sm:py-20">
      <Container className="flex max-w-md flex-col items-center gap-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck size={28} />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Verify a certificate
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">No login required.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Verification ID
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <button type="submit" disabled={loading} className={buttonVariants({ className: "w-full" })}>
            {loading ? "Checking…" : "Verify"}
          </button>
        </form>

        {result?.status === "VALID" && (
          <div className="w-full rounded-lg bg-success/10 px-4 py-3 text-left text-sm text-success">
            <p className="font-semibold">Valid certificate</p>
            <p>Holder: {result.holder}</p>
            <p>Course: {result.course}</p>
            <p>Issued: {new Date(result.issuedAt).toISOString().slice(0, 10)}</p>
          </div>
        )}
        {result?.status === "REVOKED" && (
          <p className="w-full rounded-lg bg-destructive/10 px-4 py-3 text-left text-sm text-destructive">
            This certificate has been revoked and is no longer valid.
          </p>
        )}
        {result?.status === "NOT_FOUND" && (
          <p className="w-full rounded-lg bg-muted px-4 py-3 text-left text-sm text-muted-foreground">
            No certificate found for that ID.
          </p>
        )}
      </Container>
    </main>
  );
}
