import crypto from "node:crypto";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

async function generateCertificatePdf(opts: {
  studentName: string;
  courseTitle: string;
  verificationId: string;
  issuedAt: Date;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawText("AI University Africa", { x: 60, y: 500, size: 22, font: bold });
  page.drawText("Certificate of Completion", { x: 60, y: 470, size: 16, font });
  page.drawText("This certifies that", { x: 60, y: 420, size: 12, font });
  page.drawText(opts.studentName, { x: 60, y: 390, size: 26, font: bold });
  page.drawText("has successfully completed", { x: 60, y: 350, size: 12, font });
  page.drawText(opts.courseTitle, { x: 60, y: 320, size: 20, font: bold });
  page.drawText(`Issued: ${opts.issuedAt.toISOString().slice(0, 10)}`, {
    x: 60,
    y: 260,
    size: 11,
    font,
  });
  page.drawText(`Verification ID: ${opts.verificationId}`, { x: 60, y: 240, size: 11, font });
  page.drawText("Verify at /verify — no login required.", { x: 60, y: 220, size: 10, font });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

// Triggered when Enrollment.percent reaches 100 (PRD §3.6). Idempotent:
// skips if a VALID certificate already exists for this user+course.
export async function issueCertificateIfNeeded(userId: string, courseId: string): Promise<void> {
  const existing = await prisma.certificate.findFirst({
    where: { userId, courseId, status: "VALID" },
  });
  if (existing) return;

  const [user, course] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.course.findUniqueOrThrow({ where: { id: courseId } }),
  ]);

  const verificationId = crypto.randomBytes(9).toString("base64url");
  const issuedAt = new Date();

  const pdf = await generateCertificatePdf({
    studentName: user.name,
    courseTitle: course.title,
    verificationId,
    issuedAt,
  });
  const pdfUrl = await uploadFile(`certificates/${verificationId}.pdf`, pdf, "application/pdf");

  await prisma.certificate.create({
    data: { userId, courseId, verificationId, pdfUrl, status: "VALID", issuedAt },
  });
}
