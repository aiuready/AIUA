import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { initializeFlutterwavePayment } from "@/lib/payments/flutterwave";

// POST /api/payments/retry - reuses the same Payment row and course
// context, incrementing `attempts` rather than creating a new enrollment
// (PRD §3.3 "failed-payment retry ... without re-enrolling",
// DATABASE_SCHEMA §3.2). Only the payment's own owner may retry it.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }

  const formData = await req.formData();
  const paymentId = String(formData.get("paymentId") ?? "");
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (payment.status === "SUCCESS") {
    return NextResponse.json({ error: "already paid" }, { status: 400 });
  }

  const course = await prisma.course.findUniqueOrThrow({ where: { id: payment.courseId } });
  const callbackUrl = new URL(`/api/payments/callback`, req.url).toString();

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PENDING", attempts: { increment: 1 } },
  });

  // Re-initializing with the same `reference` assumes the gateway allows
  // reuse on a non-successful prior attempt (true for Paystack/Flutterwave
  // in practice - only an already-successful reference is rejected). This
  // is the schema-faithful reading of "retried by incrementing attempts on
  // the same course context" (DATABASE_SCHEMA §3.2): one Payment row, one
  // reference, across every attempt. Revisit if a gateway rejects reuse.
  try {
    const { authorizationUrl } =
      payment.provider === "PAYSTACK"
        ? await initializePaystackTransaction({
            email: session.user.email!,
            amountKobo: payment.amountKobo,
            reference: payment.reference,
            callbackUrl,
          })
        : await initializeFlutterwavePayment({
            email: session.user.email!,
            name: session.user.name ?? "",
            amountKobo: payment.amountKobo,
            reference: payment.reference,
            callbackUrl,
          });
    return NextResponse.redirect(authorizationUrl, 303);
  } catch (err) {
    console.error("payment retry initialize failed:", err);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.redirect(
      new URL(`/courses/${course.slug}?checkout=error`, req.url),
      303
    );
  }
}
