export function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        defaultValue={defaultValue}
        className="rounded-lg border border-border px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}
