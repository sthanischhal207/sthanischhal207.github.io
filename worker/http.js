// Shared response helpers for the API routes.
// API responses come from the Worker, not from static assets, so `public/_headers`
// doesn't apply to them; the security headers are set here instead.

const API_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Robots-Tag': 'noindex',
};

export function json(status, body, { cache = 'no-store', headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
      ...API_SECURITY_HEADERS,
      ...headers,
    },
  });
}

export function methodNotAllowed(allow) {
  return json(405, { error: 'Method not allowed.' }, { headers: { Allow: allow } });
}
