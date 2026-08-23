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
    <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-800">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        defaultValue={defaultValue}
        className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none"
      />
    </label>
  );
}
