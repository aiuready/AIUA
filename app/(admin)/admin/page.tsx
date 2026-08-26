import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import {
  setCourseStatusAction,
  toggleUserActiveAction,
  refundPaymentAction,
  revokeCertificateAction,
  issueCertificateAction,
  createInstructorAction,
  approveAnnouncementAction,
  rejectAnnouncementAction,
  deleteAnnouncementAdminAction,
  createAdminAnnouncementAction,
} from "./actions";

// Admin dashboard (Webflow §7): courses, users, payments, certificates,
// reporting. Single route per the Webflow route map - sectioned with
// anchors rather than sub-routes.
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    saved?: string;
    error?: string;
    instructorCreated?: string;
    setupLink?: string;
  }>;
}) {
  await requireRole(["ADMIN"]);
  const { q, saved, error, instructorCreated, setupLink } = await searchParams;

  const [revenue, activeEnrollments, courseCount, userCount] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amountKobo: true } }),
    prisma.enrollment.count({ where: { status: { in: ["ACTIVE", "COMPLETED"] } } }),
    prisma.course.count(),
    prisma.user.count(),
  ]);

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { instructor: { select: { name: true } } },
  });

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });
  const courseTitleById = new Map(
    (
      await prisma.course.findMany({
        where: { id: { in: [...new Set(payments.map((p) => p.courseId))] } },
        select: { id: true, title: true },
      })
    ).map((c) => [c.id, c.title])
  );

  const certificates = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });

  // "No certificate for this exact user+course" isn't a single clean
  // Prisma relation filter (a course-level `certificates: none` would
  // wrongly exclude a completed enrollment just because some *other*
  // student on the same course has a certificate) - filter in application
  // code against the certificates already loaded above instead.
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { status: "COMPLETED" },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });
  const certifiedPairs = new Set(certificates.map((c) => `${c.userId}:${c.courseId}`));
  const missingCertificates = completedEnrollments.filter(
    (e) => !certifiedPairs.has(`${e.userId}:${e.courseId}`)
  );

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } }, course: { select: { title: true } } },
  });
  const pendingAnnouncements = announcements.filter((a) => a.status === "PENDING");

  const publishedCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-4 py-10 sm:max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      {saved === "1" && <p className="text-sm text-success">Saved.</p>}
      {error === "self" && (
        <p className="text-sm text-destructive">You can&rsquo;t deactivate your own account.</p>
      )}
      {error === "instructor" && (
        <p className="text-sm text-destructive">Enter a valid name and email for the instructor.</p>
      )}
      {error === "instructor-exists" && (
        <p className="text-sm text-destructive">An account with that email already exists.</p>
      )}
      {error === "announcement" && (
        <p className="text-sm text-destructive">Title and message are both required.</p>
      )}
      {instructorCreated === "1" && setupLink && (
        <div className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <p>Instructor account created. Setup email sent (or logged to the server console in dev).</p>
          <p className="mt-1 break-all">
            Share this one-time setup link if needed (expires in 1 hour):{" "}
            <a href={setupLink} className="underline">
              {setupLink}
            </a>
          </p>
        </div>
      )}

      <nav className="flex flex-wrap gap-4 text-sm font-medium underline">
        <a href="#reporting">Reporting</a>
        <a href="#courses">Courses</a>
        <a href="#users">Users</a>
        <a href="#announcements">
          Announcements{pendingAnnouncements.length > 0 ? ` (${pendingAnnouncements.length})` : ""}
        </a>
        <a href="#payments">Payments</a>
        <a href="#certificates">Certificates</a>
      </nav>

      {/* --- Reporting --- */}
      <section id="reporting" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reporting</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Revenue" value={formatNaira(revenue._sum.amountKobo ?? 0)} />
          <Stat label="Active enrollments" value={String(activeEnrollments)} />
          <Stat label="Courses" value={String(courseCount)} />
          <Stat label="Users" value={String(userCount)} />
        </div>
      </section>

      {/* --- Courses --- */}
      <section id="courses" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Courses ({courses.length})
        </h2>
        <div className="flex flex-col gap-2">
          {courses.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.instructor.name} · {formatNaira(c.priceKobo)}
                </p>
              </div>
              <form action={setCourseStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="courseId" value={c.id} />
                <select name="status" defaultValue={c.status} className="rounded-lg border border-border px-3 py-2 text-xs">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
                  Update
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* --- Users --- */}
      <section id="users" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Users ({users.length})
        </h2>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
            Search
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {u.name} {!u.isActive && <span className="text-destructive">(deactivated)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.email} · {u.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleUserActiveAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form
          action={createInstructorAction}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4"
        >
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Create instructor account
          </p>
          <p className="text-xs text-muted-foreground">
            Instructors don&rsquo;t sign up themselves - only an admin can
            create their account. They&rsquo;ll set their own password via a
            one-time link, then log in at{" "}
            <span className="font-medium">/instructor/login</span>.
          </p>
          <input
            name="name"
            placeholder="Full name"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-fit rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            Create instructor
          </button>
        </form>
      </section>

      {/* --- Announcements --- */}
      <section id="announcements" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Announcements
        </h2>

        {pendingAnnouncements.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-accent-hover">
              Pending your approval ({pendingAnnouncements.length})
            </p>
            {pendingAnnouncements.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-lg border border-accent/40 bg-accent/5 p-3">
                <p className="text-sm font-medium">
                  {a.title} — {a.course?.title ?? "Platform-wide"}
                </p>
                <p className="text-xs text-muted-foreground">by {a.author.name}</p>
                <p className="text-sm text-foreground/80">{a.message}</p>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    {a.link}
                  </a>
                )}
                <div className="mt-1 flex gap-2">
                  <form action={approveAnnouncementAction}>
                    <input type="hidden" name="announcementId" value={a.id} />
                    <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                      Approve
                    </button>
                  </form>
                  <form action={rejectAnnouncementAction}>
                    <input type="hidden" name="announcementId" value={a.id} />
                    <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-destructive">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            All announcements ({announcements.length})
          </p>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {a.title} — {a.course?.title ?? "Platform-wide"}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      a.status === "APPROVED"
                        ? "text-success"
                        : a.status === "REJECTED"
                          ? "text-destructive"
                          : "text-accent-hover"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">by {a.author.name}</p>
                <form action={deleteAnnouncementAdminAction}>
                  <input type="hidden" name="announcementId" value={a.id} />
                  <button type="submit" className="w-fit text-xs text-destructive underline">
                    Delete
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

        <form
          action={createAdminAnnouncementAction}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4"
        >
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Post an announcement (auto-approved)
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Course
            <select name="courseId" className="rounded-lg border border-border px-3 py-2 text-sm" defaultValue="">
              <option value="">Platform-wide (all students)</option>
              {publishedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <input
            name="title"
            placeholder="Title"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <textarea
            name="message"
            placeholder="Message"
            required
            rows={3}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            name="link"
            placeholder="Link (optional)"
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-fit rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            Post announcement
          </button>
        </form>
      </section>

      {/* --- Payments --- */}
      <section id="payments" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Payments (latest {payments.length})
        </h2>
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {p.user.name} — {courseTitleById.get(p.courseId) ?? "Course"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNaira(p.amountKobo)} · {p.provider} · {p.status} ·{" "}
                  {p.createdAt.toISOString().slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.receiptUrl && (
                  <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-xs font-medium underline">
                    Receipt
                  </a>
                )}
                {p.status === "SUCCESS" && (
                  <form action={refundPaymentAction}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
                      Refund
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Certificates --- */}
      <section id="certificates" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Certificates ({certificates.length})
        </h2>
        <div className="flex flex-col gap-2">
          {certificates.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {c.user.name} — {c.course.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.verificationId} · {c.status} · {c.issuedAt.toISOString().slice(0, 10)}
                </p>
              </div>
              {c.status === "VALID" && (
                <form action={revokeCertificateAction}>
                  <input type="hidden" name="certificateId" value={c.id} />
                  <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-destructive">
                    Revoke
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        {missingCertificates.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Completed but missing a certificate
            </p>
            {missingCertificates.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent/5 p-3">
                <span className="text-sm">
                  {e.user.name} — {e.course.title}
                </span>
                <form action={issueCertificateAction}>
                  <input type="hidden" name="userId" value={e.userId} />
                  <input type="hidden" name="courseId" value={e.courseId} />
                  <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium">
                    Issue
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
