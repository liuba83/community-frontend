# Telegram Approve/Deny for Service Submissions

**Date:** 2026-03-20
**Status:** Approved

## Summary

Add ✅ Approve and ❌ Delete inline keyboard buttons to the Telegram notification sent when a new service listing is submitted. Tapping a button from Telegram performs the action directly — no need to open the admin panel.

## Goals

- Admin can approve or delete a pending submission directly from the Telegram notification
- Deleting via Telegram also removes associated Cloudinary images (consistent with admin panel behavior)
- After taking action, the message updates to show the result and buttons are removed

## Non-goals

- Email notification to the submitter on rejection
- Telegram user ID allowlist (secret token validation is sufficient)
- Any changes to the admin panel UI

## Architecture

### Files modified

**`api/submit-service.js`**
Change `.insert(record)` to `.insert(record).select('id').single()` to retrieve the new row's UUID. Pass the ID to `sendTelegramNotification(record, id)`.

**`api/_lib/telegram.js`**
- `sendTelegramNotification(record, serviceId)` gains a `serviceId` parameter
- Message body includes an `inline_keyboard` with two buttons:
  - `[✅ Approve]` → callback_data: `approve_<uuid>`
  - `[❌ Delete]` → callback_data: `delete_<uuid>`

### Files created

**`api/_lib/cloudinary.js`**
Shared helper extracted from `delete-image.js`:
```js
export async function deleteCloudinaryImages(imagesCsv) { ... }
```
Parses a comma-separated image URL string, extracts each Cloudinary public ID, and calls the Cloudinary delete API for each. Failures are logged but do not throw — consistent with existing behavior.

`delete-image.js` is updated to import and use this helper (no behavior change).

**`api/telegram-webhook.js`**
New Vercel serverless POST handler:

1. Validates `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` env var — returns 401 if missing or wrong
2. Parses `callback_query` from the Telegram request body
3. Splits `callback_data` on `_` to get `action` (`approve` or `delete`) and `serviceId`
4. **Approve path:** `supabase.update({ approved: true }).eq('id', serviceId)`
5. **Delete path:**
   - Fetch service row to get `images` field
   - Call `deleteCloudinaryImages(row.images)` — non-blocking on failure
   - `supabase.delete().eq('id', serviceId)`
6. Calls `answerCallbackQuery(callbackQueryId)` to dismiss Telegram's loading spinner
7. Calls `editMessageText` to replace the original message with a status line:
   - Approve: appends `\n\n✅ Approved`
   - Delete: appends `\n\n🗑 Deleted`
   - On error: appends `\n\n⚠️ Error: <message>`

## Data Flow

```
User submits form
  → submit-service.js inserts record, gets UUID back
  → sendTelegramNotification(record, id) sends message with inline buttons

Admin taps button in Telegram
  → Telegram POSTs callback_query to /api/telegram-webhook
  → Webhook validates secret header
  → Parses action + UUID from callback_data
  → Performs Supabase operation (+ Cloudinary cleanup if delete)
  → answerCallbackQuery (dismiss spinner)
  → editMessageText (show result, remove buttons)
```

## Security

- `X-Telegram-Bot-Api-Secret-Token` header must match `TELEGRAM_WEBHOOK_SECRET` env var on every request
- Service IDs are Supabase-generated UUIDs — unguessable
- All Supabase operations use the service role key (server-side only)
- Unrecognized `callback_data` formats are silently ignored (answered with no-op)

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Vercel (existing) | Bot API calls |
| `TELEGRAM_CHAT_ID` | Vercel (existing) | Where to send notifications |
| `TELEGRAM_WEBHOOK_SECRET` | Vercel (new) | Validate incoming webhook requests |

## One-time Setup

After deploying, register the webhook URL with Telegram once:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Expected response: `{"ok":true,"result":true,"description":"Webhook was set"}`

## Error Handling

| Scenario | Behavior |
|---|---|
| Invalid/missing secret header | 401, no action |
| Service ID not found in DB | `answerCallbackQuery` with "Not found", edit message |
| Supabase operation fails | `answerCallbackQuery` with error text, edit message |
| Cloudinary deletion fails | Logged, non-blocking — DB delete proceeds |
| Unknown callback_data format | `answerCallbackQuery` with no-op, return 200 |

## Testing

- Unit test: `sendTelegramNotification` now includes `inline_keyboard` in the request body when `serviceId` is provided
- Unit test: webhook handler returns 401 on bad/missing secret header
- Unit test: webhook approve path calls Supabase update with correct ID
- Unit test: webhook delete path fetches row, calls Cloudinary delete, calls Supabase delete
- Manual: submit a test listing, tap Approve/Delete in Telegram, verify DB state and message edit
