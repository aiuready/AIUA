import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, no-login certificate verification (PRD §3.6, Webflow §3.4).
// GET /api/certificates/verify?id=<verificationId>
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { verificationId: id },
    include: { user: true, course: true },
  });

  if (!certificate) {
    return NextResponse.json({ status: "NOT_FOUND" });
  }

  if (certificate.status === "REVOKED") {
    return NextResponse.json({ status: "REVOKED" });
  }

  return NextResponse.json({
    status: "VALID",
    holder: certificate.user.name,
    course: certificate.course.title,
    issuedAt: certificate.issuedAt,
  });
}
