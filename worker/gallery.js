// GET /api/gallery — lists images in the public Google Drive folder.
//
// Vars (wrangler.jsonc): GALLERY_FOLDER_ID   Secret: GOOGLE_API_KEY
// The folder must be shared as "Anyone with the link → Viewer".
// Results are cached for 10 minutes with the Cache API, so Google is asked rarely.

import { json, methodNotAllowed } from './http.js';

export const ID_RE = /^[A-Za-z0-9_-]{10,128}$/;
const MAX_IMAGES = 500;
const CACHE_SECONDS = 600;
const FAIL = 'Could not load the gallery right now.';

// "my-poster_final.png" -> "my poster final"
export function titleFrom(name) {
  return String(name || '')
    .replace(/\.[A-Za-z0-9]{2,5}$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 120);
}

async function listImages(env) {
  const images = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${env.GALLERY_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'nextPageToken, files(id, name, description, imageMediaMetadata(width, height))',
      orderBy: 'createdTime desc',
      pageSize: '200',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      key: env.GOOGLE_API_KEY,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const r = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!r.ok) throw new Error(`drive_status_${r.status}`);
    const data = await r.json();

    for (const f of data.files || []) {
      if (!ID_RE.test(f.id)) continue; // only safe ids ever reach the browser
      const meta = f.imageMediaMetadata || {};
      images.push({
        id: f.id,
        title: titleFrom(f.description || f.name),
        w: Number.isFinite(meta.width) ? meta.width : null,
        h: Number.isFinite(meta.height) ? meta.height : null,
      });
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken && images.length < MAX_IMAGES);
  return images.slice(0, MAX_IMAGES);
}

export async function handleGallery(request, env, ctx, cache = globalThis.caches?.default) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed('GET, HEAD');

  if (!env.GOOGLE_API_KEY || !ID_RE.test(env.GALLERY_FOLDER_ID || '')) {
    console.error('gallery: missing or invalid configuration');
    return json(503, { error: 'Gallery is not set up yet.' });
  }

  // One cache entry for everyone, regardless of query string or method.
  const cacheKey = new Request(new URL('/api/gallery', request.url).toString(), { method: 'GET' });
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  let images;
  try {
    images = await listImages(env);
  } catch (err) {
    console.error('gallery: drive request failed', err.message);
    return json(502, { error: FAIL });
  }

  const response = json(200, { images }, { cache: `public, max-age=60, s-maxage=${CACHE_SECONDS}` });
  if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
