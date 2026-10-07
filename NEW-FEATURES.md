# Telegram alerts · Analytics · Reply from admin page

## 1. Database (two new tables are already in schema.prisma)
Local:        `cd backend && pnpm prisma migrate dev && pnpm prisma generate`
Production:   `$env:DATABASE_URL="<supabase session pooler>"; pnpm prisma migrate deploy`
Migrations:   `20261007120000_add_analytics_events` (new). `20261006120000_add_website_live_chat` is the chat one you already applied.

## 2. Telegram staff alerts (no new setup if live chat already works)
The bot posts to the same staff group for:
- 🏫 new school signup request
- 🏦 bank-transfer claim waiting for review
- ⚠️ wallet balance low (max one alert per school per 24 h)
- ❌ failed card payment
- 🚨 successful payment that could NOT be credited (no valid school / currency mismatch)

Optional: send these to a different group than live chat by adding `TELEGRAM_ALERTS_CHAT_ID=<group id>` on Render
(add the bot to that group first). Without it, alerts go to `TELEGRAM_CHAT_ID`.

## 3. Analytics — /super-admin/analytics
Cookie-free, first-party: page views, visitors, chats started, signup requests, a signup funnel, traffic sources and top pages
(7 / 30 / 90 days). Tag campaign links with `?utm_source=facebook` etc. to see them under "Where visitors come from".
- No cookies, no IP addresses stored, bots ignored, Do Not Track / Global Privacy Control respected.
- Only marketing pages are tracked, never a school's private app.
- Add one sentence to your privacy policy, e.g. "We collect anonymous, cookie-free page-view statistics (page, referring site, device type)."

## 4. Reply from the admin page — /super-admin/chats
Open a chat, type a reply, press Enter. The visitor sees it like a Telegram reply (or gets it by email if they left),
and the staff group is told "answered from the admin page by <name>" so nobody replies twice. The open conversation refreshes every 5 s.
Replying needs a SUPER_ADMIN login.

## Already wired in this folder
TelegramModule + AnalyticsModule registered in `app.module.ts`; alerts hooked into signup, wallet and payments;
analytics tracker mounted in `web/app/layout.tsx`; links added on the super-admin home page.
