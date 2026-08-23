# AIUA Phase 2 — Remaining work

Tracks everything left after the initial scaffold (commit `7783461`). Checked
off in commit order as each is finished for real (not just stubbed) and
verified (build/lint/manual check). Unchecked = not started.

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
- [ ] Profile page (name, photo, bio for instructors, purchase history for students) — PRD §3.1, not in the original Webflow route map; add under `/dashboard` or a `/profile` route
- [x] Server-side role-gating helper (`lib/require-role.ts`), applied to all `(student)/(instructor)/(admin)` placeholder pages
- [x] Verified: credential hash/compare, reset-token round-trip + tamper rejection, signup create+verify, all against the real seeded DB (smoke script, not committed)

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

- [ ] `/instructor` — real own-courses list (draft/published), students-count, grading-queue summary
- [ ] `/instructor/courses/[id]` — course meta editor, module add/reorder (video URL, PDF, quiz), own-students progress view
- [ ] Quiz/question/option builder UI
- [ ] Ownership check on every read/write (`Course.instructorId === session.user.id`)
- [ ] Admin approval path: role upgrade STUDENT → INSTRUCTOR (admin-only action, PRD §2)

## 8. Admin (PRD §3.7, Webflow §7)

- [ ] `/admin` — Courses tab: publish/unpublish/archive across all instructors
- [ ] Users tab: list, search, role change. **"Deactivate" has no schema field** — needs a decision (add `isActive` to User, or treat REVOKED enrollments as the only lever) before building
- [ ] Payments tab: transactions, statuses, receipts, refund action (flips to `REFUNDED` — gateway-side refund call is out of scope unless gateway supports API refund)
- [ ] Certificates tab: issue/revoke
- [ ] Reporting: basic revenue (sum of SUCCESS payments) + enrollment counts
- [ ] Mobile: stacked-card table treatment (Webflow §7 mobile pattern)

## 9. Cross-cutting / NFRs (PRD §4, TRD §5)

- [ ] Input validation on every mutation (zod schemas)
- [ ] Error monitoring/logging (e.g. Sentry) wired before go-live
- [ ] Loading + error states on every data screen (Webflow §8)
- [ ] Empty states for every list (Webflow §8)
- [ ] Responsive QA pass (mobile/tablet/desktop)
- [ ] Basic pen-test checklist pass

## 10. Deployment (TRD §4)

- [ ] DigitalOcean Managed MySQL provisioned, same region as app
- [ ] App deployed as long-running container on DO App Platform/Droplet
- [ ] DigitalOcean Spaces bucket provisioned, wired to `lib/storage.ts`
- [ ] Cloudflare in front, DNS via WhoGoHost
- [ ] Staging environment mirroring production
- [ ] Daily DB backups + tested restore path
- [ ] `prisma migrate deploy` in the deploy pipeline (never hand-edit prod DB)

---

**Decisions already made and why (don't re-litigate without reason):**
- Prisma pinned to 6.x, not 7.x — see `project_aiua_phase2` memory / README.
- Password reset: stateless signed token, not a new DB table — keeps `schema.prisma` verbatim.
- Local dev DB: MySQL 8 via Docker — mirrors the TRD's MySQL 8 engine choice even though prod is DO Managed MySQL.
