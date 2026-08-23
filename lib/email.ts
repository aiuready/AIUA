// Email-send abstraction. The TRD's environment-variable baseline (§6) has
// no email provider entry - that's a real gap against PRD §3.1's
// "password reset by email" requirement, not an oversight here. This
// falls back to a console log when RESEND_API_KEY isn't set, so dev/local
// work end to end without a provider; wire a real key before go-live.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:dev-stub] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "AIUA <no-reply@aiua.africa>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error("sendEmail failed:", await res.text());
  }
}
