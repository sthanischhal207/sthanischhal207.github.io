# Decisions (locked)

Don't change any of these on your own. If a task conflicts with one, stop and ask. New decisions go to `open-items.md` → Open questions first, and are added here only after the owner agrees.

| # | Decision | Why | Date |
|---|---|---|---|
| D1 | Host on **Cloudflare**, not Vercel or GitHub Pages | Vercel needs a phone number the owner can't use. The domain and Email Routing are already on Cloudflare. | 2026-11-27 |
| D2 | **Cloudflare Worker with static assets** (one Worker = site + API), not Cloudflare Pages | Cloudflare's recommended path for new full-stack projects. One deploy for front end and back end. | 2026-11-27 |
| D3 | **Astro**, `output: 'static'` | Navbar, footer and content written once instead of copied into 8 HTML files. Output is still plain HTML. | 2026-11-27 |
| D4 | All content in **`src/data/*.json`** | Content edits never touch components. | 2026-11-27 |
| D5 | Contact email via Worker **`send_email` binding** to a verified Email Routing address | Free on every plan. Email Routing already handles `contact@`. | 2026-11-27 |
| D6 | Spam protection: **Turnstile + Rate Limiting binding + honeypot + server validation** | All free and native to Cloudflare. No Upstash. | 2026-11-27 |
| D7 | Gallery from a **public Google Drive folder** via the Drive API, cached 10 min with the Cache API | The owner already keeps designs in Drive. Uploading there updates the site. | 2026-11-27 |
| D8 | Deploy with **Workers Builds** from GitHub: `main` = production, branches = preview URLs | No manual deploys. Merging to `main` is the release step. | 2026-11-27 |
| D9 | Stay on Cloudflare's **free plan** | Personal site, no budget. | 2026-11-27 |
| D10 | **Light theme by default**, dark available, choice saved per browser | Owner preference. | 2026-11-27 |
| D11 | Strict CSP: **no inline scripts or styles**, ever | Main defence against injected scripts. | 2026-11-27 |
| D12 | Public contact info is **email + "Kathmandu, Nepal" only** | Privacy: no phone or street address on a public site. | 2026-11-27 |
| D13 | Positioning: **System Admin · DevOps · Automation** | Matches current work and LinkedIn. | 2026-11-27 |
| D14 | `/api/contact` checks **rate limit before Turnstile** | The rate limit is a free local check, while Turnstile verify is a network call. Floods stop before any network call. | 2026-11-27 |
| D15 | Contact recipient inbox is a Worker secret **`CONTACT_TO`** | The repo is public, so the personal email must never be committed. | 2026-11-27 |
| D16 | **Admin panel** at `/admin`: login via **Cloudflare Access** (owner's email only, one-time code), Worker re-verifies the Access JWT | No passwords to store or leak. Two layers of checks. Fallback if Access needs a card: GitHub sign-in limited to the owner's account. | 2026-11-27 |
| D17 | Admin **saves by committing to GitHub** (fine-grained token, this repo only, Contents read/write, secret `GITHUB_TOKEN`). Workers Builds redeploys. | The site stays static, git history is the undo button, and there's no content database. | 2026-11-27 |
| D18 | Admin scope: **all content, show/hide sections and badge, image/logo uploads, contact messages inbox** | Owner wants full control from one place. | 2026-11-27 |
| D19 | **D1** database stores contact messages, for the admin inbox only | Messages are kept even if email delivery fails. Free plan. The public site doesn't read from D1. | 2026-11-27 |
| D20 | Turnstile **site key** is a Workers Builds **build variable** `PUBLIC_TURNSTILE_SITE_KEY`; local builds use Cloudflare's test key | Pages are built before the Worker runs, so the key can't come from Worker vars. It's public, so a build variable is fine. | 2026-11-28 |

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Recorded the decisions agreed so far (stack, hosting, content, security, design).
- **How:** Taken from CLAUDE.md and the Cloudflare migration plan.

### 2026-11-27 11:50 (NPT)
- **Done:** Added D14–D19 (contact check order, private inbox secret, admin panel login/saving/scope, D1 inbox).
- **How:** The owner answered open questions Q1–Q6.

### 2026-11-28 10:55 (NPT)
- **Done:** Added D20 (Turnstile site key as a build variable).
- **How:** Owner approved open question Q9.
