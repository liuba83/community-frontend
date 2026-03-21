import { getSupabaseAdmin } from './_lib/supabase.js';
import { buildMessageText } from './_lib/telegram.js';
import { deleteCloudinaryImages } from './_lib/cloudinary.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function callTelegram(token, method, body) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`Telegram ${method} failed:`, err);
  }
}

async function editMessage(token, chatId, messageId, baseText, statusLine) {
  await callTelegram(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: `${baseText}\n\n${statusLine}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [] },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const cbq = req.body?.callback_query;
  if (!cbq) return res.status(200).json({ ok: true });

  // Dismiss Telegram's loading spinner immediately — must happen within 10 seconds.
  // Errors are intentionally swallowed; the handler continues regardless.
  await callTelegram(token, 'answerCallbackQuery', { callback_query_id: cbq.id });

  const chatId = cbq.message?.chat?.id;
  const messageId = cbq.message?.message_id;

  const data = cbq.data || '';
  const sep = data.indexOf('_');
  const action = sep > -1 ? data.slice(0, sep) : '';
  const serviceId = sep > -1 ? data.slice(sep + 1) : '';

  if (!UUID_REGEX.test(serviceId)) {
    await editMessage(token, chatId, messageId, '', '⚠️ Invalid request');
    return res.status(200).json({ ok: true });
  }

  if (action !== 'approve' && action !== 'delete') {
    await editMessage(token, chatId, messageId, '', '⚠️ Unknown action');
    return res.status(200).json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchError } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (fetchError) {
    const statusLine = fetchError.code === 'PGRST116'
      ? '⚠️ Not found'
      : `⚠️ Error: ${fetchError.message}`;
    await editMessage(token, chatId, messageId, '', statusLine);
    return res.status(200).json({ ok: true });
  }

  const messageBase = buildMessageText(row);

  if (action === 'approve') {
    if (row.approved) {
      await editMessage(token, chatId, messageId, messageBase, 'ℹ️ Already approved');
      return res.status(200).json({ ok: true });
    }
    const { error } = await supabase
      .from('services')
      .update({ approved: true })
      .eq('id', serviceId);
    if (error) {
      await editMessage(token, chatId, messageId, messageBase, `⚠️ Error: ${error.message}`);
      return res.status(200).json({ ok: true });
    }
    await editMessage(token, chatId, messageId, messageBase, '✅ Approved');
    return res.status(200).json({ ok: true });
  }

  // delete path
  await deleteCloudinaryImages(row.images);
  const { error: deleteError } = await supabase.from('services').delete().eq('id', serviceId);
  if (deleteError) {
    await editMessage(token, chatId, messageId, messageBase, `⚠️ Error: ${deleteError.message}`);
    return res.status(200).json({ ok: true });
  }
  await editMessage(token, chatId, messageId, messageBase, '🗑 Deleted');
  return res.status(200).json({ ok: true });
}
