export async function fetchApprovedServices({ category, limit } = {}) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Services';

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  const params = new URLSearchParams();

  // Only return approved listings
  let filterFormula = '{approved} = TRUE()';
  if (category) {
    filterFormula = `AND({approved} = TRUE(), {category} = '${category.replace(/'/g, "\\'")}')`;
  }
  params.set('filterByFormula', filterFormula);

  // Sort by newest first
  params.set('sort[0][field]', 'submittedAt');
  params.set('sort[0][direction]', 'desc');

  if (limit) {
    params.set('maxRecords', String(limit));
  }

  const response = await fetch(`${AIRTABLE_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }

  const data = await response.json();

  return data.records.map((record) => ({
    id: record.id,
    ...record.fields,
  }));
}
