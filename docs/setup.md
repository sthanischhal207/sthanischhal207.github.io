# Setup

Commands are explained so you know what each one does. Steps marked ⚠️ change something live, so Claude asks before each one.

## Local development
Requires Node.js 22.23+ (the repo is tested on Node 26).

| Command | What it does |
|---|---|
| `npm install` | Downloads the project's tools (Astro, Wrangler) into `node_modules/`, at the exact versions pinned in `package-lock.json`. |
| `npm install-scripts approve esbuild workerd` | Needed once on npm 12+, which blocks install scripts by default. `esbuild` (Astro's bundler) and `workerd` (Cloudflare's local runtime) only fetch the right binary for your computer. |
| `npm run dev` | Astro's dev server with live reload, for page and design work. The `/api/*` routes don't run here. |
| `npm run build` | Builds the final site into `dist/` (plain HTML/CSS/JS). Workers Builds runs this same command. |
| `npx wrangler dev` | Runs the real Worker locally at `http://localhost:8787`: the built `dist/` plus `/api/contact` and `/api/gallery`. Secrets come from `.dev.vars`. Emails aren't really sent; Wrangler saves them under `.wrangler/tmp/email/`. Run `npm run build` first. |
| `npm test` | Runs the API unit tests in `tests/` (no network, everything mocked). Same as `node --test tests/`. |

`.dev.vars` (gitignored, never committed) holds local values:
```
TURNSTILE_SECRET=1x0000000000000000000000000000000AA   # Cloudflare's official always-pass test secret
CONTACT_TO=owner@example.com                           # any address; local emails are only saved to disk
GOOGLE_API_KEY=...                                     # a real key only if you want the gallery to load locally
ALLOWED_ORIGINS=http://localhost:8787                  # overrides the production origin for local testing
```
Local builds use Cloudflare's always-pass Turnstile **test site key** automatically. Never put the real keys in `.dev.vars` that you share.

## One-time Cloudflare / Google setup
1. **Email Routing destination:** Cloudflare dashboard → `shresthanischhal.com.np` → Email → Email Routing → Destination addresses. Your personal inbox must show **Verified**. On the free plan, the form can only send to verified addresses.
2. **Sending domain:** Cloudflare dashboard → Email Service → set up sending for `shresthanischhal.com.np`, so the Worker may send *from* `noreply@shresthanischhal.com.np`. Cloudflare adds the DNS records it needs. Without this, sends fail with `E_SENDER_DOMAIN_NOT_AVAILABLE`.
3. **Turnstile widget:** Dashboard → Turnstile → Add widget → hostname `portfolio.shresthanischhal.com.np`, mode **Managed**. Copy both keys:
   - **site key** (public) → build variable `PUBLIC_TURNSTILE_SITE_KEY` (step 5)
   - **secret key** → Worker secret `TURNSTILE_SECRET` (step 5)
4. **Google Drive gallery:**
   - Put the designs in one folder → Share → "Anyone with the link" → Viewer. Put the folder id (the part after `/folders/` in the link) in `wrangler.jsonc` → `GALLERY_FOLDER_ID`. It isn't a secret.
   - Google Cloud Console → new project → enable **Google Drive API** → Credentials → Create API key → restrict it to the Drive API.
5. **Create the Worker from GitHub:** Workers & Pages → Create → Import a repository → this repo.
   - Build command `npm run build`. Deploy command `npx wrangler deploy`, which uploads the Worker and `dist/` to Cloudflare.
   - **Build variable:** `PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile site key.
   - **Secrets** (Settings → Variables and Secrets, type *Secret*): `TURNSTILE_SECRET`, `CONTACT_TO` (your verified inbox), `GOOGLE_API_KEY`.
   - Branch pushes get preview URLs. The contact form is blocked on preview URLs (origin allowlist), which is expected.

## ⚠️ Go-live order (no downtime)
GitHub Pages serves `main` at the moment. Once the migration merges into `main`, the repo root has no `index.html`, so GitHub Pages would break. Do it in this order:
1. Workers Builds deploys the branch, and we check the preview URL.
2. ⚠️ Worker → Settings → Domains & Routes: delete the DNS record `portfolio` → `sthanischhal207.github.io`, then add Custom Domain `portfolio.shresthanischhal.com.np`. Cloudflare creates the record and SSL certificate. *(Until the merge, the custom domain serves the last production deploy, so do a one-time production deploy of the branch first, e.g. `npx wrangler deploy` after `npx wrangler login`.)*
3. ⚠️ Merge into `main`. Workers Builds deploys it as production.
4. ⚠️ Repo Settings → Pages → disable. Remove the `CNAME` file in a `chore/` branch.
5. Disable the Worker's `workers.dev` URL so the site lives at one address only.

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Wrote local dev commands and the one-time Cloudflare/Google setup steps.
- **How:** Based on the Cloudflare docs researched for the migration plan, and the DNS already on Cloudflare (Email Routing active).

### 2026-11-27 13:05 (NPT)
- **Done:** Updated for the finished migration: npm install-script approval, `.dev.vars` contents, Email Service sending domain, Turnstile site key as a build variable, and a go-live order that avoids downtime.
- **How:** From building and testing `feat/cloudflare-astro` locally with `wrangler dev`, and Cloudflare's current Email Service docs.
