export function PagePlaceholder({
  title,
  route,
  access,
  note,
}: {
  title: string;
  route: string;
  access: "Public" | "Auth" | "Student" | "Instructor" | "Admin";
  note: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 px-4 py-10 sm:max-w-2xl">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {access} · {route}
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-neutral-600">{note}</p>
    </main>
  );
}
