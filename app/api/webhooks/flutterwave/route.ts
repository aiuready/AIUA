import { NextRequest, NextResponse } from "next/server";
import { completeSuccessfulPayment } from "@/lib/payments/complete-payment";

// Flutterwave webhook. Signature-verified (TRD §3, §5) via the verif-hash
// header, compared against FLUTTERWAVE_WEBHOOK_SECRET. Handling is
// idempotent - completeSuccessfulPayment no-ops if the Payment is already
// SUCCESS, so duplicate deliveries are safe.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");

  if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = await req.json();

  if (event.event === "charge.completed" && event.data?.status === "successful") {
    const reference = event.data?.tx_ref as string | undefined;
    if (reference) {
      await completeSuccessfulPayment(reference);
    }
  }

  return NextResponse.json({ received: true });
}
