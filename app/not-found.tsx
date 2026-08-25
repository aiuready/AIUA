import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or isn&rsquo;t available.
      </p>
      <Link href="/" className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
        Go home
      </Link>
    </main>
  );
}
