# CLAUDE.md — Portfolio

Personal portfolio of **Nischhal Shrestha** — `portfolio.shresthanischhal.com.np`.
Static Astro site + one Cloudflare Worker (contact form API, gallery API).

## Read before coding
- Index of all docs: `docs/README.md`
- Pending tasks, open questions, task order: `docs/open-items.md` — check before every task.
- **Always** follow `docs/security.md`.
- Locked decisions: `docs/decisions.md`. Don't change one on your own; if something conflicts, stop and ask.
- Content changes: follow `docs/content.md`. Edit `src/data/*.json` only — never hard-code content in components.
- **Never invent content** (bio, projects, stats, dates, roles). If something is missing, ask.

## Stack (locked)
- **Astro**, `output: 'static'` — builds plain HTML into `dist/`
- **Cloudflare Worker with static assets** (`wrangler.jsonc`) — hosting + backend in one
- **Workers Builds** connected to GitHub — auto-deploy on push to `main`, preview URLs for branches
- **Email:** Worker `send_email` binding → verified Cloudflare Email Routing address
- **Spam protection:** Turnstile + Rate Limiting binding + honeypot + server validation
- **Gallery:** Google Drive API (key is a Worker secret), cached with the Workers Cache API (10 min)
- **Domain/DNS:** Cloudflare (`shresthanischhal.com.np`), Worker Custom Domain for `portfolio.`
- **Admin panel:** `/admin` behind **Cloudflare Access** (only the owner's email, one-time code); Worker re-verifies the Access JWT. Saving commits `src/data/*.json` / images to GitHub → Workers Builds redeploys (~1–2 min).
- **D1** (free) stores contact messages only, for the admin inbox. The public site stays static.
- Everything must stay on Cloudflare's **free plan**. No Vercel, no Upstash.

## Folder structure (locked)
```
astro.config.mjs        output: 'static'
wrangler.jsonc          worker + assets + bindings + vars (no secrets)
public/                 styles.css, script.js, theme-init.js, images/, _headers, .assetsignore
src/
├── layouts/Base.astro  <head>, bg-fx, Navbar, Footer, script tags
├── components/         Navbar, Footer, Timeline(+Item), ProjectCard, SkillCard, SectionHead
├── data/*.json         site, projects, experience, clubs, education, skills  ← all content lives here
└── pages/              index, about, projects, gallery, experience, education, contact, 404, admin/
worker/index.js         router: /api/contact, /api/gallery, /api/admin/*; everything else → env.ASSETS
worker/*.js             one module per route group (contact, gallery, admin, access-auth)
migrations/             D1 schema (messages table)
tests/                  node:test unit tests for both API handlers (mocked env/fetch)
docs/                   README (index), open-items, decisions, security, content, setup
```
- Do not create empty folders or placeholder files.

## Non-negotiable rules
- **The GitHub repo is public.** Nothing private goes in it: no secrets, no personal email or phone, not even in history.
- **Strict CSP: no inline `<script>` and no inline CSS.** Load JS with `<script is:inline src="...">` so Astro doesn't bundle or inline it.
- `styles.css` and `script.js` live in `public/` and are not rewritten unless the task is about them.
- Components keep the existing markup: same classes, same `reveal` / `spotlight` / `--delay` attributes.
- Nav active state and section numbers are passed as **props**, never hard-coded per page.
- **Look and behaviour must not change** unless the task says so: theme, light default, animations, contact form, gallery, 404, security headers.
- `/api/contact` order: POST + JSON only → origin allowlist → 10 KB cap → rate limit by IP (`CF-Connecting-IP`) → Turnstile verify → honeypot → field limits + control-char stripping → save to D1 → send. Plain-text email body, `reply_to` = sender. Generic error messages only.
- `/api/gallery`: validate ids, clean titles, paginate, safe errors, cache 10 min.
- Responses send only what the page needs. No secrets, no stack traces.
- **Secrets** (`GOOGLE_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`, `GITHUB_TOKEN`) only in `.dev.vars` (gitignored) and the Cloudflare dashboard. Never in `wrangler.jsonc`, code or commits.
- Security headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors) live in `public/_headers`. Any new third-party origin must be added there on purpose — never loosen CSP with `unsafe-inline`.
- `/api/contact` sends `Cache-Control: no-store`.
- `/admin*` and `/api/admin/*`: every request must carry a valid Cloudflare Access JWT (signature, `aud`, expiry, owner email), checked in the Worker even though Access sits in front. No JWT → 403. Admin responses are `no-store`.

## Content
- Positioning: **System Admin · DevOps · Automation**. Keep copy consistent with LinkedIn.
- Public contact info: email + "Kathmandu, Nepal" only. No street address.
- Images: meaningful `alt` text.

## Design
- Light theme by default, dark theme available.
- Responsive: desktop and 390 px mobile must both look right.
- All animations respect `prefers-reduced-motion`.

## Checks (before every commit)
- `npm run build` passes; `dist/` has no inline `<script>` or inline CSS.
- `node --test tests/` passes.
- For UI changes: check light + dark, desktop + 390 px mobile, and no CSP errors in the browser console (`wrangler dev`).
- No `.dev.vars`, `.env*` or secrets staged.

## Workflow
- One task at a time.
- Explain what each command does when walking me through setup steps.
- Pause and ask before anything risky: DNS changes, deleting records, disabling GitHub Pages, deploying to production.

## After finishing a task
1. Tick the matching checkbox in `docs/open-items.md` (or remove the line).
2. Add a **Log** entry at the bottom of the doc you changed:
   ```
   ### YYYY-MM-DD HH:MM (NPT)
   - **Done:** what was built
   - **How:** key approach / files touched
   ```
3. New decision needed? Add it to `docs/open-items.md` → Open questions. Add it to `docs/decisions.md` only after I agree.

## Git workflow
- **One task = one branch** from `main`: `feat/<name>`, `fix/<name>`, `content/<name>`, `chore/<name>`.
- **Conventional Commits:** `type: short summary` — `feat`, `fix`, `docs`, `chore`, `refactor`, `style`, `perf`, `test`, `security`, `content`. Body: what changed and why.
- Push the branch after each commit. Merge into `main` only after checks pass **and I approve** (merging deploys to production).
- **Never force-push `main`. Never rewrite pushed history.**