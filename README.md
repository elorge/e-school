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

## Deploying to production (Render + Vercel + Supabase)

This is the same split as local dev: **Supabase** hosts just the Postgres
database, **Render** runs the `backend/` NestJS API as a persistent web
service, and **Vercel** hosts the `web/` Next.js app. Nothing else about
the code changes for this — same `.env` keys, same migrations, same build
commands, just pointed at hosted services instead of `localhost`.

### 1. Database — Supabase

1. Create a new Supabase project (any region close to your Render region
   keeps latency down).
2. **Project Settings → Database → Connection string.** Use the **URI**
   under **Session pooler** (port `5432`) for `DATABASE_URL` — it behaves
   like a normal Postgres connection, which is what a long-running Nest
   process on Render wants. Don't use the **Transaction pooler** (port
   `6543`) unless you also add a second `directUrl` to the `datasource`
   block in `backend/prisma/schema.prisma`, since Prisma's migration
   engine can't run migrations through a transaction-mode pooler.
3. Paste that URI in as `DATABASE_URL` — you'll set it as an env var on
   Render in step 2, not in a local `.env` file.
4. Nothing else to configure on Supabase's side — table creation happens
   via Prisma migrations from Render's build step (step 2.3 below), not
   through Supabase's own SQL editor.

### 2. Backend — Render

1. **New → Web Service**, pointed at this repo. Since `backend/` and
   `web/` are two independent projects in one repo, set **Root
   Directory** to `backend`.
2. **Runtime**: Node. **Build Command**:
   ```
   npm install && npm run build
   ```
   (`npm install`'s `postinstall` script runs `prisma generate`
   automatically — see `backend/package.json` — so the Prisma client is
   already correct for whatever's in `schema.prisma` by the time `build`
   runs.)
3. **Start Command** — run pending migrations before the server boots,
   every deploy:
   ```
   npx prisma migrate deploy && npm run start
   ```
   Use `migrate deploy`, not the `prisma:migrate` script in
   `package.json` (that one runs `prisma migrate dev`, which prompts
   interactively and expects a dev database — never run it against
   production).
4. **Environment variables** — set every key from your local
   `backend/.env` (or `.env.example` if you're starting fresh) as a
   Render env var. At minimum:
   - `DATABASE_URL` — the Supabase session-pooler URI from step 1.
   - `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`,
     `FRONTEND_PAYMENT_CALLBACK_URL` — point this at your **Vercel**
     domain (step 3), e.g. `https://your-app.vercel.app/payment/callback`.
   - `FRONTEND_RESET_PASSWORD_URL` — also the Vercel domain, e.g.
     `https://your-app.vercel.app/reset-password`.
   - `FRONTEND_ORIGINS` — the Vercel domain(s) allowed to call this API
     via CORS, comma-separated if there's more than one (production +
     any preview domains you use), e.g.
     `https://your-app.vercel.app,https://your-app-git-main-you.vercel.app`.
     Leaving this unset allows every origin (`main.ts` falls back to
     `origin: true`) — fine for a first deploy, tighten it once the
     Vercel domain is known.
   - `DEFAULT_PRICE_PER_STUDENT_KOBO`, `WELCOME_BONUS_KOBO`,
     `LOW_BALANCE_WARNING_THRESHOLD_KOBO`, `DEFAULT_CURRENCY`,
     `DEFAULT_COUNTRY_CODE`, `MAX_PIN_LOOKUP_ATTEMPTS`,
     `BANK_TRANSFER_SLA_HOURS`, `PERFORMANCE_STRENGTH_THRESHOLD`,
     `PERFORMANCE_AT_RISK_THRESHOLD`, `TZ`
   - **Don't** set `PORT` — Render injects its own and `main.ts` already
     reads `process.env.PORT`.
5. Deploy. Watch the build logs for the `prisma migrate deploy` step in
   particular — that's where a bad `DATABASE_URL` or an out-of-order
   migration shows up.
6. Once it's live, note the Render URL (e.g.
   `https://eschools-api.onrender.com`) — the frontend needs it next.
7. **Seed data (optional, one-time):** Render's dashboard has a **Shell**
   tab on the service — open it and run `npx prisma db seed` there to
   create the demo school against your Supabase database. You can also
   do this from your own machine by exporting the same `DATABASE_URL`
   locally and running `npm run` — whichever's easier; it only writes if
   `greenwood-college` doesn't already exist (see `prisma/seed.ts`).

### 3. Frontend — Vercel

1. **New Project**, pointed at this repo. Set **Root Directory** to
   `web`. Vercel auto-detects Next.js — no build/start command changes
   needed.
2. **Environment variables** (Project Settings → Environment Variables),
   for Production (and Preview, if you want preview deploys to also hit
   the real API):
   - `NEXT_PUBLIC_API_URL` — the Render URL from step 2.6, e.g.
     `https://eschools-api.onrender.com` (no trailing slash — `lib/api.ts`
     concatenates the path directly onto this).
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_X_URL`,
     `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`,
     `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_TIKTOK_URL`,
     `NEXT_PUBLIC_YOUTUBE_URL` — whatever your real social links are;
     these only affect footer/landing-page links, not app behavior.
3. Deploy. Once it's live, go back to Render (step 2.4) and update
   `FRONTEND_ORIGINS`, `FRONTEND_RESET_PASSWORD_URL`, and
   `FRONTEND_PAYMENT_CALLBACK_URL` to the real Vercel domain if you used
   a placeholder earlier, then redeploy the backend so those changes
   take effect.

### Order matters on first deploy

Supabase (get `DATABASE_URL`) → Render (needs that URL, produces the API
URL) → Vercel (needs the API URL) → back to Render once more (needs the
real Vercel domain for CORS/redirect links). Two round trips, but each
one is just an env var update + redeploy, not a code change.



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

