# Book-a-demo · Lead tracking · Weekly Telegram summary

## 1. Database (new tables are already in schema.prisma)
Local:       `cd backend && pnpm prisma migrate dev && pnpm prisma generate`
Production:  `$env:DATABASE_URL="<supabase session pooler>"; pnpm prisma migrate deploy`
Migration:   `20261008120000_add_leads_and_digest` (tables: leads, lead_activities, digest_runs)

## 2. Book a demo — /demo
Linked from the header, footer, homepage hero and pricing page. A request:
saves a lead, posts a 📅 card to your Telegram group, and emails the requester a confirmation (en/fr/pt/es).
Requests are rate-limited and use a hidden honeypot field against bots.

## 3. Leads — /super-admin/leads
Chats, demo requests and signup requests all become leads. The same email = the same lead (history is kept).
- Statuses: New → Contacted → Demo booked → Signed up (set automatically when you approve their school) / Lost
- Add notes (call outcome, next step); each lead shows a full timeline; "Open chat" jumps to the transcript
- Export CSV (respects the status filter; safe against spreadsheet formula injection)
- A lead marked Lost who comes back is reopened as New automatically

## 4. Weekly summary to Telegram
Every Monday at 08:00 (Africa/Lagos by default): visitors (vs last week), top source, new chats / demos / signups,
leads waiting for first contact, new schools, signups awaiting approval, money in per currency, bank-transfer claims,
and schools running low on credit. Type `/summary` in the group any time to get it on demand.

Optional env vars (Render):
| Name | Default | Meaning |
|---|---|---|
| `DIGEST_TIMEZONE` | `Africa/Lagos` | time zone for "Monday 8 am" |
| `DIGEST_HOUR` | `8` | hour to send (0–23) |
| `DIGEST_ENABLED` | on | set `false` to switch off |
| `TELEGRAM_ALERTS_CHAT_ID` | uses `TELEGRAM_CHAT_ID` | send summary + alerts to a different group |

Notes: if the server is asleep at 8 am it sends when it next wakes that week (never twice). The first time you deploy
mid-week it will send once straight away for the current week.

## Already wired in this folder
LeadsModule, DemosModule, DigestModule registered in `app.module.ts`; chat and signup create leads; approving a school marks the lead Signed up;
`/demo` tracked by analytics (new "Demo requests" card); links added on the super-admin home page.
