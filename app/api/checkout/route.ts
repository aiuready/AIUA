import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
import { initializeFlutterwavePayment } from "@/lib/payments/flutterwave";
import { selectPaymentProvider } from "@/lib/payments/select-provider";

// POST /api/checkout - form target from the course detail Enroll CTA.
// Creates a PENDING Payment and redirects to the chosen gateway's hosted
// checkout. Payment is never marked successful here - only the webhook
// (and, best-effort, the callback route) does that (TRD §2).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "only students can enroll" }, { status: 403 });
  }

  const formData = await req.formData();
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    return NextResponse.json({ error: "course not available" }, { status: 404 });
  }

  // The Enroll button doesn't ask which gateway to use - that's an
  // implementation detail, not a learner decision (PRD §3.3: "platform
  // routes by availability"). An explicit `provider` field still works if
  // ever sent (e.g. an internal test tool), but nothing student-facing
  // sends one anymore.
  const requestedProvider = String(formData.get("provider") ?? "");
  const provider =
    requestedProvider === "PAYSTACK" || requestedProvider === "FLUTTERWAVE"
      ? requestedProvider
      : selectPaymentProvider();
  if (!provider) {
    return NextResponse.redirect(
      new URL(`/courses/${course.slug}?checkout=unavailable`, req.url),
      303
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing && existing.status !== "REVOKED") {
    return NextResponse.redirect(new URL(`/learn/${course.slug}`, req.url), 303);
  }

  const reference = `aiua_${course.slug}_${session.user.id}_${Date.now()}`;
  const callbackUrl = new URL(`/api/payments/callback`, req.url).toString();

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      courseId,
      provider,
      amountKobo: course.priceKobo,
      reference,
      status: "PENDING",
    },
  });

  try {
    const { authorizationUrl } =
      provider === "PAYSTACK"
        ? await initializePaystackTransaction({
            email: session.user.email!,
            amountKobo: course.priceKobo,
            reference,
            callbackUrl,
          })
        : await initializeFlutterwavePayment({
            email: session.user.email!,
            name: session.user.name ?? "",
            amountKobo: course.priceKobo,
            reference,
            callbackUrl,
          });
    return NextResponse.redirect(authorizationUrl, 303);
  } catch (err) {
    console.error("checkout initialize failed:", err);
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.redirect(
      new URL(`/courses/${course.slug}?checkout=error`, req.url),
      303
    );
  }
}
