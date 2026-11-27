# Security rules

Always follow these. The repo is **public**: anything committed (code, config, history) can be read by anyone, forever.

## Secrets and private data
- Secrets live only in `.dev.vars` (local, gitignored) and the Cloudflare dashboard (Worker → Settings → Variables and Secrets, type **Secret**). Never in `wrangler.jsonc`, code, docs, tests or commit messages.
- Current secrets: `GOOGLE_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO` (personal inbox), `GITHUB_TOKEN` (admin saves; fine-grained, this repo only, Contents read/write, with an expiry date).
- Treat the owner's **personal email address** as private. It must not appear in the repo, `wrangler.jsonc` included. (See open question Q2 for how the contact form gets it.)
- Before every commit: `git diff --cached` contains no keys, tokens or personal email, and no `.dev.vars` or `.env*` is staged.
- If a secret is ever committed: rotate it immediately (new key in Google/Cloudflare, delete the old one). Removing the commit isn't enough, because history is public.
- Restrict every key to the minimum: the Google key works only for the **Drive API** and only from Cloudflare (API restriction), and any GitHub token is fine-grained to this one repo.

## Content Security Policy and headers (`public/_headers`)
- No inline `<script>`, no inline `<style>`, no `on*=` attributes, no `javascript:` URLs. Never add `unsafe-inline` or `unsafe-eval` to the CSP.
- Inline `style="--delay:..."` attributes are allowed only through `style-src-attr 'unsafe-inline'` (CSS custom properties for animation delays). Don't extend this to `style-src`.
- Every third-party origin is listed on purpose, with a comment saying why. The current allowlist:
  - `fonts.googleapis.com`, `fonts.gstatic.com`: Inter / JetBrains Mono fonts
  - `cdnjs.cloudflare.com`: Font Awesome (pinned version + SRI hash)
  - `lh3.googleusercontent.com`: gallery images from Drive
  - `challenges.cloudflare.com`: Turnstile (script, frame, connect)
- Required headers on every response: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'` (+ `X-Frame-Options: DENY`).
- Third-party CSS or JS from a CDN must pin an exact version and carry an `integrity` (SRI) hash.

## API rules (`worker/`)
- `public/_headers` only applies to static files. API responses set their own headers in `worker/http.js` (`nosniff`, `default-src 'none'` CSP, `noindex`). Keep both in sync.
- Each route accepts only its method(s). Anything else gets a 405.
- Validate every input on the server. Never trust the client-side checks in `script.js`.
- Error responses are generic ("Invalid request.", "Could not send right now."). No stack traces, upstream status codes, keys or internal names. Log details with `console.error` (visible only in the Cloudflare dashboard).
- Send only the fields the page needs.
- `/api/contact`:
  - The order is fixed in CLAUDE.md.
  - Plain-text email only.
  - Strip control characters (so header injection is impossible).
  - `reply_to` = the validated sender address.
  - `Cache-Control: no-store`.
  - The honeypot returns a fake success.
- `/api/gallery`:
  - Validate the folder id and every file id against `^[A-Za-z0-9_-]{10,128}$`.
  - Clean titles (strip control characters, max 120 chars).
  - Cap at 500 images and cache 10 min.
- `/admin*` and `/api/admin/*`:
  - Cloudflare Access allows only the owner's email.
  - The Worker also verifies the `Cf-Access-Jwt-Assertion` JWT: signature against the team's public keys, `aud` = the Access app's tag, not expired, and email = owner. Any failure → 403.
  - Admin writes only accept the known data files and `public/images/**`, never arbitrary paths. Validate the JSON shape before committing.
  - Uploads: images only (PNG/JPEG/WebP/SVG), size cap, sanitized file names. SVGs get the same script/handler checks as above.
- Contact messages in D1 are personal data: shown only in the admin, never logged in full, deleted on request.
- Front end renders API data with `textContent` / `createElement`, never `innerHTML`.

## Dependencies
- Keep dependencies few: `astro`, `wrangler` (dev). Ask before adding any other package.
- Commit `package-lock.json`. Run `npm audit` before merging dependency changes.
- Self-host images and logos (e.g. skill SVGs in `public/images/`) rather than hot-linking.
- Downloaded SVGs: check them for `<script>`, `on*=`, `javascript:`, `<foreignObject>` and external `href` before committing.

## Deploys and accounts
- Merging into `main` deploys to production. Only merge after checks pass and the owner approves.
- Ask before: DNS changes, deleting records, disabling GitHub Pages, production deploys, changing Cloudflare Access/Zero Trust policies.
- Cloudflare and GitHub accounts: 2FA on, recovery codes stored safely.
- Disable the `*.workers.dev` URL for the production Worker once the custom domain works, so the site exists at one address only.

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Wrote the security rules.
- **How:** From CLAUDE.md's non-negotiable rules, the security work already built on `vercel-backend` (CSP, SRI, validation, honeypot), and the fact that the repo is public.

### 2026-11-27 11:50 (NPT)
- **Done:** Added rules for the admin panel (Access + JWT, write allowlist, uploads), D1 messages and the new secrets.
- **How:** From decisions D15–D19.

### 2026-11-27 13:05 (NPT)
- **Done:** Noted that API responses carry their own security headers.
- **How:** `worker/http.js` on `feat/cloudflare-astro`.
