// Worker entry: API routes first, everything else is served from the built site (dist/).
// wrangler.jsonc runs this Worker first only for /api/*; other paths go straight to assets.

import { handleContact } from './contact.js';
import { handleGallery } from './gallery.js';
import { json } from './http.js';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname === '/api/gallery') return handleGallery(request, env, ctx);
    if (pathname.startsWith('/api/')) return json(404, { error: 'Not found.' });

    return env.ASSETS.fetch(request);
  },
};
