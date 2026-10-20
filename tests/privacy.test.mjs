import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createStudentQrDataUrl, MAX_STUDENT_QR_URL_LENGTH } from '../src/student-qr.js';
import { encodeStudentViewPayload, decodeStudentViewPayload } from '../src/teacher-toolkit.js';

const base = new URL('../', import.meta.url);
const storage = new Map([
  ['multilingual_translator_my_case_pw_v1', 'legacy-test-password'],
  ['multilingual_translator_visitor_id_v1', 'old-test-visitor'],
  ['multilingual_translator_usage_stats_cache_v2', '{}'],
  ['multilingual_translator_my_case_ids_v1', '["11111111-1111-1111-1111-111111111111"]'],
  ['multilingual_translator_pref_lang_v1', 'vi'],
  ['other_app_record', 'keep']
]);
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};
let calls = [];
globalThis.fetch = async (url, options) => {
  calls.push({ url, body: JSON.parse(options.body) });
  return { ok: true, text: async () => JSON.stringify({ id: '22222222-2222-2222-2222-222222222222', status: 'pending' }) };
};
const service = await import('../src/case-sharing-service.js');
const valid = {
  title: 'Synthetic test', lesson_goal: 'Synthetic classroom review only.',
  author_passcode: 'synthetic-test-password',
  confirmed_factual: true, confirmed_no_pii: true, confirmed_public_rights: true
};
test('legacy cleanup removes only password and analytics keys', () => {
  for (const key of ['multilingual_translator_my_case_pw_v1', 'multilingual_translator_visitor_id_v1', 'multilingual_translator_usage_stats_cache_v2']) assert.equal(storage.has(key), false);
  assert.equal(storage.get('other_app_record'), 'keep');
  assert.equal(storage.get('multilingual_translator_pref_lang_v1'), 'vi');
  assert.deepEqual(service.getSavedMyCaseIds(), ['11111111-1111-1111-1111-111111111111']);
});
test('submit and resubmit require each explicit boolean confirmation before network', async () => {
  for (const key of ['confirmed_factual', 'confirmed_no_pii', 'confirmed_public_rights']) {
    for (const value of [undefined, false, 'true', 'false']) {
      const invalid = { ...valid, [key]: value };
      const before = calls.length;
      assert.equal((await service.submitLessonCase(invalid)).ok, false);
      assert.equal((await service.resubmitLessonCase('test-id', valid.author_passcode, invalid)).ok, false);
      assert.equal(calls.length, before);
    }
  }
});
test('valid case submission preserves backend contract but never persists password', async () => {
  const res = await service.submitLessonCase(valid);
  assert.equal(res.ok, true);
  const req = calls.at(-1);
  assert.equal(new URL(req.url).hostname, 'tjrrtgdhtjdkofwqnxnz.supabase.co');
  assert.equal(req.body.p_confirmed_factual, true);
  assert.equal(req.body.p_confirmed_no_pii, true);
  assert.equal(req.body.p_confirmed_public_rights, true);
  assert.equal(req.body.p_author_passcode, valid.author_passcode);
  assert.equal(storage.has('multilingual_translator_my_case_pw_v1'), false);
  assert(!JSON.stringify([...storage]).includes(valid.author_passcode));
  assert(service.getSavedMyCaseIds().includes(res.id));
  assert.equal((await service.resubmitLessonCase(res.id, valid.author_passcode, valid)).ok, true);
  assert(calls.at(-1).url.endsWith('/resubmit_translation_case'));
});
test('student payload round trip and QR use data URL without any network', async () => {
  const encoded = encodeStudentViewPayload('합성 테스트.pptx', 'en', [{ko:'안녕',target:'Hello',loc:'1'}]);
  assert.equal(decodeStudentViewPayload(encoded).pairs[0].target, 'Hello');
  const url = `https://example.test/Translation/#student-view=${encoded}`;
  const before = calls.length;
  const qr = createStudentQrDataUrl(url);
  assert(qr.dataUrl.startsWith('data:image/gif;base64,'));
  assert.equal(calls.length, before);
  assert(createStudentQrDataUrl('x'.repeat(MAX_STUDENT_QR_URL_LENGTH)).dataUrl);
  assert.equal(createStudentQrDataUrl('x'.repeat(MAX_STUDENT_QR_URL_LENGTH + 1)).dataUrl, null);
  assert.equal(createStudentQrDataUrl('').dataUrl, null);
});
test('shipped app contains no external QR or analytics calls or forced consent', async () => {
  const app = await fs.readFile(new URL('app.js', base), 'utf8');
  const svc = await fs.readFile(new URL('src/case-sharing-service.js', base), 'utf8');
  assert(!/api\.qrserver\.com|bumpTranslationUsageCounter|registerVisitorAndFetchStats/.test(app));
  assert(!/oaavmecavooowuayjxjn|register_translation_visitor|record_translation_event|callStatsRpc/.test(svc));
  assert(!/confirmed_(?:factual|no_pii|public_rights): true/.test(app));
  assert(!/localStorage\.setItem\(MY_CASE_PASSCODE_STORAGE_KEY/.test(svc));
  const html = await fs.readFile(new URL('index.html', base), 'utf8');
  for (const id of ['chk-case-factual', 'chk-case-nopii', 'chk-case-rights']) {
    const input = html.match(new RegExp(`<input[^>]+id="${id}"[^>]*>`))?.[0];
    assert(input && !/\bchecked\b|\bhidden\b/.test(input));
  }
});

test('first-install offline reload resolves versioned modules from current app cache', async () => {
  const { runInNewContext } = await import('node:vm');
  const listeners = {};
  const entries = new Map();
  const origin = 'https://example.test';
  const normalize = input => new URL(typeof input === 'string' ? input : input.url, `${origin}/Translation/`).href;
  const cache = {
    async addAll(paths) { for (const path of paths) entries.set(normalize(path), { cached: path }); },
    async match(request, options = {}) {
      const url = new URL(normalize(request));
      if (options.ignoreSearch) url.search = '';
      return entries.get(url.href);
    }
  };
  const code = await fs.readFile(new URL('sw.js', base), 'utf8');
  runInNewContext(code, {
    URL, location: { origin },
    self: { addEventListener: (name, fn) => { listeners[name] = fn; }, skipWaiting: async () => {} },
    caches: { open: async name => { assert.equal(name, 'translation-v20-privacy1'); return cache; } },
    fetch: async () => { throw new Error('offline'); }
  });
  let work;
  listeners.install({ waitUntil: promise => { work = promise; } });
  await work;
  for (const path of ['app.js?v=20261020-privacy1', 'src/student-qr.js?v=20261020-privacy1', 'vendor/qrcode-generator.mjs']) {
    listeners.fetch({ request: { method: 'GET', url: `${origin}/Translation/${path}`, mode: 'cors' }, respondWith: promise => { work = promise; } });
    assert(await work, `offline cache missed ${path}`);
  }
});
