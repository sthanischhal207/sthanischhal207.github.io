import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../worker/contact.js';

const ORIGIN = 'https://portfolio.example';
const good = { fullName: 'Ada', email: 'ada@example.com', subject: 'Hi', message: 'Hello\nthere', turnstileToken: 'tok' };

let sent, turnstileOk, limiterAllows, limiterCalls, fetchCalls;

function makeEnv(overrides = {}) {
  return {
    ALLOWED_ORIGINS: ORIGIN,
    CONTACT_FROM: 'noreply@example.com',
    CONTACT_TO: 'owner@example.com',
    TURNSTILE_SECRET: 'secret',
    EMAIL: { send: async msg => { sent.push(msg); return { messageId: 'm1' }; } },
    CONTACT_LIMITER: { limit: async ({ key }) => { limiterCalls.push(key); return { success: limiterAllows }; } },
    ...overrides,
  };
}

function req(body, { method = 'POST', origin = ORIGIN, type = 'application/json', ip = '1.1.1.1', raw } = {}) {
  const headers = { 'content-type': type, 'cf-connecting-ip': ip };
  if (origin) headers.origin = origin;
  const init = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') init.body = raw ?? JSON.stringify(body);
  return new Request('https://portfolio.example/api/contact', init);
}

async function call(body, opts, env = makeEnv()) {
  const res = await handleContact(req(body, opts), env);
  return { status: res.status, body: await res.json(), headers: res.headers };
}

beforeEach(() => {
  sent = []; turnstileOk = true; limiterAllows = true; limiterCalls = []; fetchCalls = [];
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url, init });
    return new Response(JSON.stringify({ success: turnstileOk }), { status: 200 });
  };
});

test('rejects non-POST', async () => assert.equal((await call(null, { method: 'GET' })).status, 405));
test('rejects wrong origin', async () => assert.equal((await call(good, { origin: 'https://evil.example' })).status, 403));
test('rejects missing origin', async () => assert.equal((await call(good, { origin: '' })).status, 403));
test('rejects non-JSON content type', async () => assert.equal((await call(good, { type: 'text/plain' })).status, 415));
test('rejects body over 10 KB', async () => assert.equal((await call(null, { raw: 'x'.repeat(20000) })).status, 413));
test('rejects broken JSON', async () => assert.equal((await call(null, { raw: '{nope' })).status, 400));
test('rejects JSON array', async () => assert.equal((await call(null, { raw: '[1]' })).status, 400));

test('fails closed when config is missing', async () => {
  const r = await call(good, {}, makeEnv({ CONTACT_TO: undefined }));
  assert.equal(r.status, 500);
  assert.equal(sent.length, 0);
});

test('rate limit runs before Turnstile and blocks', async () => {
  limiterAllows = false;
  const r = await call(good);
  assert.equal(r.status, 429);
  assert.equal(fetchCalls.length, 0, 'Turnstile must not be called when rate limited');
  assert.deepEqual(limiterCalls, ['1.1.1.1']);
});

test('missing Turnstile token is rejected', async () => {
  const r = await call({ ...good, turnstileToken: '' });
  assert.equal(r.status, 403);
  assert.equal(sent.length, 0);
});

test('failed Turnstile check is rejected', async () => {
  turnstileOk = false;
  const r = await call(good);
  assert.equal(r.status, 403);
  assert.equal(sent.length, 0);
});

test('Turnstile receives secret, token and client IP', async () => {
  await call(good);
  const form = fetchCalls[0].init.body;
  assert.equal(form.get('secret'), 'secret');
  assert.equal(form.get('response'), 'tok');
  assert.equal(form.get('remoteip'), '1.1.1.1');
});

test('Turnstile outage returns 503', async () => {
  globalThis.fetch = async () => new Response('', { status: 500 });
  assert.equal((await call(good)).status, 503);
});

test('honeypot fakes success and sends nothing', async () => {
  const r = await call({ ...good, website: 'spam' });
  assert.equal(r.status, 200);
  assert.equal(sent.length, 0);
});

test('missing field is rejected', async () => assert.equal((await call({ ...good, message: '' })).status, 400));
test('over-long message is rejected', async () => assert.equal((await call({ ...good, message: 'x'.repeat(5001) })).status, 400));
test('invalid email is rejected', async () => assert.equal((await call({ ...good, email: 'a@b' })).status, 400));
test('header injection in email is rejected', async () => assert.equal((await call({ ...good, email: 'a@b.co\r\nBcc: x@y.com' })).status, 400));
test('non-string field is rejected', async () => assert.equal((await call({ ...good, fullName: { $gt: '' } })).status, 400));

test('valid message is sent as plain text with safe headers', async () => {
  const r = await call({ ...good, subject: 'Hi\r\nBcc: x@y.com' });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(sent.length, 1);
  const m = sent[0];
  assert.equal(m.to, 'owner@example.com');
  assert.equal(m.replyTo, 'ada@example.com');
  assert.equal(m.from.email, 'noreply@example.com');
  assert.ok(!m.subject.includes('\n') && !m.subject.includes('\r'));
  assert.equal(m.html, undefined);
  assert.match(m.text, /Hello\nthere/);
});

test('send failure returns generic 502', async () => {
  const env = makeEnv({ EMAIL: { send: async () => { const e = new Error('boom'); e.code = 'E_DELIVERY_FAILED'; throw e; } } });
  const r = await call(good, {}, env);
  assert.equal(r.status, 502);
  assert.ok(!JSON.stringify(r.body).includes('E_DELIVERY_FAILED'));
});

test('responses never leak secrets', async () => {
  const r = await call(good);
  assert.ok(!JSON.stringify(r.body).includes('secret'));
  assert.ok(!JSON.stringify(r.body).includes('owner@example.com'));
});
