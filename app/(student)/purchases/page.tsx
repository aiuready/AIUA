import { auth } from "@/auth";
import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";

// Transaction list: course, amount, status, date, receipt link. Failed
// items show a Retry action (Webflow §5.4).
export default async function PurchasesPage() {
  await requireRole(["STUDENT"]);
  const session = await auth();

  const payments = await prisma.payment.findMany({
    where: { userId: session!.user.id },
    include: { enrollment: { include: { course: { select: { title: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  // Payment doesn't carry a direct course relation - look courses up
  // separately for rows where the enrollment link hasn't been made yet
  // (e.g. still PENDING/FAILED, no Enrollment exists).
  const courseIds = [...new Set(payments.map((p) => p.courseId))];
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true },
  });
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-10 sm:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No purchases yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-col gap-1 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {courseTitleById.get(p.courseId) ?? "Course"}
                </span>
                <span className="text-sm font-medium">{formatNaira(p.amountKobo)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {p.provider} · {p.status} · {p.createdAt.toISOString().slice(0, 10)}
                {p.attempts > 1 ? ` · ${p.attempts} attempts` : ""}
              </span>

              <div className="mt-2 flex gap-3">
                {p.receiptUrl && (
                  <a
                    href={p.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-foreground underline"
                  >
                    Receipt
                  </a>
                )}
                {(p.status === "FAILED" || p.status === "PENDING") && (
                  <form action="/api/payments/retry" method="POST">
                    <input type="hidden" name="paymentId" value={p.id} />
                    <button type="submit" className="text-sm font-medium text-foreground underline">
                      Retry
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
