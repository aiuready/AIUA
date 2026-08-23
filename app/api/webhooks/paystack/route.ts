import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { completeSuccessfulPayment } from "@/lib/payments/complete-payment";

// Paystack webhook. Signature-verified (TRD §3, §5) via the
// x-paystack-signature header, HMAC-SHA512 over the raw body using
// PAYSTACK_SECRET_KEY. Handling is idempotent - completeSuccessfulPayment
// no-ops if the Payment is already SUCCESS, so duplicate deliveries are safe.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference as string | undefined;
    if (reference) {
      await completeSuccessfulPayment(reference);
    }
  }

  return NextResponse.json({ received: true });
}
