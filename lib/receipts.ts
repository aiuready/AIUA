import { PDFDocument, StandardFonts } from "pdf-lib";
import { formatNaira } from "@/lib/money";

// One-page payment receipt (PRD §3.3: "Every payment produces a
// receipt/invoice record retrievable by student and admin").
export async function generateReceiptPdf(opts: {
  reference: string;
  courseTitle: string;
  studentName: string;
  amountKobo: number;
  paidAt: Date;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 400]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 340;
  page.drawText("AI University Africa", { x: 40, y, size: 20, font: bold });
  y -= 28;
  page.drawText("Payment Receipt", { x: 40, y, size: 13, font });
  y -= 40;

  const rows: [string, string][] = [
    ["Reference", opts.reference],
    ["Student", opts.studentName],
    ["Course", opts.courseTitle],
    ["Amount", formatNaira(opts.amountKobo)],
    ["Date", opts.paidAt.toISOString().slice(0, 10)],
  ];
  for (const [label, value] of rows) {
    page.drawText(`${label}:`, { x: 40, y, size: 11, font: bold });
    page.drawText(value, { x: 170, y, size: 11, font });
    y -= 24;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
