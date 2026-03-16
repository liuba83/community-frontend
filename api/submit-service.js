import { getSupabaseAdmin } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    category,
    businessName,
    descriptionEn,
    descriptionUa,
    phone,
    email,
    address,
    website,
    instagram,
    facebook,
    linkedin,
    imageUrls,
    honeypot,
  } = req.body || {};

  // Honeypot — silent reject
  if (honeypot) {
    return res.status(200).json({ success: true });
  }

  // Required field validation
  if (!category || !businessName?.trim() || !descriptionEn?.trim() || !descriptionUa?.trim() || !phone?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const record = {
    title: businessName.trim(),
    description_en: descriptionEn.trim(),
    description_ua: descriptionUa.trim(),
    category,
    phone: phone.trim(),
    email: email.trim(),
    approved: false,
  };

  if (address?.trim()) record.address = address.trim();
  if (website?.trim()) record.website = website.trim();
  if (instagram?.trim()) record.instagram = instagram.trim();
  if (facebook?.trim()) record.facebook = facebook.trim();
  if (linkedin?.trim()) record.linkedin = linkedin.trim();

  const validImageUrls = Array.isArray(imageUrls)
    ? imageUrls
        .filter((u) => typeof u === 'string' && u.startsWith('https://res.cloudinary.com/'))
        .slice(0, 5)
    : [];
  if (validImageUrls.length > 0) record.images = validImageUrls.join(',');

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('services').insert(record);
    if (error) throw error;

    // Fire-and-forget Telegram notification
    sendTelegramNotification(record).catch((err) =>
      console.error('Telegram notification failed:', err)
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Failed to submit' });
  }
}

async function sendTelegramNotification(record) {
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
