# AI UNIVERSITY AFRICA

## Technical Requirements Document (TRD) — Phase 2 Platform

| | |
|---|---|
| **To:** | Build (Claude Code) + Engineering |
| **From:** | COO / Project Manager, AIUA |
| **Re:** | Phase 2 web platform — technical requirements & deployment |
| **Date:** | August 2026 |

This TRD specifies how the Phase 2 platform is built and deployed. It fixes the stack, architecture, infrastructure, and the operational requirements the PRD's non-functional section calls for. It is written to be handed to Claude Code as the technical source of truth.

## 1. Stack Decision

The platform is a single-runtime, full-stack **Next.js (TypeScript)** application using **Prisma** as the ORM over **MySQL 8**. This replaces the earlier Laravel + NestJS plan.

### 1.1 Why this stack

- One runtime, one repo, one deploy — removes the two-framework integration seam and the second deploy pipeline.
- Highest AI-writability: Next.js + Prisma is the best-supported modern stack for AI-assisted code generation, so Claude Code produces more correct, idiomatic output with less rework.
- MySQL retained as decided: Prisma treats MySQL as a first-class target and the schema doubles as readable documentation.
- Deploys cleanly as a long-running container next to the database (see §4).

### 1.2 Core technologies

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | UI + API routes in one codebase |
| ORM | Prisma | Schema-first; migrations; type-safe queries |
| Database | MySQL 8 | Managed instance, co-located with app |
| Auth | Auth.js (NextAuth) or Lucia | Email+password, session, role claims |
| Payments | Paystack + Flutterwave SDKs | Server-side verification, webhooks |
| PDF (certs) | Server-side PDF (e.g. pdf-lib/Puppeteer) | Generated on completion |
| File storage | S3-compatible (Spaces) or provider volume | PDFs, assignment uploads |
| Styling | Tailwind CSS | Mobile-first utility styling |

## 2. Application Architecture

- Single Next.js app. UI pages under the App Router; server logic in API route handlers / server actions.
- Prisma is the only path to the database. No raw SQL in app code except vetted reporting queries.
- Role-based access enforced server-side on every protected route and mutation — never trust the client.
- Payment confirmation is server-side only, via gateway verification + webhook. The client never marks a payment successful.
- Certificate generation is a server action triggered when course progress reaches 100%.

### 2.1 Route groups (high level)

- Public: marketing pages, /courses catalog, /verify certificate lookup.
- Auth: /login, /signup, /reset.
- Student: /dashboard, /learn/[course], /certificates, /purchases.
- Instructor: /instructor (courses, content, grading, students).
- Admin: /admin (courses, users, payments, reporting, certificate control).

## 3. Data & Integrations

- Schema is defined in Prisma and version-controlled; see the Database Schema document for the full model.
- Migrations run via Prisma Migrate; never hand-edit the database in production.
- Paystack and Flutterwave each register a webhook endpoint; incoming webhooks are signature-verified.
- Video is embedded from Vimeo/YouTube unlisted — no media is hosted by the platform.
- Uploaded assignments and generated PDFs live in object storage, referenced by URL in the DB.

## 4. Infrastructure & Deployment

Decided configuration: **app and Managed MySQL co-located on DigitalOcean, same region**; WhoGoHost for domain registration and business email (Naira-native).

### 4.1 Why co-located

- The app and database sit on the same provider/region on a private network, so query latency stays low.
- Rejected: app on Render/Vercel abroad + MySQL on Nigerian shared hosting. That splits app and DB across the public internet, adding cross-continent latency to every query and relying on shared-hosting remote MySQL, which lacks pooling control. Wrong trade for a query-heavy LMS.

### 4.2 Components

| Component | Where | Notes |
|---|---|---|
| Next.js app | DigitalOcean (App Platform or Droplet) | Long-running container; not serverless |
| MySQL 8 | DigitalOcean Managed MySQL, same region | Backups, failover, pooling handled |
| Object storage | DigitalOcean Spaces (S3-compatible) | PDFs, uploads |
| Domain + email | WhoGoHost / Go54 | Paid in Naira; DNS points to the app |
| CDN | Cloudflare in front | Caches static assets for NG users |

### 4.3 Connection-pooling note

Because the app runs as a long-running container (not serverless), it holds a stable connection pool to MySQL — the standard, low-friction case. **If any part is later moved to a serverless platform, a connection pooler becomes mandatory** to avoid exhausting MySQL connections. Design the Prisma client as a shared singleton either way.

### 4.4 Environments

- Staging environment mirroring production, used before every go-live.
- Secrets (DB URL, gateway keys) in environment variables, never committed.
- Deploy from a Git repo; a push to the main branch builds and ships.

## 5. Security, QA & Operations

- Role enforcement on every protected route and server action.
- Server-side payment verification + signed webhooks; idempotent handling of duplicate webhook deliveries.
- Input validation on all mutations; parameterized queries via Prisma (no string-built SQL).
- Formal testing pass: functional coverage + a basic penetration-test checklist.
- Error monitoring/logging wired up before go-live.
- Automated daily database backups with a tested restore path.
- A defined post-launch bug-fix window after go-live.

## 6. Environment Variables (baseline)

```
DATABASE_URL=mysql://user:pass@host:3306/aiua
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
PAYSTACK_SECRET_KEY=...
PAYSTACK_WEBHOOK_SECRET=...
FLUTTERWAVE_SECRET_KEY=...
FLUTTERWAVE_WEBHOOK_SECRET=...
STORAGE_ENDPOINT=... # Spaces / S3
STORAGE_KEY=...
STORAGE_SECRET=...
```

*End of TRD. Reads alongside the PRD, Database Schema, and Webflow.*
