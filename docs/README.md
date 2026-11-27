# Docs index

Start with `CLAUDE.md` in the repo root (rules for working on this project), then:

| Doc | What it's for |
|---|---|
| [open-items.md](open-items.md) | Task order, pending tasks, open questions. Check before every task. |
| [decisions.md](decisions.md) | Locked decisions and why. Change only with the owner's agreement. |
| [security.md](security.md) | Security rules for code, config, secrets and deploys. Always follow. |
| [content.md](content.md) | Where content lives, data file shapes, writing rules, what's pending. |
| [setup.md](setup.md) | Local dev commands and Cloudflare/Google setup steps, explained. |

## Branch status (as of 2026-11-27)
- `main`: the original one-page site, live on GitHub Pages at `portfolio.shresthanischhal.com.np`.
- `vercel-backend` (local only, not pushed): multi-page split, footer, gallery, SVG skill logos, light default, contact form backend. Built for Vercel, which was dropped. **Its front-end work and API logic are the source for the Cloudflare migration**, so don't delete the branch until that migration is merged.

- `feat/cloudflare-astro`: the Astro + Cloudflare Worker version. Built and tested locally, waiting for the go-live steps in `setup.md`.

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Created the docs folder (index, open items, decisions, security, content, setup).
- **How:** Written from CLAUDE.md, the Cloudflare research and the current code on `vercel-backend`.

### 2026-11-27 13:05 (NPT)
- **Done:** Added the migration branch to the branch status.
- **How:** —
