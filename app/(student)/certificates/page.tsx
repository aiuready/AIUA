import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";

export default async function StudentCertificatesPage() {
  await requireRole(["STUDENT"]);
  const session = await auth();

  const certificates = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-10 sm:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">My certificates</h1>

      {certificates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No certificates yet — complete a course to earn one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col gap-1 rounded-lg border border-border p-4"
            >
              <span className="text-sm font-semibold">{cert.course.title}</span>
              <span className="text-xs text-muted-foreground">
                Issued {cert.issuedAt.toISOString().slice(0, 10)}
                {cert.status === "REVOKED" ? " — REVOKED" : ""}
              </span>
              <span className="text-xs text-muted-foreground">ID: {cert.verificationId}</span>
              {cert.status === "VALID" && (
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-sm font-medium text-foreground underline"
                >
                  Download PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
