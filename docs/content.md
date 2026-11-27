# Content guide

## Rules
- All content lives in `src/data/*.json`. Components only read it. Never hard-code text, dates, links or numbers in `.astro` files.
- **Never invent content**: bio, goals, projects, stats, dates, roles, links. If something is missing or unclear, ask the owner.
- Positioning: **System Admin · DevOps · Automation**. Keep wording consistent with LinkedIn.
- Public contact info: email (`contact@shresthanischhal.com.np`) and "Kathmandu, Nepal" only. No phone, no street address.
- Every image has meaningful `alt` text, e.g. "LD Cloud logo", not "image".
- Dates are written as `Mon YYYY` (e.g. `Nov 2026`), with `Present` for ongoing roles. List newest first.
- Stats (projects/tools/communities counts) must match what's actually listed on the site.

## Data files (planned shapes)
| File | Holds |
|---|---|
| `site.json` | name, page titles/descriptions, hero (badge text, typewriter titles, quote + author), bio, stats, hobbies, social links, contact email + location |
| `projects.json` | `[{ title, description, category, icon, tags[], links[{ label, url, kind }] }]`; `category` must match a filter button |
| `experience.json` | `[{ org, role, start, end, location, description, logo, logoAlt }]` |
| `clubs.json` | same shape as experience; `logo` optional (falls back to an icon) |
| `education.json` | same shape as experience |
| `skills.json` | `[{ group, icon, items[{ name, logo }] }]`; logos are SVGs in `public/images/skills/` |

Gallery images are **not** in the repo. They come from the public Drive folder (see `setup.md`). Upload there to add a design, and the file name becomes the caption.

## Pending content changes
The owner's goals have changed. Before the content task, collect from the owner:
- [ ] New bio / about text
- [ ] Hero: typewriter titles (currently "Computer Engineering Student", "n8n Automation Expert", "Graphics Designer"), which should match the System Admin · DevOps · Automation positioning
- [ ] Hero badge (currently "Open to opportunities") and quote: keep or change?
- [ ] Experience / clubs / education updates
- [ ] Projects to add, remove or reword
- [ ] Skills to add (e.g. Linux, Docker, cloud tools?) or remove
- [ ] Stats and hobbies
- [ ] Remove the phone number and "Chandragiri-12" address from the About and Contact sections (required by decision D12)

## Log

### 2026-11-27 11:35 (NPT)
- **Done:** Wrote content rules, the planned data file shapes and the list of content to collect.
- **How:** From CLAUDE.md and the current page content on `vercel-backend`.
