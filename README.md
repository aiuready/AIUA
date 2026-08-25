# AI University Africa — Phase 2

Multi-role LMS platform (student / instructor / admin) at **aiuready.africa**.
Single Next.js (App Router, TypeScript) app, Prisma over MySQL 8, deployed as
a long-running container co-located with the DB on DigitalOcean.

**Spec docs (source of truth) live in [`docs/`](./docs):**

- [`docs/PRD.md`](./docs/PRD.md) — product requirements
- [`docs/TRD.md`](./docs/TRD.md) — stack & infrastructure decisions
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) — data model reference (§6 covers deviations from the original schema)
- [`docs/WEBFLOW.md`](./docs/WEBFLOW.md) — screen-by-screen route map

**[`TASKS.md`](./TASKS.md)** tracks build progress phase by phase — what's
done, verified, and what's still open (deployment, monitoring).

The authoritative data model is [`prisma/schema.prisma`](./prisma/schema.prisma) —
Prisma Migrate consumes it directly; the DB doc above is a reading guide,
not the source.

## Stack

Next.js 16 (App Router) · **Prisma 6** (pinned — see below) · MySQL 8 ·
Auth.js (Credentials) · Tailwind CSS 4 · Paystack + Flutterwave · pdf-lib ·
DigitalOcean Spaces (S3-compatible via `@aws-sdk/client-s3`) · lucide-react.

**Prisma is pinned to 6.x, not the latest 7.x** — Prisma 7 removed inline
`datasource { url = env(...) }` support in favor of a driver-adapter config,
which would mean rewriting `schema.prisma` away from the form it was handed
over in. Revisit deliberately if the project ever intentionally upgrades.

## Getting started

```bash
npm install
cp .env.example .env      # DATABASE_URL, gateway/storage secrets - see below
docker compose up -d      # local MySQL 8 (see docker-compose.yml)
npx prisma migrate dev
npm run seed               # admin/instructor/student@aiua.africa test accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seeded credentials and
their passwords are in [`prisma/seed.ts`](./prisma/seed.ts).

Payment gateway keys, Spaces storage keys, and the email-send key are left
blank in `.env` for local dev on purpose — the code degrades gracefully
without them (checkout fails cleanly with `?checkout=error`, storage/email
fall back to local disk / console log). Fill them in for staging/prod.

## Structure

```
app/
  (public)/      /, /about, /courses, /courses/[slug], /verify — marketing site
  (auth)/        /login, /signup, /reset, /reset/[token]
  (student)/     /dashboard, /learn/[course], /certificates, /purchases
  (instructor)/  /instructor, /instructor/courses/[id]
  (admin)/       /admin
  api/
    auth/[...nextauth]      Auth.js route handlers
    checkout                Creates a Payment, redirects to gateway checkout
    payments/{callback,retry}
    webhooks/{paystack,flutterwave}   Signature-verified, idempotent
    certificates/verify     Public cert lookup by verificationId
auth.ts              Auth.js config (Credentials provider, JWT session, role + isActive)
lib/prisma.ts        Shared Prisma client singleton (see TRD §4.3)
lib/{progress,certificates,payments/*,storage,receipts}.ts   Core business logic
prisma/schema.prisma  Authoritative data model
prisma/seed.ts        Dev/staging seed data
```

Route-group folders (`(public)`, `(auth)`, etc.) don't affect URLs — they're
purely for organizing by access level, matching `docs/WEBFLOW.md` §2. Every
route above is real (not a placeholder) and server-side role-gated via
`lib/require-role.ts`.

## Design system

One shared visual language across the marketing site and the whole app —
not a separate look-and-feel per surface. Defined in `app/globals.css` as
Tailwind v4 `@theme` tokens (`bg-primary`, `text-foreground`,
`text-muted-foreground`, `border-border`, etc.) rather than raw Tailwind
palette classes, so a brand change is one file, not a find-and-replace
across every page.

- **Palette**: teal `#0D9488` (primary) + orange `#EA580C` (accent) —
  "progress teal + achievement orange," an e-learning-specific pairing.
- **Type**: Poppins (headings) / Open Sans (body) via `next/font/google`.
- **Components**: `components/ui/{button,button-link,container,section}.tsx`
  are the enforcement mechanism — every CTA and page section goes through
  these instead of ad-hoc classNames. `components/{site-header,site-footer,
  auth-card,logo}.tsx` are the shared chrome every route uses.
- Icons are [lucide-react](https://lucide.dev) throughout — no emoji, no
  mixed icon sets.

## Conventions carried over from the spec docs

- Money is **integer kobo**, never floats (`priceKobo`, `amountKobo`).
- Payment confirmation is **server-side only** — via gateway webhook, never
  the client.
- Role enforcement happens **server-side on every protected route/action**,
  re-checked independently in every server action (not just the page).
- Migrations via `prisma migrate dev` / `migrate deploy` — never hand-edit
  the DB.
