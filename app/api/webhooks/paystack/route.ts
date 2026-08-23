import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Paystack webhook. Signature-verified (TRD §3, §5) via the
// x-paystack-signature header, HMAC-SHA512 over the raw body using
// PAYSTACK_SECRET_KEY. Handling must be idempotent - duplicate deliveries
// of the same event should not double-apply an enrollment.
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
      // Idempotent: only flips PENDING -> SUCCESS, a second delivery of the
      // same event is a no-op because the row is already SUCCESS.
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
