// POST /api/contact — contact form → email to the owner's verified inbox.
//
// Check order (CLAUDE.md, decision D14):
//   POST + JSON → origin allowlist → 10 KB cap → rate limit by IP → Turnstile
//   → honeypot → field limits + control-char stripping → send
//
// Bindings / vars (wrangler.jsonc): EMAIL (send_email), CONTACT_LIMITER (ratelimit),
//   ALLOWED_ORIGINS, CONTACT_FROM
// Secrets (dashboard / .dev.vars): TURNSTILE_SECRET, CONTACT_TO

import { json, methodNotAllowed } from './http.js';

export const LIMITS = { fullName: 100, email: 254, subject: 150, message: 5000 };
const MAX_BODY_BYTES = 10 * 1024;
const MAX_TOKEN_LENGTH = 2048;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const FAIL_SEND = 'Could not send right now. Please email me directly.';

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
}

// Remove control characters; single-line fields also lose CR/LF.
export function clean(value, { multiline = false } = {}) {
  if (typeof value !== 'string') return '';
  const pattern = multiline
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
    : /[\u0000-\u001F\u007F]/g;
  return value.replace(pattern, multiline ? '' : ' ').trim();
}

// Read the body without ever holding more than MAX_BODY_BYTES in memory.
async function readLimited(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) throw new Error('too_large');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('too_large');
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) { all.set(c, offset); offset += c.byteLength; }
  return new TextDecoder().decode(all);
}

async function verifyTurnstile(env, token, ip) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const r = await fetch(SITEVERIFY_URL, { method: 'POST', body: form });
  if (!r.ok) throw new Error('turnstile_unavailable');
  const result = await r.json();
  return result && result.success === true;
}

export async function handleContact(request, env) {
  if (request.method !== 'POST') return methodNotAllowed('POST');

  if (!String(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return json(415, { error: 'Unsupported content type.' });
  }

  if (!allowedOrigins(env).includes(request.headers.get('origin') || '')) {
    return json(403, { error: 'Forbidden.' });
  }

  if (!env.TURNSTILE_SECRET || !env.CONTACT_TO || !env.CONTACT_FROM || !env.EMAIL || !env.CONTACT_LIMITER) {
    console.error('contact: missing configuration');
    return json(500, { error: FAIL_SEND });
  }

  let raw;
  try {
    raw = await readLimited(request);
  } catch (err) {
    return json(err.message === 'too_large' ? 413 : 400, { error: 'Invalid request.' });
  }

  const ip = request.headers.get('cf-connecting-ip') || '';

  // Rate limit before Turnstile (D14): a free local check before any network call.
  try {
    const { success } = await env.CONTACT_LIMITER.limit({ key: ip || 'unknown' });
    if (!success) return json(429, { error: 'Too many messages. Please try again later.' });
  } catch (err) {
    console.error('contact: rate limiter error', err.message);
    return json(503, { error: 'Service busy. Please try again shortly.' });
  }

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return json(400, { error: 'Invalid request.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { error: 'Invalid request.' });
  }

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return json(403, { error: 'Please complete the verification and try again.' });
  }
  try {
    if (!(await verifyTurnstile(env, token, ip))) {
      return json(403, { error: 'Please complete the verification and try again.' });
    }
  } catch (err) {
    console.error('contact: turnstile error', err.message);
    return json(503, { error: 'Service busy. Please try again shortly.' });
  }

  // Honeypot: bots fill the hidden field. Pretend success so they learn nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(200, { ok: true });
  }

  const data = {
    fullName: clean(body.fullName),
    email: clean(body.email),
    subject: clean(body.subject),
    message: clean(body.message, { multiline: true }),
  };
  for (const [field, max] of Object.entries(LIMITS)) {
    if (!data[field] || data[field].length > max) {
      return json(400, { error: 'Please fill in every field (and keep it reasonably short).', field });
    }
  }
  if (!EMAIL_RE.test(data.email)) {
    return json(400, { error: 'Please enter a valid email address.', field: 'email' });
  }

  // Plain text only: nothing the sender writes can render as HTML in the inbox.
  const text = [
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Subject: ${data.subject}`,
    '',
    data.message,
    '',
    '—',
    'Sent from the contact form on your portfolio.',
  ].join('\n');

  try {
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: { email: env.CONTACT_FROM, name: 'Portfolio contact form' },
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`.slice(0, 200),
      text,
    });
  } catch (err) {
    console.error('contact: send failed', err && (err.code || err.name));
    return json(502, { error: FAIL_SEND });
  }

  return json(200, { ok: true });
}
