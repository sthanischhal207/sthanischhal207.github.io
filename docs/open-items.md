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
   - Apply D14 (rate limit before Turnstile) and D15 (`CONTACT_TO` secret). Ready to start.
3. [ ] Owner setup in Cloudflare/Google (see `setup.md` steps 1–4), then a preview deploy from the branch
4. [ ] ⚠️ Go live: merge to `main`, move the `portfolio` DNS record to the Worker, retire GitHub Pages, disable `workers.dev`
5. [ ] `content/update-goals`: apply the owner's new content (list in `content.md` → Pending content changes)
6. [ ] `feat/admin-panel`: admin panel (D16–D19), split into smaller branches:
   - [ ] Access setup + Worker JWT check + empty `/admin` shell
   - [ ] Content editor for every `src/data/*.json` file, saving via GitHub commit
   - [ ] Show/hide sections and badge (flags in `site.json`)
   - [ ] Image/logo uploads (committed to `public/images/`)
   - [ ] D1 messages table + contact API saves to it + admin inbox (read, delete)

## Open questions
- **Q7. Zero Trust signup:** when you set up Cloudflare Access, does the Zero Trust free plan ask for a payment card? If it does, we switch to the GitHub sign-in fallback (D16).
- **Q8. Message retention:** how long should contact messages stay in D1? Suggest: until you delete them in the admin, with a "delete" button per message.

## Resolved
- Q1 → D14 · Q2 → D15 · Q3/Q6 → D17 · Q4 → D16 · Q5 → D18 + D19

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Created the task order and open questions, including the admin panel request.
- **How:** Task list from the Cloudflare migration plan. Questions from reviewing CLAUDE.md against the research and the public repo.

### 2026-11-27 11:50 (NPT)
- **Done:** Resolved Q1–Q6, broke the admin panel into sub-tasks, added Q7–Q8.
- **How:** From the owner's answers.
