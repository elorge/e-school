# Telegram live chat — setup

## 1. Create the bot (2 min)
1. In Telegram open **@BotFather** → `/newbot` → name it **Elorge Schools Bot**, pick a username ending in `bot`.
2. Copy the **token** → `TELEGRAM_BOT_TOKEN`.
3. (Optional) `/setuserpic` and `/setdescription` so it looks official.

## 2. Create the staff group
1. Make a Telegram **group** with everyone who answers chats. Add the bot to it.
2. Send any message in the group, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `"chat":{"id": -100…}` → `TELEGRAM_CHAT_ID` (groups start with `-`).
3. Agents answer by **long-pressing a visitor's message → Reply**. `/waiting` lists unanswered chats.

## 3. Database
The chat models are already in `backend/prisma/schema.prisma` and the migration is in `backend/prisma/migrations/20261006120000_add_website_live_chat`.
```
cd backend
pnpm prisma migrate deploy      # creates the chat tables (point DATABASE_URL at Supabase for production)
pnpm prisma generate
```

## 4. Already wired in this folder
- `ChatModule` is registered in `backend/src/app.module.ts`.
- `app.set('trust proxy', 1)` is in `backend/src/main.ts` (rate limits now see each visitor's real IP behind Render).
- `/super-admin/chats` (past chats) is linked from the super-admin home page.

## 5. Environment variables (Render)
| Name | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | from BotFather |
| `TELEGRAM_CHAT_ID` | the group id (negative number) |
| `TELEGRAM_WEBHOOK_SECRET` | any long random string you invent (A–Z a–z 0–9 _ -) |
| `FRONTEND_PUBLIC_URL` | `https://elorgeschools.org` |
| `CHAT_NUDGE_AFTER_SECONDS` | optional, default 90 |
| `CHAT_FOLLOWUP_AFTER_SECONDS` | optional, default 300 |

## 6. Register the webhook (once, after deploy)
PowerShell:
```
$t="<TOKEN>"; $api="https://<your-api-domain>"; $s="<TELEGRAM_WEBHOOK_SECRET>"
Invoke-RestMethod "https://api.telegram.org/bot$t/setWebhook" -Method Post -ContentType "application/json" `
  -Body (@{ url="$api/webhooks/telegram"; secret_token=$s; allowed_updates=@("message") } | ConvertTo-Json)
```
Check it with `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`.

## 7. Test
Open the site → "Chat with us" → send a message. The group gets a card with `#a1b2c3`. Reply to it; your answer appears in the widget within ~3 s. Wait 90 s without replying to see the bot's "please be patient" message (and the ⏰ alert in the group).

## Local testing without a public URL
Set `TELEGRAM_POLL=true` in `backend/.env` (never together with a webhook).

## Cleanup
`web/components/WhatsAppButton.tsx` and `NEXT_PUBLIC_WHATSAPP_NUMBER` are no longer used — delete them.
