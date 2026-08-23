import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Flutterwave webhook. Signature-verified (TRD §3, §5) via the verif-hash
// header, compared against FLUTTERWAVE_WEBHOOK_SECRET. Handling must be
// idempotent - duplicate deliveries of the same event should not
// double-apply an enrollment.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash");

  if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = await req.json();

  if (event.event === "charge.completed" && event.data?.status === "successful") {
    const reference = event.data?.tx_ref as string | undefined;
    if (reference) {
      await prisma.payment.updateMany({
        where: { reference, status: "PENDING" },
        data: { status: "SUCCESS" },
      });
      // TODO: create/activate the Enrollment linked to this payment,
      // generate the receipt, and trigger access grant. See
      // docs/DATABASE_SCHEMA.md §3.2-3.3.
    }
  }

  return NextResponse.json({ received: true });
}
