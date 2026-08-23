import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { generateReceiptPdf } from "@/lib/receipts";

// Shared by the webhook handlers (source of truth) and the browser
// callback redirect (instant-UX best effort). Idempotent: a Payment
// already in SUCCESS is a no-op, so duplicate webhook deliveries and a
// callback racing the webhook are both safe (TRD §5 "idempotent handling
// of duplicate webhook deliveries").
export async function completeSuccessfulPayment(reference: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment || payment.status === "SUCCESS") return;

  const [user, course] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: payment.userId } }),
    prisma.course.findUniqueOrThrow({ where: { id: payment.courseId } }),
  ]);

  const pdf = await generateReceiptPdf({
    reference: payment.reference,
    courseTitle: course.title,
    studentName: user.name,
    amountKobo: payment.amountKobo,
    paidAt: new Date(),
  });
  const receiptUrl = await uploadFile(`receipts/${payment.id}.pdf`, pdf, "application/pdf");

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", receiptUrl },
    }),
    prisma.enrollment.upsert({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
        paymentId: payment.id,
      },
      update: { status: "ACTIVE", paymentId: payment.id },
    }),
  ]);
}
