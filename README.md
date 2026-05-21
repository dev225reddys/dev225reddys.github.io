# devendra.me

Source for [devendra.me](https://devendra.me).

## Stack

- [Astro 4](https://astro.build) static site
- TypeScript, vanilla CSS
- Self-hosted Fraunces + JetBrains Mono via `@fontsource`
- Deployed to GitHub Pages via GitHub Actions on push to `main`/`master`

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # builds to dist/
npm run check    # astro check
```

## Writing a post

Drop a markdown file in `src/content/blog/`:

```markdown
---
title: "Post title"
date: 2026-05-21
summary: "One-line summary used in OG tags and listing."
draft: false
---

Body in markdown.
```

Push to `main`/`master`; the GH Action publishes within a few minutes.

## Other subsites

- `/wed/` — wedding microsite, served as-is by the deploy workflow.
