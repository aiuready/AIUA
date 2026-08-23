# AI UNIVERSITY AFRICA

## Database Schema Reference — Phase 2 Platform

| | |
|---|---|
| **To:** | Build (Claude Code) + Engineering |
| **From:** | COO / Project Manager, AIUA |
| **Re:** | MySQL data model (Prisma) — model-by-model reference |
| **Files:** | schema.prisma (authoritative) + this reference |
| **Date:** | August 2026 |

This document explains the Phase 2 data model in plain language. The authoritative source is `prisma/schema.prisma` — that file is what Claude Code and Prisma Migrate consume. Engine: MySQL 8. IDs are cuid strings. Money is stored as integer kobo (NGN minor unit) to avoid floating-point drift.

## 1. Entities at a Glance

| Model | Purpose |
|---|---|
| User | One row per person; role is STUDENT, INSTRUCTOR, or ADMIN |
| Course | A course owned by an instructor, tagged to one of eight schools |
| Module | An ordered unit inside a course: video + PDF + optional quiz |
| Enrollment | Links a student to a course; holds progress % and status |
| ModuleProgress | Per-module completion for an enrollment |
| Payment | A gateway transaction; supports retry via attempts count |
| Quiz / Question / Option | The assessment structure attached to a module |
| Submission / Answer | A student's quiz attempt and per-question answers |
| Certificate | Issued on completion; carries the public verification ID |
| Cohort | A live-class group with a pasted meeting link |

## 2. Key Relationships

- A User (instructor) owns many Courses. A User (student) has many Enrollments, Payments, Submissions, and Certificates.
- A Course has many Modules, Enrollments, Certificates, and Cohorts.
- A Module has one optional Quiz and many ModuleProgress rows.
- An Enrollment belongs to one User and one Course, links optionally to one Payment (1:1), and has many ModuleProgress rows.
- A Quiz has many Questions; each Question has many Options (MCQ) and an optional model answer (short-answer).
- A Submission belongs to a Quiz and a User, is optionally graded by an admin/instructor User, and has many Answers.
- A Certificate belongs to one User and one Course and is looked up publicly by verificationId.

## 3. Design Decisions Worth Noting

### 3.1 Money as integer kobo

Prices (priceKobo, amountKobo) are integers in kobo. This is the standard way to hold currency in a payments system and matches how Paystack and Flutterwave expect amounts. No decimals stored.

### 3.2 Payment retry

Payment carries an attempts counter and a status of PENDING/SUCCESS/FAILED/REFUNDED. A failed charge is retried by incrementing attempts on the same course context, satisfying the PRD's failed-payment retry requirement without forcing re-enrollment.

### 3.3 Enrollment – Payment is 1:1 and optional

An enrollment references at most one successful payment. The link is optional so an enrollment can exist in an intermediate state before payment confirmation, then attach the payment on success — all confirmed server-side.

### 3.4 Progress

Enrollment.percent is the headline 0–100 figure shown on dashboards. It is derived from ModuleProgress rows (how many modules are completed). Certificate issuance triggers when percent reaches 100.

### 3.5 Assessment

Questions are typed MCQ or SHORT_ANSWER. MCQ auto-grades from Option.isCorrect into Submission.autoScore. Short-answer and file uploads set a submission to SUBMITTED for an instructor to grade, producing finalScore and passed.

### 3.6 Certificate verification

verificationId is a unique public key. The public /verify page reads it with no auth and returns holder, course, issue date, and status. Admin revocation flips status to REVOKED and sets revokedAt; the public page then reports the ID as invalid.

## 4. Indexes & Constraints

- Unique: User.email, Course.slug, Payment.reference, Certificate.verificationId.
- Composite unique: Enrollment(userId, courseId) — a student enrolls in a course once; Module(courseId, order); ModuleProgress(enrollmentId, moduleId).
- Indexes on foreign keys and on filterable columns (role, school, course status, payment status) to keep catalog and dashboard queries fast.

## 5. Migration & Handling

- Run migrations with `prisma migrate dev` in development and `prisma migrate deploy` in staging/production. Never hand-edit production tables.
- Instantiate one shared Prisma client (singleton) to avoid connection exhaustion.
- Seed an initial ADMIN user and the eight school values are enum-fixed, so no seed needed for schools.

## 6. Implementation deviations from this reference (see also TASKS.md)

Two small additive changes were made to `prisma/schema.prisma` during
build, both driven by real gaps found while implementing/verifying against
the running app - documented here since this reference predates them:

- **`User.isActive`** (`Boolean @default(true)`) - added to support the
  PRD §2 admin "deactivate" user capability, which had no backing field.
- **`onDelete: Cascade`** added to `Submission.quiz` and `Answer.question`
  (previously unset, defaulting to Restrict) - without this, deleting a
  module/quiz/question that had any student submission threw a foreign-key
  error instead of cascading, inconsistent with every other parent-child
  relation in this schema (Module→Quiz, Quiz→Question, Question→Option all
  already cascaded). Found via an end-to-end smoke test, not by inspection.

`Enrollment.course` and `Certificate.course` intentionally remain
`Restrict` (not cascade) - no app code ever deletes a Course (the product
lifecycle is publish/archive, and certificates are revoked, not deleted),
so a course with real enrollments or issued certificates correctly refuses
to be deleted outright.

*End of schema reference. Authoritative model is `prisma/schema.prisma`.*
