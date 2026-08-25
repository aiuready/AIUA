import type { PaymentProvider } from "@prisma/client";

// PRD §3.3: "Student picks at checkout, or platform routes by
// availability." The provider is an implementation detail, not something
// a learner should have to weigh in on - default to Paystack, fall back
// to Flutterwave only if Paystack isn't configured. Returns null when
// neither gateway is configured (e.g. local dev) so the caller can fail
// gracefully instead of calling an API with an empty key.
export function selectPaymentProvider(): PaymentProvider | null {
  if (process.env.PAYSTACK_SECRET_KEY) return "PAYSTACK";
  if (process.env.FLUTTERWAVE_SECRET_KEY) return "FLUTTERWAVE";
  return null;
}
