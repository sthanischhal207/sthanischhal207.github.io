# Open items

Check this before every task. One task at a time, one branch per task (see CLAUDE.md → Git workflow).

## Task order
1. [x] `chore/project-docs`: create the docs folder
2. [ ] `feat/cloudflare-astro`: move the site to Astro + Cloudflare Worker
   - Port the pages from `vercel-backend` into `Base.astro` + components + `src/data/*.json`, with the same markup and look.
   - Port `/api/contact` and `/api/gallery` to `worker/index.js`, then add Turnstile and the Rate Limiting binding.
   - Turn `vercel.json` into `public/_headers`.
   - Remove `api/`, `vercel.json`, `.vercelignore`.
   - Tests: port the 21 contact + 13 gallery tests to `tests/` and add Turnstile cases.
   - Needs answers to Q1 and Q2 first.
3. [ ] Owner setup in Cloudflare/Google (see `setup.md` steps 1–4), then a preview deploy from the branch
4. [ ] ⚠️ Go live: merge to `main`, move the `portfolio` DNS record to the Worker, retire GitHub Pages, disable `workers.dev`
5. [ ] `content/update-goals`: apply the owner's new content (list in `content.md` → Pending content changes)
6. [ ] `feat/admin-panel`: admin panel. Design not agreed yet, see Q3–Q6.

## Open questions
- **Q1. Contact API check order.** CLAUDE.md says Turnstile verify → rate limit. Suggest **rate limit → Turnstile**. The rate limit is a free local check, while Turnstile verify is a network call to Cloudflare, so limiting first stops a flood from turning into a flood of verify calls. Change the rule?
- **Q2. Where the contact form sends.** The `send_email` binding normally writes the recipient (your personal inbox) into `wrangler.jsonc`, and this repo is public. Suggest leaving the binding unrestricted (it can still only reach *verified* addresses) and keeping the inbox address in a Worker secret `CONTACT_TO`. That adds a third secret to CLAUDE.md.
- **Q3. Admin panel: how saving works.** Proposed: the admin page edits the same `src/data/*.json` content and saves by committing to GitHub. Workers Builds then rebuilds and the change is live in about 1–2 minutes. The site stays static, git history doubles as undo, and there's no database. Alternative: a D1 database with pages rendered live, which would break D3/D4.
- **Q4. Admin panel: login.** Proposed: **Cloudflare Access** (Zero Trust free plan) in front of `/admin*` and `/api/admin/*`. It allows only your email and sends a one-time code, and the Worker also checks Access's signed token. No passwords stored by us.
  - ⚠️ To verify: does the Zero Trust free plan ask for a payment card in your account?
  - Fallback if it does: "Sign in with GitHub", limited to your GitHub account.
- **Q5. Admin panel: scope.** What should "control everything" include?
  - Every content field (all data files).
  - Show/hide sections and pages.
  - Hero badge on/off.
  - Upload logos and images (committed to the repo).
  - An inbox of contact messages? That one needs a D1 database (free) to store messages, which is a new decision.
- **Q6. Admin panel: GitHub token.** Saving needs a fine-grained GitHub token (this repo only, "Contents: read & write"), stored as a Worker secret. Anyone who breaks into the admin could change the repo's files, so login (Q4) must be solid. OK?

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Created the task order and open questions, including the admin panel request.
- **How:** Task list from the Cloudflare migration plan. Questions from reviewing CLAUDE.md against the research and the public repo.
