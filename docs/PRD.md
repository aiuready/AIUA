# AI UNIVERSITY AFRICA

## Product Requirements Document (PRD) — Phase 2 Platform

| | |
|---|---|
| **To:** | Build (Claude Code) + Engineering |
| **From:** | COO / Project Manager, AIUA |
| **Re:** | Phase 2 web platform — product requirements |
| **Stack:** | Next.js (full-stack, TypeScript) · Prisma · MySQL 8 |
| **Date:** | August 2026 |

This PRD defines what the Phase 2 platform must do. It is the product contract that the TRD, database schema, and webflow build against. Phase 1 (the MVP) proved demand with a template-themed, single-admin build. Phase 2 turns that into a production platform: custom UI, real role separation, production-grade payments, and a public certificate verification page. Scope here is bounded — anything not listed is out of Phase 2.

## 1. Goals & Success Criteria

### 1.1 Product Goals

- Move from a single-admin MVP to a multi-role platform: students, instructors, admins.
- Give instructors a self-serve way to publish and manage their own courses.
- Make payments production-grade: two gateways, retries, receipts.
- Turn the certificate into a trust asset employers can verify publicly.
- Replace the templated theme with a custom, mobile-first interface.

### 1.2 Success Criteria

- A student can discover, buy, complete a course, and download a verifiable certificate end to end.
- An instructor can create a course, upload content, and see their own students' progress without admin help.
- An admin can manage courses, users, and payments from a custom dashboard, not a raw DB tool.
- An employer can verify a certificate ID on a public page with no login.
- The platform is usable and fast on a mid-range Android phone on a 3G/4G connection.

## 2. User Roles

| Role | Can do | Cannot do |
|---|---|---|
| Student | Enroll, pay, learn, track progress, earn certificates, manage own profile | Create courses, see other students, access admin |
| Instructor | Create/edit own courses, upload content, view own students' progress | See other instructors' courses, manage payments, manage users |
| Admin | Manage all courses, users, payments; view reporting; issue/revoke certificates | n/a (full access within platform scope) |
| Public (no login) | Browse marketing pages, view course catalog, verify a certificate ID | Enroll, access learning content |

## 3. Functional Requirements

### 3.1 Accounts & Authentication

- Email + password signup and login for students and instructors.
- Role assigned at account level; instructors are approved/upgraded by an admin.
- Password reset by email. Session persistence across visits.
- Profile page: name, photo, bio (instructors), purchase history (students).

### 3.2 Course Catalog & Discovery

- Public catalog listing all published courses, filterable by school (Foundations, Business, Content, Careers, Professionals, Builders, African AI, Instructor).
- Course detail page: description, module list, outcomes, price, instructor, enroll CTA.
- Unpublished/draft courses are visible only to their instructor and admins.

### 3.3 Enrollment & Payments

- Enroll = pay (one-off purchase per course). No subscriptions in Phase 2.
- Two gateways: Paystack and Flutterwave. Student picks at checkout, or platform routes by availability.
- Failed-payment retry: a failed charge can be retried without re-enrolling.
- On success: enrollment is created, receipt generated, student gets access.
- Every payment produces a receipt/invoice record retrievable by student and admin.

### 3.4 Learning Experience

- Enrolled student sees course modules in order.
- Per module: embedded video (Vimeo/YouTube unlisted), downloadable PDF, and a quiz.
- Progress tracked as % complete; module marked done on completion.
- Live classes: a Zoom/Meet link shown per cohort (no scheduling engine in Phase 2).

### 3.5 Assessment Engine

- Quizzes support MCQ (auto-graded) and short-answer.
- Short-answer and file-upload assignments route to the instructor for manual grading.
- A module/course completion depends on passing its assessments.

### 3.6 Certificates & Verification

- Certificate auto-generated as PDF on 100% course completion.
- Each certificate carries a unique verification ID.
- Public verification page: anyone can enter an ID and confirm holder name, course, issue date, and validity — **no login required**.
- Admin can revoke a certificate; a revoked ID shows as invalid on the public page.

### 3.7 Dashboards

- Student: enrolled courses, progress, certificates, purchase history.
- Instructor: own courses, content upload/edit, own students' progress, grading queue.
- Admin: manage courses/users/payments, basic revenue & enrollment reporting, certificate control.

## 4. Non-Functional Requirements

- **Mobile-first:** designed for small screens first; full responsive pass across mobile, tablet, desktop.
- **Performance:** catalog and dashboard pages usable on mid-range Android over 3G/4G; app and database co-located to keep query latency low.
- **Reliability:** database backups; error monitoring/logging in place before go-live.
- **Security:** role-enforced access on every route; payment verification server-side; formal test pass incl. basic pen-test checklist.
- **Localization-ready:** Naira-native pricing; copy structured so African-language content can be added later.

## 5. Out of Scope (Phase 2)

*Named so there is no ambiguity. Deferred to a later phase:*

- Subscriptions / membership billing.
- Native mobile apps (platform is responsive web only).
- Live-class scheduling system (links are pasted per cohort).
- Community/forum, marketplace, career portal, AI news platform (Stage 3 items).
- African-language content production (structure supports it; content is later).
- Advanced analytics beyond basic revenue/enrollment reporting.

## 6. Acceptance Checklist

*Phase 2 is done when every line below is true:*

- Student journey works end to end: browse → pay → learn → certificate.
- Both payment gateways process a live transaction and produce a receipt.
- A failed payment can be retried and then succeeds.
- Instructor can publish a course and grade a short-answer submission.
- Admin dashboard manages courses, users, payments and shows basic reporting.
- Public verification page returns correct status for valid, revoked, and unknown IDs.
- Responsive QA passes on mobile, tablet, desktop.
- Staging environment exists; backups, logging, and a post-launch bug window are in place.

*End of PRD. Reads alongside the TRD, Database Schema, and Webflow.*
