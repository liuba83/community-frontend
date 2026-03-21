import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./_lib/supabase.js', () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('./_lib/cloudinary.js', () => ({ deleteCloudinaryImages: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./_lib/telegram.js', () => ({
  buildMessageText: vi.fn().mockReturnValue('📋 <b>Test Business</b>'),
}));

import handler from './telegram-webhook.js';
import { getSupabaseAdmin } from './_lib/supabase.js';
import { deleteCloudinaryImages } from './_lib/cloudinary.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const WEBHOOK_SECRET = 'test-webhook-secret-32chars-long!!';
const NO_SECRET = Symbol('no-secret');

function makeReq({ secret = WEBHOOK_SECRET, body = {}, method = 'POST' } = {}) {
  const headers = secret === NO_SECRET
    ? {}
    : { 'x-telegram-bot-api-secret-token': secret };
  return { method, headers, body };
}

function makeRes() {
  const res = { _status: 200, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

function makeCbq({ data = `approve_${VALID_UUID}`, chatId = 42, messageId = 7 } = {}) {
  return {
    callback_query: {
      id: 'cq-id-1',
      data,
      message: { chat: { id: chatId }, message_id: messageId, text: 'original' },
    },
  };
}

function mockSupabase({ row = null, fetchError = null, updateError = null, deleteError = null } = {}) {
  const single = vi.fn().mockResolvedValue({ data: row, error: fetchError });
  const updateEq = vi.fn().mockResolvedValue({ error: updateError });
  const deleteEq = vi.fn().mockResolvedValue({ error: deleteError });

  const fromMock = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
    update: vi.fn().mockReturnValue({ eq: updateEq }),
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
  });
  getSupabaseAdmin.mockReturnValue({ from: fromMock });
  return { single, updateEq, deleteEq };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
  process.env.TELEGRAM_WEBHOOK_SECRET = WEBHOOK_SECRET;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_WEBHOOK_SECRET;
});

// --- auth ---

describe('authentication', () => {
  it('returns 401 when secret header is missing', async () => {
    const res = makeRes();
    await handler(makeReq({ secret: NO_SECRET }), res);
    expect(res._status).toBe(401);
  });

  it('returns 401 when secret header is wrong', async () => {
    const res = makeRes();
    await handler(makeReq({ secret: 'wrong-secret' }), res);
    expect(res._status).toBe(401);
  });

  it('returns 200 for a valid request', async () => {
    mockSupabase({ row: { id: VALID_UUID, approved: false, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq() }), res);
    expect(res._status).toBe(200);
  });
});

// --- non-button updates ---

describe('non-button updates', () => {
  it('returns 200 with no Supabase calls when callback_query is absent', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { message: { text: 'hello' } } }), res);
    expect(res._status).toBe(200);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});

// --- answerCallbackQuery timing ---

describe('answerCallbackQuery timing', () => {
  it('calls answerCallbackQuery before any Supabase operation', async () => {
    const calls = [];
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
      calls.push(url.includes('answerCallbackQuery') ? 'answer' : 'other');
      return Promise.resolve({ ok: true });
    }));
    mockSupabase({ row: { id: VALID_UUID, approved: false, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });

    const res = makeRes();
    await handler(makeReq({ body: makeCbq() }), res);

    expect(calls[0]).toBe('answer');
  });
});

// --- callback_data validation ---

describe('callback_data validation', () => {
  it('returns 200 and edits message for invalid UUID', async () => {
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: 'approve_not-a-uuid' }) }), res);
    expect(res._status).toBe(200);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('⚠️ Invalid request');
  });

  it('returns 200 and edits message for unknown action', async () => {
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `unknown_${VALID_UUID}` }) }), res);
    expect(res._status).toBe(200);
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});

// --- approve path ---

describe('approve path', () => {
  it('fetches the row, updates approved=true, edits message with ✅ Approved', async () => {
    mockSupabase({ row: { id: VALID_UUID, approved: false, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `approve_${VALID_UUID}` }) }), res);

    expect(res._status).toBe(200);
    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('✅ Approved');
    expect(editCall.parse_mode).toBe('HTML');
    expect(editCall.reply_markup).toEqual({ inline_keyboard: [] });
  });

  it('shows ℹ️ Already approved when row.approved is true', async () => {
    mockSupabase({ row: { id: VALID_UUID, approved: true, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `approve_${VALID_UUID}` }) }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('ℹ️ Already approved');
  });

  it('shows ⚠️ Not found when row is missing (PGRST116)', async () => {
    mockSupabase({ fetchError: { code: 'PGRST116', message: 'No rows' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `approve_${VALID_UUID}` }) }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('⚠️ Not found');
  });

  it('shows ⚠️ Error on other DB fetch errors', async () => {
    mockSupabase({ fetchError: { code: '500', message: 'connection refused' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `approve_${VALID_UUID}` }) }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('⚠️ Error');
  });

  it('shows ⚠️ Error when Supabase update fails', async () => {
    mockSupabase({
      row: { id: VALID_UUID, approved: false, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' },
      updateError: { message: 'update failed' },
    });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `approve_${VALID_UUID}` }) }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('⚠️ Error');
  });
});

// --- delete path ---

describe('delete path', () => {
  it('calls deleteCloudinaryImages, deletes from DB, edits message with 🗑 Deleted', async () => {
    const { deleteEq } = mockSupabase({ row: { id: VALID_UUID, approved: false, images: 'https://res.cloudinary.com/demo/image/upload/v1/img.jpg', title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `delete_${VALID_UUID}` }) }), res);

    expect(deleteCloudinaryImages).toHaveBeenCalledWith('https://res.cloudinary.com/demo/image/upload/v1/img.jpg');
    expect(deleteEq).toHaveBeenCalledWith('id', VALID_UUID);
    expect(res._status).toBe(200);
    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('🗑 Deleted');
  });

  it('shows ⚠️ Not found when row is missing (PGRST116)', async () => {
    mockSupabase({ fetchError: { code: 'PGRST116', message: 'No rows' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq({ data: `delete_${VALID_UUID}` }) }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.text).toContain('⚠️ Not found');
  });
});

// --- editMessageText format ---

describe('editMessageText format', () => {
  it('always uses parse_mode HTML and clears inline_keyboard', async () => {
    mockSupabase({ row: { id: VALID_UUID, approved: false, images: null, title: 'T', category: 'C', phone: '1', email: 'e@e.com' } });
    const res = makeRes();
    await handler(makeReq({ body: makeCbq() }), res);

    const editCall = JSON.parse(global.fetch.mock.calls.find(([url]) => url.includes('editMessageText'))[1].body);
    expect(editCall.parse_mode).toBe('HTML');
    expect(editCall.reply_markup).toEqual({ inline_keyboard: [] });
  });
});
