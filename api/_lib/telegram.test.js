import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildMessageText, sendTelegramNotification } from './telegram.js';

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
});

describe('buildMessageText', () => {
  const base = {
    title: 'Test Business',
    category: 'Manicure / Nail Services',
    phone: '+1 (512) 555-0001',
    email: 'test@example.com',
  };

  it('includes title, category, phone, email', () => {
    const text = buildMessageText(base);
    expect(text).toContain('<b>Test Business</b>');
    expect(text).toContain('Manicure / Nail Services');
    expect(text).toContain('+1 (512) 555-0001');
    expect(text).toContain('test@example.com');
  });

  it('omits address and website lines when not provided', () => {
    const text = buildMessageText(base);
    expect(text).not.toContain('📍');
    expect(text).not.toContain('🌐');
  });

  it('includes address and website when provided', () => {
    const text = buildMessageText({ ...base, address: '123 Main St', website: 'https://example.com' });
    expect(text).toContain('📍 123 Main St');
    expect(text).toContain('🌐 https://example.com');
  });

  it('HTML-escapes < > & " in user fields', () => {
    const text = buildMessageText({ ...base, title: '<script>alert("xss")</script>' });
    expect(text).toContain('&lt;script&gt;');
    expect(text).not.toContain('<script>');
  });

  it('HTML-escapes & in user fields', () => {
    const text = buildMessageText({ ...base, title: 'Bread & Butter Co' });
    expect(text).toContain('Bread &amp; Butter Co');
    expect(text).not.toContain('Bread & Butter Co');
  });

  it('produces identical output from record shape and Supabase row shape (same field names)', () => {
    // Supabase column names match the record fields used in the message
    const record = { title: 'Biz', category: 'Cat', phone: '123', email: 'a@b.com' };
    const row = { title: 'Biz', category: 'Cat', phone: '123', email: 'a@b.com', description_en: 'ignored', approved: false };
    expect(buildMessageText(record)).toBe(buildMessageText(row));
  });
});

describe('sendTelegramNotification', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = '12345';
  });

  it('does nothing when env vars are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await sendTelegramNotification({ title: 'T', category: 'C', phone: '1', email: 'e@e.com' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does nothing when TELEGRAM_CHAT_ID is missing', async () => {
    delete process.env.TELEGRAM_CHAT_ID;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await sendTelegramNotification({ title: 'T', category: 'C', phone: '1', email: 'e@e.com' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a message with parse_mode HTML', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await sendTelegramNotification({ title: 'T', category: 'C', phone: '1', email: 'e@e.com' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.parse_mode).toBe('HTML');
    expect(body.chat_id).toBe('12345');
  });

  it('includes inline_keyboard with approve and delete buttons when serviceId is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await sendTelegramNotification(
      { title: 'T', category: 'C', phone: '1', email: 'e@e.com' },
      'abc-uuid-123'
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const buttons = body.reply_markup.inline_keyboard[0];
    expect(buttons[0].callback_data).toBe('approve_abc-uuid-123');
    expect(buttons[1].callback_data).toBe('delete_abc-uuid-123');
  });

  it('does not include inline_keyboard when serviceId is omitted', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await sendTelegramNotification({ title: 'T', category: 'C', phone: '1', email: 'e@e.com' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.reply_markup).toBeUndefined();
  });
});
