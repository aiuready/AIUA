# AIUA Phase 2 — Remaining work

Tracks everything left after the initial scaffold (commit `7783461`). Checked
off in commit order as each is finished for real (not just stubbed) and
verified (build/lint/manual check). Unchecked = not started.

**Since this file's last full pass**, several more things landed that
predate its phase structure below (see git log for exact commits):
a full design system + marketing site (shared header/footer, `components/ui/*`,
brand tokens in `globals.css`, expanded home/about/courses pages) applied
across the whole product; a real production bug fix (Auth.js `trustHost`
was missing, breaking every sign-in/session read under `next start` -
confirmed via server logs and fixed); the course-detail Enroll CTA
was simplified to a single "Enroll now" button with server-side gateway
auto-selection (`lib/payments/select-provider.ts`) instead of exposing
Paystack/Flutterwave as a learner-facing choice; a `/profile` page (PRD §3.1);
and a full Playwright E2E suite (`e2e/`, `npm run test:e2e`) that drove
every major flow through a real browser for the first time and found four
more real bugs, all fixed:

- **Login/signup crashed on any `signIn()` failure.** `CredentialsSignin`
  throws from a Server Action call rather than returning a URL with an
  `error` param as the (misleading) docs suggest - a wrong password
  crashed straight to the generic error boundary instead of showing
  "Invalid email or password." Fixed in both `login/actions.ts` and
  `signup/actions.ts` with a proper try/catch on `AuthError`.
- **Server Actions default to a 1MB body limit**, silently 413-ing any
  profile photo upload between 1-2MB even though the app's own validation
  advertised a 2MB cap. Raised via `experimental.serverActions.bodySizeLimit`
  in `next.config.ts`.
- **`next start` (Turbopack production mode) doesn't serve files written
  to `public/` after the server starts** - certs/receipts generated at
  runtime 404'd. Moved the local dev-storage fallback out of `public/`
  entirely into `.local-uploads/`, served via a dedicated
  `app/api/uploads/[...path]/route.ts` instead of relying on Next's
  static handling. Real deployments (Spaces) were never affected.
- **Mobile nav menu had no backdrop scrim** and visually collided with
  the hero content beneath it - only visible by actually screenshotting
  the open menu, not from reading the code. Root cause: the header's
  `backdrop-blur` creates a new CSS containing block for `position:fixed`
  descendants, trapping the scrim inside the header's own ~64px box.
  Fixed by portaling the whole mobile nav dropdown to `document.body`.

All 33 E2E tests pass against the real running app + real MySQL dev DB
(not mocked). See `e2e/*.spec.ts`; screenshots land in `e2e/screenshots/`
(gitignored, regenerate with `npm run test:e2e`).

## 0. Dev environment / infra

- [x] Local MySQL 8 dev DB (Docker, mirrors prod engine) — `docker-compose.yml`, `aiua_mysql` container
- [x] `.env` wired to local DB, `prisma migrate dev` run, tables exist — migration `20260823221604_init`
- [x] Seed script: 1 admin, 1 instructor, 1 student, 3 published courses w/ modules+quiz — `prisma/seed.ts`, `npm run seed`
- [ ] `lib/storage.ts` — Spaces/S3 upload helper (used by cert PDFs + assignment uploads)
- [ ] `lib/email.ts` — email-send abstraction for password reset (dev stub if no SMTP configured; TRD's env baseline has no email provider var, so this is a documented gap/addition)

## 1. Auth (PRD §3.1)

- [x] `/signup` — real form + server action, creates User (bcrypt hash), role STUDENT — `app/(auth)/signup/`
- [x] `/login` — real form, `signIn("credentials")`, redirect by role — `app/(auth)/login/`
- [x] `/reset` — request + confirm flow. Stateless signed token (`lib/reset-token.ts`, HMAC via AUTH_SECRET, 1hr expiry), `/reset` + `/reset/[token]`. Sends via `lib/email.ts` (dev-stub console log until RESEND_API_KEY is set)
- [x] Profile page — `/profile`, name + photo upload (JPEG/PNG/WebP, 2MB cap, via `lib/storage.ts`) for every role, bio for instructors only, purchase-history link for students. Reachable from the site header (desktop + mobile nav) once logged in
- [x] Server-side role-gating helper (`lib/require-role.ts`), applied to all `(student)/(instructor)/(admin)` placeholder pages
- [x] Verified: credential hash/compare, reset-token round-trip + tamper rejection, signup create+verify, all against the real seeded DB (smoke script, not committed)
- [x] **Email verification on signup** (not in the original PRD/Webflow docs - added per user request). `User.emailVerifiedAt` (`DateTime?`, null = unverified). Signup still auto-signs-in (doesn't block first login/browsing - no real benefit, costs conversion), but sends a verification email and gates the one action that actually matters: enrolling (`app/api/checkout/route.ts` redirects to `?checkout=verify-email` if unverified, before any Payment row is created). `lib/reset-token.ts` generalized to purpose-scoped tokens (`reset` | `verify-email`) so a password-reset link can't double as an email-verification link; old in-flight reset tokens (minted before `purpose` existed) still work via a documented fallback. `/api/verify-email/[token]` (mutating GET, same pattern as the payment callback route) marks it verified and redirects to `/dashboard` (or `/login` if the click happens signed-out) with a banner; dashboard has a persistent "Verify your email to enroll" nag + Resend button while unverified. Seeded student is pre-verified in `prisma/seed.ts` so existing dev/test flows aren't blocked. Verified for real via Playwright against the actual running server: signup → blocked checkout (no orphaned Payment row) → real emailed link → unblocked checkout → garbage token correctly rejected
- [x] `lib/email.ts` already Resend-ready (was built that way earlier) - user is using Resend for real; just needs `RESEND_API_KEY` (and optionally `RESEND_FROM`) added to `.env`, no code change needed

## 2. Public (PRD §3.2, Webflow §3)

- [x] `/` — real featured courses + schools strip from DB
- [x] `/courses` — real published-course listing, school filter (chip row, `?school=`)
- [x] `/courses/[slug]` — real detail page (description, modules, outcomes, instructor, price, Enroll CTA); draft/archived gated to owner instructor/admin via `notFound()`
- [x] `/about` — static content
- [x] Verified: `/`, `/courses`, `/courses?school=BUSINESS`, `/courses/ai-foundations` (200), `/courses/does-not-exist` (404), unauthenticated CTA shows "Log in to enroll" — curl against running dev server + seeded DB

## 3. Enrollment & Payments (PRD §3.3, TRD §3)

- [x] `POST /api/checkout` — creates PENDING Payment, initializes gateway transaction, redirects to hosted checkout — `app/api/checkout/route.ts`
- [x] Paystack integration — `lib/payments/paystack.ts` (initialize + server-side verify; amounts in kobo)
- [x] Flutterwave integration — `lib/payments/flutterwave.ts` (initialize + server-side verify; amounts in naira, converted from kobo)
- [x] Webhook handlers + `GET /api/payments/callback` (best-effort instant UX) both call shared `lib/payments/complete-payment.ts` — idempotent, creates/activates Enrollment, generates + uploads receipt
- [x] Retry-payment action — `app/api/payments/retry/route.ts`, reuses the Payment row + reference, increments `attempts`
- [x] Receipt: `lib/receipts.ts` (pdf-lib) + `lib/storage.ts` (Spaces/S3, dev fallback writes to `public/uploads/`)
- [ ] **Not yet runtime-verified against real gateways** — PAYSTACK_SECRET_KEY/FLUTTERWAVE_SECRET_KEY are still placeholders; route existence, DB writes, and error-path handling are verified, but the actual hosted-checkout redirect and webhook payloads need real test keys before this can be called done
- [x] `/purchases` — real transaction list + receipt link + Retry (posts to `/api/payments/retry`), `app/(student)/purchases/page.tsx`
- [x] `/dashboard` — real continue-learning card + enrolled courses list + certificates/purchases links, `app/(student)/dashboard/page.tsx`

## 4. Learning experience (PRD §3.4)

- [x] `/learn/[course]` — real module list, video embed (YouTube/Vimeo URL → embed via `lib/video-embed.ts`), PDF download link, quiz entry, progress bar. Module list is a simple list, not a true mobile drawer overlay — noted as a UI-polish gap, not a data gap
- [x] Mark-complete action — `app/(student)/learn/[course]/actions.ts`, updates `ModuleProgress` + `lib/progress.ts` recomputes `Enrollment.percent`
- [x] Cohort/live-class link display when a Cohort exists for the course

## 5. Assessment engine (PRD §3.5)

- [x] Quiz-taking UI (MCQ + short-answer) + `submitQuizAction` server action — `app/(student)/learn/[course]/actions.ts`
- [x] Auto-grade MCQ-only quizzes from `Option.isCorrect` into `Submission.autoScore`/`finalScore`/`passed`; module only completes on a pass
- [x] Quizzes with any short-answer question stay `SUBMITTED` for instructor grading — the queue/grading UI itself is Phase 7 (Instructor), not built yet
- [ ] Instructor grading queue UI + grading action → `finalScore`, `passed` (deferred to Phase 7)

## 6. Certificates (PRD §3.6)

- [x] `lib/certificates.ts` — on `Enrollment.percent` reaching 100 (`lib/progress.ts`), generates certificate PDF (pdf-lib), uploads via `lib/storage.ts`, creates `Certificate` row with a random `verificationId`. Idempotent (skips if a VALID cert already exists)
- [x] `/certificates` — real list + Download PDF, `app/(student)/certificates/page.tsx`
- [ ] Admin revoke action (`/admin`) — flips `status` to `REVOKED`, sets `revokedAt` (Phase 8, needs the admin UI)
- [x] `/api/certificates/verify` — already implemented and now exercised (see verification below)
- [x] `/verify` — real form wired to the API, VALID/REVOKED/NOT_FOUND states, `app/(public)/verify/page.tsx`
- [x] **Verified end-to-end against the real DB** (scratch script, not committed): enroll → complete no-quiz module (percent 50) → wrong quiz answer correctly blocks completion (still 50) → correct answer auto-grades pass → percent 100, status COMPLETED → certificate row created, valid PDF file written (1.7 PDF, non-zero bytes) → public verify-by-verificationId returns VALID with correct holder name → admin-style revoke flips it to REVOKED
- [x] Found + fixed a real bug during this verification: `.env`'s `"..."` placeholders for STORAGE_*/PAYSTACK_*/FLUTTERWAVE_* were truthy, so `lib/storage.ts` tried calling real AWS S3 with garbage credentials instead of using its dev fallback. Fixed by leaving those vars empty in `.env` (not `"..."`) and hardened `uploadFile` to catch a real-storage failure and fall back to local disk instead of throwing

## 7. Instructor (PRD §3.7, Webflow §6)

- [x] `/instructor` — real own-courses list w/ status/price/student count, grading-queue count, create-course form (always starts DRAFT)
- [x] `/instructor/courses/[id]` — course meta editor (title/school/price/status/description/outcomes), module add/edit/delete/reorder (video URL, PDF), own-students progress view, grading queue with per-submission grade form
- [x] Quiz/question/option builder UI — add quiz per module, add MCQ (up to 4 options + correct index) or short-answer questions, delete questions
- [x] Ownership check on every read/write — `requireOwnedCourse()` helper in `actions.ts`, re-checked in every single action (not just the page)
- [x] Admin approval path for becoming an instructor: **not** a STUDENT→INSTRUCTOR role upgrade — per user decision, that promotion path was built then deliberately removed. Instructor accounts are only ever created directly (`createInstructorAction`, Phase "Instructor path + admin backend"), never promoted from an existing student account
- [x] **Verified against the real DB** (scratch script, not committed): module reorder via the temp-order swap (dodges the `@@unique([courseId, order])` constraint) works correctly; deleting one module doesn't touch a sibling module's quiz; grading a short-answer submission correctly triggers module completion + enrollment recompute to 100%
- [x] **Found + fixed a real schema bug during this verification**: `Submission.quiz` and `Answer.question` had no `onDelete: Cascade` (unlike every other parent-child relation in the schema), so deleting a module/quiz/question with any student submission threw a raw FK error. Added the missing cascades (migration `20260823224758_cascade_submission_answer_deletes`) and documented it in `docs/DATABASE_SCHEMA.md` §6. Confirmed `Enrollment.course`/`Certificate.course` staying `Restrict` is correct as-is (no app code ever deletes a course - archive/revoke are the real lifecycle actions)
- [x] Also added `User.isActive` (`Boolean @default(true)`, migration `20260823224232_add_user_is_active`) per user decision — wired into `authorize()` (blocks login) and `requireRole()` (re-checked every protected page load since JWT sessions are stateless)

## 8. Admin (PRD §3.7, Webflow §7)

- [x] `/admin` — Courses section: publish/unpublish/archive across all instructors, `setCourseStatusAction`
- [x] Users section: list, search (`?q=` on name/email), role shown as read-only text, deactivate/reactivate (`toggleUserActiveAction`, blocks self-deactivation). The role-change dropdown (`updateUserRoleAction`) was built, then deliberately deleted per user decision — no promote-a-student-to-instructor path exists; instructor accounts are only ever created directly via `createInstructorAction`
- [x] Payments section: transactions, statuses, receipts, refund action (`refundPaymentAction`, flips to `REFUNDED`; gateway-side refund API call is explicitly out of scope — this only updates our own record)
- [x] Certificates section: revoke (`revokeCertificateAction`) + a "completed but missing a certificate" utility list with a manual issue action (`issueCertificateAction`) for the data-repair edge case
- [x] Reporting: total revenue (sum of SUCCESS payments), active enrollment count, course count, user count
- [x] Single `/admin` route per the Webflow route map, sectioned with in-page anchors rather than sub-routes; each section is a stacked list (mobile-first single column) rather than a table, so no separate mobile treatment was needed
- [x] **Verified against the real DB** (scratch script, not committed): course status change, role change, deactivate/reactivate, self-deactivate guard condition, deactivated-user login block, refund, certificate revoke, and the missing-certificate detection logic (correctly does NOT re-flag a pair with a REVOKED cert as "missing" — a revoke is deliberate, not a gap)
- [x] Caught + fixed a real logic bug while building this: the initial "completed but missing a certificate" query used a course-level `certificates: { none }` Prisma filter, which would have wrongly excluded a student's completed enrollment just because *some other student* on the same course already had a certificate. Replaced with an application-level filter against the exact (userId, courseId) pairs
- [x] DB confirmed back to clean seeded state after all three phases' verification scripts (3 users, 3 courses, 0 leftover enrollments/payments/certificates)

## 9. Cross-cutting / NFRs (PRD §4, TRD §5)

- [x] Input validation: zod on every user-facing form that creates/renames a record (signup, reset, course create/update); enum fields elsewhere (course status, user role, question type) are validated against a literal allow-list before use. Not every micro-action (module reorder direction, grade score clamping) uses a full zod schema — those use direct bounds-checking instead, which is equivalent for their risk level, not a gap
- [x] Loading + error states — `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` added as baseline boundaries (Webflow §8); route-specific loading.tsx overrides for slower pages (course catalog, admin) are a possible follow-up, not required for correctness
- [x] Empty states — every list in the app already had a "No X yet" message from when each page was built (catalog, dashboard, certificates, purchases, instructor courses, grading queue, admin sections)
- [ ] Error monitoring/logging (e.g. Sentry) — **needs an account/DSN I don't have**; not attempted
- [x] Responsive QA pass — mobile (390px) verified for real via Playwright: no horizontal overflow on key pages, hamburger menu open/close + navigation, logged-in/out states. Found and fixed a real bug in the process (mobile nav backdrop scrim, see top of file). Tablet breakpoint not separately checked; desktop checked via the same screenshots
- [ ] Basic pen-test checklist — not run; would need a defined checklist and either manual review or a scanning tool

## 10. Deployment (TRD §4)

**Everything in this section needs accounts/access I don't have — a DigitalOcean account, a domain via WhoGoHost, and budget decisions. None of it was attempted. What's ready on the code side:**

- [ ] DigitalOcean Managed MySQL provisioned, same region as app — schema/migrations are ready to point at it via `DATABASE_URL`
- [ ] App deployed as long-running container on DO App Platform/Droplet — app has no serverless-specific code, Prisma client is already a singleton (`lib/prisma.ts`) per TRD §4.3
- [ ] DigitalOcean Spaces bucket provisioned, wired to `lib/storage.ts` — code already branches on `STORAGE_*` env vars being present, no code change needed once a bucket exists
- [ ] Cloudflare in front, DNS via WhoGoHost
- [ ] Staging environment mirroring production
- [ ] Daily DB backups + tested restore path
- [ ] `prisma migrate deploy` in the deploy pipeline (never hand-edit prod DB) — `prisma migrate dev` has been the dev-only command throughout; `deploy` is the production variant, not yet exercised against a real target

---

**Decisions already made and why (don't re-litigate without reason):**
- Prisma pinned to 6.x, not 7.x — see `project_aiua_phase2` memory / README.
- Password reset: stateless signed token, not a new DB table — keeps `schema.prisma` verbatim.
- Local dev DB: MySQL 8 via Docker — mirrors the TRD's MySQL 8 engine choice even though prod is DO Managed MySQL.
- `User.isActive` added to schema (user-approved) for admin deactivate — see Phase 7.
- `onDelete: Cascade` added to `Submission.quiz`/`Answer.question` — real bug fix, see `docs/DATABASE_SCHEMA.md` §6.
- `Enrollment.course`/`Certificate.course` deliberately stay `Restrict` — no app code deletes a course.
