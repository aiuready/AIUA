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

## 4. Learning experience (PRD §3.4)

- [ ] `/learn/[course]` — real module list + drawer, video embed, PDF download, quiz entry, progress bar
- [ ] Mark-complete action — updates `ModuleProgress`, recomputes `Enrollment.percent`
- [ ] Cohort/live-class link display when a Cohort exists for the course

## 5. Assessment engine (PRD §3.5)

- [ ] Quiz-taking UI (MCQ + short-answer) + `POST` submission endpoint
- [ ] Auto-grade MCQ from `Option.isCorrect` into `Submission.autoScore`
- [ ] Instructor grading queue (short-answer/file submissions) + grading action → `finalScore`, `passed`

## 6. Certificates (PRD §3.6)

- [ ] Server action: on `Enrollment.percent` reaching 100, generate certificate PDF (pdf-lib), upload to storage, create `Certificate` row with `verificationId`
- [ ] `/certificates` — real list + Download PDF
- [ ] Admin revoke action (`/admin`) — flips `status` to `REVOKED`, sets `revokedAt`
- [ ] `/verify` — wire the existing `PagePlaceholder` to the real form + `/api/certificates/verify` (already implemented)

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
