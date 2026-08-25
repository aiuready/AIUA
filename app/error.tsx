"use client";

// Root error boundary (Webflow §8: "never a blank page on failure").
// Error boundaries must be Client Components in the App Router.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.digest ? `Error ref: ${error.digest}` : "Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </main>
  );
}
