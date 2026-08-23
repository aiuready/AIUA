import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave";
import { completeSuccessfulPayment } from "@/lib/payments/complete-payment";

// GET /api/payments/callback - the browser lands here after the gateway's
// hosted checkout. This is best-effort instant UX only; the webhook is the
// durable source of truth per TRD §2 ("the client never marks a payment
// successful") - this route calls the *server-side* verify API before
// doing anything, it doesn't trust gateway query params on their own.
export async function GET(req: NextRequest) {
  const reference =
    req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("tx_ref");
  const transactionId = req.nextUrl.searchParams.get("transaction_id");

  if (reference) {
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (payment && payment.status === "PENDING") {
      try {
        const verified =
          payment.provider === "PAYSTACK"
            ? await verifyPaystackTransaction(reference)
            : await verifyFlutterwaveTransaction(transactionId ?? reference);
        if (verified.success) {
          await completeSuccessfulPayment(reference);
        }
      } catch (err) {
        console.error("payment callback verify failed:", err);
      }
    }
  }

  return NextResponse.redirect(new URL("/purchases", req.url));
}
