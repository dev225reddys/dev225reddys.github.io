# devendra.me redesign — design spec

**Date:** 2026-05-21
**Status:** Draft, awaiting user review
**Repo:** github.com/dev225reddys/dev225reddys.github.io
**Live:** https://devendra.me

---

## 1. Why redesign

The current site is a 2018-era Mobirise template: particles.js + typed-text hero, six fragmented pages, ~7,400 vendor files (bootstrap, font-awesome, formoid, gdpr-plugin, cookies-alert, sociallikes, mobirise theme, etc.). Positioning ("ML Enthusiast / AI Aficionado / Pythonista") no longer matches the owner's reality as an active founder shipping production software (markets trading stack, sayuk-hms hospital software, sayuk-cloud, others).

Redesign goals:

1. **Reposition** as founder / product builder — someone who ships real systems.
2. **Surface the work** — a projects section that does not currently exist.
3. **Open a writing channel** — blog for thoughts and insights on trading, building, AI.
4. **Strip the cruft** — drop Mobirise lock-in and the 20+ vendor asset dirs.
5. **Age well** — editorial visual system with no animation gimmicks.

Out of scope: redesigning `/wed/` (wedding microsite stays untouched).

## 2. Audience and goals

Primary audiences, all served by the same one-page hub:

- **Recruiters / collaborators** — get a serious-adult signal in 10 seconds, find projects and resume.
- **Trading / engineering peers** — read writing, see what's shipped.
- **Inbound product opportunities** — find an explicit "open to new products" line and a contact email.

Success after 30 seconds: visitor knows who Devendra is, what he builds, and how to reach him.

## 3. Information architecture

Single-page home at `/` with anchored sections, plus blog at `/writing/`.

### Home sections (top to bottom)

1. **Hero** — Name, one-line positioning, location + year, social/email row, and a one-line "currently / open to" status strip (easy to update).
2. **About** — 2–3 short paragraphs. Lean into technical depth, the build-and-experiment instinct, products shipped, and an explicit "open to building new products / collaborations" line. No bullet lists.
3. **Projects** — Vertical list of 4–6 featured projects.
4. **Writing** — Latest 5 posts (date + title), with "All posts →" linking to `/writing/`.
5. **Contact** — Email, GitHub, LinkedIn, Twitter, phone (optional). One line.

### Other routes

- `/writing/` — Blog index, posts newest first, grouped by year.
- `/writing/<slug>/` — Individual post, same single-column treatment as home.
- `/writing/rss.xml` — RSS feed.
- `/resume.pdf` — Current resume PDF (moved from `assets/files/DevendraReddy.pdf`).
- `/wed/` — Untouched; existing wedding microsite preserved.

### Pages dropped

`about.html`, `work.html`, `education.html`, `skills.html`, `contact.html`, `index-2.html` are deleted. Old work/education/skills content (org timeline, ML-mentoring aspirations, hackathon list) is not migrated — it no longer matches positioning.

## 4. Visual system

Editorial, serif-led, light. No animation, no particles, no typed-text loops.

### Palette

| Token       | Value     | Use                          |
|-------------|-----------|------------------------------|
| `--bg`      | `#FAF8F3` | Page background (warm paper) |
| `--ink`     | `#1A1A1A` | Body and headlines           |
| `--muted`   | `#6B6B66` | Metadata, dates, captions    |
| `--rule`    | `#E5E1D6` | Hairline section dividers    |
| `--accent`  | `#B5421F` | Links, single hero detail    |

One accent only, used sparingly.

### Typography

- **Headlines & body:** Fraunces (variable serif, self-hosted via `@fontsource-variable/fraunces`).
- **Mono accents:** JetBrains Mono (self-hosted via `@fontsource/jetbrains-mono`). Used for project years, status pills, dates in the writing list, inline code.
- No sans-serif. Two families, not three.

### Layout

- Single 640px content column, centered. ~72ch reading width.
- Vertical rhythm: 1.6 line-height body, ~96px between sections.
- Section breaks: a single horizontal rule + lowercase section label in mono (e.g. `── projects`). No card stacks.
- Mobile: same column, scaled type, no layout changes.

### Interactions

- Links: accent color + underline; hover thickens the underline only.
- Hero name in a slightly heavier serif weight; one small flourish on the hero, no logo.
- No dark mode in v1 (warm-paper editorial is the whole point; a dark variant would dilute it).

## 5. Projects to feature

In order. Each row: name · one-line · year · status · optional link.

1. **markets** — Systematic F&O trading stack. Algo paper engine + execution loop on a Mac mini in production. *2024 – present · live · no link (private edge).*
2. **sayuk-hms** — Hospital management software for tier-2/3 India. FastAPI + SQLite-per-tenant + React PWA. *2026 · in development.*
3. **sayuk-cloud** — Companion cloud layer for sayuk-hms. *2026 · in development.*
4. **social-studio** — (one-liner TBD by user.) *Year · status.*
5. **devendra.me** — This site. *2026 · open source.* Link to repo.

Old work-page content (organizations timeline, ML-mentoring goals, hackathon list) is not migrated.

## 6. Writing / blog

- Posts in `src/content/blog/*.md`.
- Frontmatter: `title`, `date`, `summary`, `tags?`, `draft?`.
- Astro content collections for type-checking and indexing.
- `/writing/` lists posts newest-first, grouped by year.
- Post pages: same single-column type as home; no sidebar, no share buttons, no comments.
- RSS at `/writing/rss.xml`.
- No tags page in v1 (add when there are 20+ posts).

## 7. Tech stack and deploy

- **Framework:** Astro 4.x, TypeScript strict.
- **No UI framework:** `.astro` components only; no React/Vue.
- **Styling:** Vanilla CSS — one `global.css` + scoped per component. No Tailwind.
- **Fonts:** `@fontsource-variable/fraunces` and `@fontsource/jetbrains-mono`, self-hosted (no Google CDN).
- **Build/deploy:** GitHub Action runs on push to `main`, builds Astro static output, publishes to `gh-pages` branch.
- **CNAME:** Astro writes `CNAME` containing `devendra.me` into the build output so GitHub Pages keeps the apex domain.
- **Repo cleanup:** Delete `assets/anim`, `assets/bootstrap`, `assets/bootstrapcarouselswipe`, `assets/cookies-alert-plugin`, `assets/dropdown`, `assets/formoid`, `assets/gdpr-plugin`, `assets/mbr-testimonials-slider`, `assets/mobirise`, `assets/popper`, `assets/smoothscroll`, `assets/sociallikes`, `assets/socicon`, `assets/tether`, `assets/theme`, `assets/touchswipe`, `assets/web`. Keep `assets/files/DevendraReddy.pdf` → `public/resume.pdf`. Keep `assets/images/` (curate to images actually used).
- **Preserve:** `/wed/` directory, top-level `CNAME` file (until Astro generates one), `.git`.

## 8. Migration safety

1. Build new site on a `redesign` branch.
2. Preview via Cloudflare Pages preview deployment (separate hostname, e.g. `redesign.devendra.me` or `*.pages.dev`).
3. Eyeball on desktop + mobile, share with one or two reviewers.
4. Merge `redesign` → `main` only after sign-off.
5. After cutover, leave the old Mobirise HTML in git history (not in `main`) for one release cycle in case rollback is needed.

## 9. Out of scope (v1)

Dark mode, comments, newsletter signup, search, analytics dashboard, animations, per-project case-study sub-pages, i18n, image optimization beyond Astro defaults.

## 10. Open questions

- `social-studio` one-line description and status.
- Whether to include phone number in contact row (currently in old site).
- Whether to keep the `/index-2.html` alternate hero anywhere (assumed no).
- Whether to expose any markets-stack writeups publicly (default: no — keep edge private; writing can talk about *meta* lessons, not internals).
