import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleGallery, titleFrom } from '../worker/gallery.js';

const FOLDER = '1AbCdEfGhIjKlMnOp_-x';
let calls, pages, waited;

const env = (o = {}) => ({ GOOGLE_API_KEY: 'KEY', GALLERY_FOLDER_ID: FOLDER, ...o });
const ctx = { waitUntil: p => waited.push(p) };

// Minimal stand-in for caches.default
function memoryCache() {
  const store = new Map();
  return {
    match: async r => store.get(r.url)?.clone(),
    put: async (r, res) => { store.set(r.url, res); },
    size: () => store.size,
  };
}

async function call(method = 'GET', e = env(), cache = null) {
  const res = await handleGallery(new Request('https://portfolio.example/api/gallery', { method }), e, ctx, cache);
  return { status: res.status, headers: res.headers, body: method === 'HEAD' ? null : await res.json() };
}

beforeEach(() => {
  calls = []; pages = []; waited = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    const p = pages.shift();
    if (p instanceof Error) throw p;
    if (p.status) return new Response('{}', { status: p.status });
    return new Response(JSON.stringify(p), { status: 200 });
  };
});

test('not configured returns 503', async () => assert.equal((await call('GET', env({ GOOGLE_API_KEY: '' }))).status, 503));
test('folder id with injection is rejected', async () => {
  const r = await call('GET', env({ GALLERY_FOLDER_ID: "abc' or 1=1" }));
  assert.equal(r.status, 503);
  assert.equal(calls.length, 0);
});
test('POST is not allowed', async () => assert.equal((await call('POST')).status, 405));

test('lists images, drops unsafe ids, paginates', async () => {
  pages = [
    { files: [
      { id: '1AAAAAAAAAAAA', name: 'event_poster-final.png', imageMediaMetadata: { width: 1080, height: 1350 } },
      { id: 'bad id"><script>', name: 'x.png' },
    ], nextPageToken: 'T' },
    { files: [{ id: '2BBBBBBBBBBBB', name: 'logo.jpg', description: 'Club logo' }] },
  ];
  const r = await call();
  assert.equal(r.status, 200);
  assert.equal(r.body.images.length, 2);
  assert.equal(r.body.images[0].title, 'event poster final');
  assert.equal(r.body.images[1].title, 'Club logo');
  assert.equal(r.body.images[0].w, 1080);
  assert.equal(r.body.images[1].w, null);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].includes('pageToken=T'));
  assert.match(r.headers.get('cache-control'), /s-maxage=600/);
  assert.ok(!JSON.stringify(r.body).includes('KEY'));
});

test('second request is served from cache', async () => {
  const cache = memoryCache();
  pages = [{ files: [{ id: '1AAAAAAAAAAAA', name: 'a.png' }] }];
  await call('GET', env(), cache);
  await Promise.all(waited);
  const r = await call('GET', env(), cache);
  assert.equal(r.status, 200);
  assert.equal(r.body.images.length, 1);
  assert.equal(calls.length, 1, 'Google asked only once');
});

test('Drive error returns generic 502', async () => {
  pages = [{ status: 403 }];
  const r = await call();
  assert.equal(r.status, 502);
  assert.ok(!JSON.stringify(r.body).includes('403'));
});

test('network failure returns 502', async () => {
  pages = [new Error('net')];
  assert.equal((await call()).status, 502);
});

test('titleFrom strips control characters and caps length', () => {
  assert.equal(titleFrom('a\u0000b.png'), 'ab');
  assert.equal(titleFrom('x'.repeat(300) + '.png').length, 120);
});
