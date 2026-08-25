// Root loading boundary (Webflow §8: "Loading and error states on every
// data screen"). Route-specific loading.tsx files can override this per
// segment later; this is the baseline so no route is ever a blank page
// while its server component awaits data.
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
        Loading…
      </div>
    </main>
  );
}
