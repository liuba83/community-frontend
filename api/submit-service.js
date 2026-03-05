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

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Services';

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const fields = {
    title: businessName.trim(),
    description_en: descriptionEn.trim(),
    description_ua: descriptionUa.trim(),
    category,
    phone: phone.trim(),
    email: email.trim(),
    approved: false,
  };

  if (address?.trim()) fields.address = address.trim();
  if (website?.trim()) fields.website = website.trim();
  if (instagram?.trim()) fields.instagram = instagram.trim();
  if (facebook?.trim()) fields.facebook = facebook.trim();
  if (linkedin?.trim()) fields.linkedin = linkedin.trim();

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', err);
      return res.status(500).json({ error: 'Failed to submit' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Failed to submit' });
  }
}
