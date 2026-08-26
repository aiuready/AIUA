import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyVerifyEmailToken } from "@/lib/reset-token";

// GET /api/verify-email/[token] - the link from the verification email.
// A mutating GET (same pattern as app/api/payments/callback) since this
// is a one-click email link, not a form.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const verified = verifyVerifyEmailToken(token);
  const session = await auth();
  const dest = session?.user ? "/dashboard" : "/login";

  if (!verified) {
    return NextResponse.redirect(new URL(`${dest}?verifyEmail=invalid`, req.url));
  }

  await prisma.user.updateMany({
    where: { email: verified.email },
    data: { emailVerifiedAt: new Date() },
  });

  return NextResponse.redirect(new URL(`${dest}?verified=1`, req.url));
}
