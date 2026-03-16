export async function sendTelegramNotification(record) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    '📋 <b>New service submission</b>',
    '',
    `<b>${record.title}</b>`,
    `📂 ${record.category}`,
    `📞 ${record.phone}`,
    `✉️ ${record.email}`,
    record.address ? `📍 ${record.address}` : null,
    record.website ? `🌐 ${record.website}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}
