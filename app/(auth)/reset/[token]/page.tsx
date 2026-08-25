import { AuthCard } from "@/components/auth-card";
import { ResetConfirmForm } from "@/components/reset-confirm-form";

export default async function ResetConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthCard title="Set a new password">
      <ResetConfirmForm token={token} />
    </AuthCard>
  );
}
