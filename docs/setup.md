# Setup

Commands are explained so you know what each one does. Steps marked ⚠️ change something live, so Claude asks before each one.

## Local development (after the Astro migration lands)
| Command | What it does |
|---|---|
| `npm install` | Downloads the project's tools (Astro, Wrangler) into `node_modules/`, at the versions pinned in `package-lock.json`. |
| `npm run dev` | Starts Astro's dev server with live reload, for page and design work only. The `/api/*` routes don't run here. |
| `npm run build` | Builds the final site into `dist/` (plain HTML/CSS/JS). Workers Builds runs this same command. |
| `npx wrangler dev` | Runs the real Worker locally: the built `dist/` plus `/api/contact` and `/api/gallery`, with secrets read from `.dev.vars`. Use it to test the APIs and check for CSP errors. |
| `node --test tests/` | Runs the API unit tests (no network, everything mocked). |

`.dev.vars` (never committed) holds local secrets:
```
GOOGLE_API_KEY=...
TURNSTILE_SECRET=1x0000000000000000000000000000000AA   # Cloudflare's official always-pass test secret
```
For local testing, use Cloudflare's Turnstile **test keys** (always pass / always fail), never the real ones.

## One-time Cloudflare / Google setup
1. **Email Routing destination:** Cloudflare dashboard → your domain → Email → Email Routing → Destination addresses. Your personal inbox must show **Verified**. The contact form can only send to verified addresses.
2. **Turnstile widget:** Dashboard → Turnstile → Add widget → hostname `portfolio.shresthanischhal.com.np`, mode **Managed**. Copy the **site key** (public, goes in `wrangler.jsonc` vars) and the **secret key** (goes in Worker secrets).
3. **Google Drive gallery:**
   - Put the designs in one folder → Share → "Anyone with the link" → Viewer.
   - Google Cloud Console → new project → enable **Google Drive API** → Credentials → Create API key → restrict it to the Drive API.
4. **Create the Worker from GitHub:** Workers & Pages → Create → Import a repository → this repo.
   - Build command `npm run build`.
   - Deploy command `npx wrangler deploy` (uploads the Worker and `dist/` to Cloudflare).
   - Then add the secrets under Settings → Variables and Secrets.
5. ⚠️ **Point the domain at the Worker:**
   - Delete the DNS record `portfolio` → `sthanischhal207.github.io` (this takes the GitHub Pages site offline).
   - Worker → Settings → Domains & Routes → add Custom Domain `portfolio.shresthanischhal.com.np`. Cloudflare creates the DNS record and SSL certificate.
6. ⚠️ **Retire GitHub Pages:** repo Settings → Pages → disable. Remove the `CNAME` file in a `chore/` branch.
7. Disable the Worker's `workers.dev` URL (Settings → Domains & Routes) so the site lives at one address only.

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Wrote local dev commands and the one-time Cloudflare/Google setup steps.
- **How:** Based on the Cloudflare docs researched for the migration plan, and the DNS already on Cloudflare (Email Routing active).
