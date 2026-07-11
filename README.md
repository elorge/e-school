# Eschools

Starter pack for the Elorge Schools platform.

This is **not a monorepo**. `backend/` and `web/` are two fully independent
projects — each has its own `package.json`, dependency tree, and `.env`.
Nothing shares a workspace config (no Nx, Turborepo, Yarn workspaces). You
can develop, deploy, and version them completely separately.

```
Eschools/
├── backend/   NestJS API + PostgreSQL — auth, schools, wallet/ledger, PINs, reports
└── web/       Next.js PWA — staff/admin app, student PIN portal
```

## Getting started

Open two terminals.

**Backend**
```bash
cd backend
cp .env.example .env    # fill in your database URL and secrets
pnpm install               # postinstall runs `prisma generate` automatically
pnpm run prisma:migrate    # creates tables from prisma/schema.prisma
pnpm run start:dev         # http://localhost:4000
```

**Web**
```bash
cd web
cp .env.example .env    # point NEXT_PUBLIC_API_URL at the backend
pnpm install
pnpm run dev              # http://localhost:3000
```

## Where things are

See `Elorge-Schools-Complete-Specification.md` for the full architecture,
data model, wallet/ledger design, and roadmap this scaffold implements.

**Data model:** `backend/prisma/schema.prisma` is the single source of
truth for every table — Schools, Users (role-based: super_admin,
finance_ops, school_admin, staff), Classes, Students, Terms, Subjects,
ResultEntry, ReportTemplate, Pin, IdCard, AttendanceRecord, and
WalletLedgerEntry. Run `pnpm run prisma:studio` for a visual browser of the
data once you have a database connected.

Key structural decisions baked into this scaffold:

- **Multi-tenancy**: every tenant-scoped table carries a `schoolId`.
  Routes on the web side are path-based: `/[school]/admin`, `/[school]/staff`,
  `/[school]/results`. Row-Level Security policies described in the spec
  doc are NOT yet written as SQL — add them to a Prisma migration before
  production (see the comment at the top of `schema.prisma`).
- **Roles**: `SUPER_ADMIN`, `FINANCE_OPS`, `SCHOOL_ADMIN`, `STAFF` — a
  single `User` model with a `role` enum, not separate tables. Enforcement
  guards live in `backend/src/common/guards` but are not yet wired into
  every controller — most routes below are marked `// TODO: guard`.
- **Wallet/ledger**: append-only ledger, never a mutable balance field —
  see `backend/src/modules/wallet`. Includes the ₦100,000 one-time
  welcome bonus (`grantWelcomeBonus`) and a display-only Naira-to-
  student-PIN conversion helper.
- **Students**: `studentId` (e.g. `GRW/2026/0001`) is assigned **server-
  side at sync time**, never on-device — see `backend/src/modules/students`
  and spec doc §9.1.
- **PINs**: `backend/src/modules/pins` — batch generation debits the
  wallet and creates PINs atomically, invalidates the prior term's PIN
  immediately, and hashes every PIN with bcrypt. Rate limiting on the
  student-facing lookup is flagged as a TODO — build this before launch.
- **ID cards & attendance**: QR-based, not NFC — see
  `backend/src/modules/id-cards`. Digital card generation is free;
  physical card fulfillment (if it ships) should be a separate cost-plus
  product, not bundled into wallet pricing.
- **Report cards**: `backend/src/modules/reports` — carries only the
  school's name/logo (never Elorge's), plus a small, unobtrusive
  verification QR, teacher comments, and term-over-term trend data
  computed at render time. PDF rendering itself is a TODO.
- **Offline sync**: not wired up yet in this scaffold — see Phase 2 in
  the spec doc before adding PowerSync/RxDB to `web/`.

## What's still a placeholder / not implemented

This is a starting skeleton, not a finished app. Explicitly missing:

- Auth guards actually enforced on routes (most controllers are open —
  marked with `// TODO: guard` comments)
- Rate limiting on the student PIN lookup
- Payment gateway webhook handlers (Paystack/Flutterwave)
- Manual bank transfer submission UI + Finance/Ops review queue UI
- PDF report rendering (entity/service shape exists, rendering doesn't)
- Photo upload/storage
- Offline sync (PowerSync/RxDB) on the `web/` PWA
- The `/verify` page the report card's QR code points to
- Tailwind styling — pages currently render unstyled
- Tests, CI/CD, deployment config

