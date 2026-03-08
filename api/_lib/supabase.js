import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

export async function fetchApprovedServices({ category, limit, lang = 'en' } = {}) {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('services')
    .select('*')
    .eq('approved', true)
    .order('submitted_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...row,
    submittedAt: row.submitted_at,
    description:
      lang === 'ua'
        ? row.description_ua || row.description_en
        : row.description_en || row.description_ua,
  }));
}
