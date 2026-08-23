import { prisma } from "@/lib/prisma";
import { issueCertificateIfNeeded } from "@/lib/certificates";

// Recompute Enrollment.percent from ModuleProgress rows (DATABASE_SCHEMA
// §3.4: "Enrollment.percent ... derived from ModuleProgress rows"). Marks
// the enrollment COMPLETED and issues a certificate at 100%.
export async function recomputeEnrollmentProgress(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
  });

  const [totalModules, completedModules] = await Promise.all([
    prisma.module.count({ where: { courseId: enrollment.courseId } }),
    prisma.moduleProgress.count({ where: { enrollmentId, completed: true } }),
  ]);

  const percent = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);
  const isComplete = percent >= 100;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      percent,
      status: isComplete ? "COMPLETED" : enrollment.status,
      completedAt: isComplete ? (enrollment.completedAt ?? new Date()) : enrollment.completedAt,
    },
  });

  if (isComplete) {
    await issueCertificateIfNeeded(enrollment.userId, enrollment.courseId);
  }
}
