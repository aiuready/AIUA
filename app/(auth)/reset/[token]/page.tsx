import { ResetConfirmForm } from "@/components/reset-confirm-form";

export default async function ResetConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      </div>
      <ResetConfirmForm token={token} />
    </main>
  );
}
