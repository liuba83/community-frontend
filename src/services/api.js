const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchServices({ category, limit } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (limit) params.set('limit', String(limit));

  const url = `${API_BASE}/services${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`API error: ${response.status}${rawBody ? ` - ${rawBody.slice(0, 160)}` : ''}`);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Expected JSON from ${url}, but got different content. ` +
      `Set VITE_API_BASE_URL to a valid backend URL or run with an API server. ` +
      `Response starts with: ${rawBody.slice(0, 80)}`
    );
  }
}
