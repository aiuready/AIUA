# AI University Africa — Phase 2

Multi-role LMS platform (student / instructor / admin). Single Next.js
(App Router, TypeScript) app, Prisma over MySQL 8, deployed as a
long-running container co-located with the DB on DigitalOcean.

**Spec docs (source of truth) live in [`docs/`](./docs):**

- [`docs/PRD.md`](./docs/PRD.md) — product requirements
- [`docs/TRD.md`](./docs/TRD.md) — stack & infrastructure decisions
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) — data model reference
- [`docs/WEBFLOW.md`](./docs/WEBFLOW.md) — screen-by-screen route map

The authoritative data model is [`prisma/schema.prisma`](./prisma/schema.prisma) —
Prisma Migrate consumes it directly; the DB doc above is a reading guide,
not the source.

## Stack

Next.js 16 (App Router) · Prisma 7 · MySQL 8 · Auth.js (Credentials) ·
Tailwind CSS 4 · Paystack + Flutterwave · pdf-lib · DigitalOcean Spaces
(S3-compatible via `@aws-sdk/client-s3`).

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and gateway/storage secrets
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  (public)/      /, /about, /courses, /courses/[slug], /verify
  (auth)/        /login, /signup, /reset
  (student)/     /dashboard, /learn/[course], /certificates, /purchases
  (instructor)/  /instructor, /instructor/courses/[id]
  (admin)/       /admin
  api/
    auth/[...nextauth]      Auth.js route handlers
    webhooks/paystack       Paystack webhook (signature-verified, idempotent)
    webhooks/flutterwave    Flutterwave webhook (signature-verified, idempotent)
    certificates/verify     Public cert lookup by verificationId
auth.ts          Auth.js config (Credentials provider, JWT session, role claim)
lib/prisma.ts    Shared Prisma client singleton (see TRD §4.3)
prisma/schema.prisma
```

Route-group folders (`(public)`, `(auth)`, etc.) don't affect URLs — they're
purely for organizing by access level, matching `docs/WEBFLOW.md` §2.

Every page under `(student)`, `(instructor)`, `(admin)` is currently a
placeholder; role-gating still needs to be enforced server-side on each
route/action per TRD §2 before it holds real content — nothing here should
be treated as access-controlled yet.

## Conventions carried over from the spec docs

- Money is **integer kobo**, never floats (`priceKobo`, `amountKobo`).
- Payment confirmation is **server-side only** — via gateway webhook, never
  the client.
- Role enforcement happens **server-side on every protected route/action**.
- Migrations via `prisma migrate dev` / `migrate deploy` — never hand-edit
  the DB.
