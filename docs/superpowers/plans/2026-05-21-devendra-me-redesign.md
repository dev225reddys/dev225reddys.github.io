# devendra.me Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2018 Mobirise template at `devendra.me` with an editorial, serif-led, single-page Astro site + a markdown-driven blog at `/writing/`, deployed via GitHub Actions to GitHub Pages, while preserving the `/wed/` subdirectory.

**Architecture:** Astro 4.x static site, TypeScript strict, no UI framework. Single-page home composed of small `.astro` components. Blog uses Astro content collections backed by `src/content/blog/*.md`. Vanilla CSS with design tokens in `:root`. Self-hosted Fraunces + JetBrains Mono via `@fontsource`. Build runs on every push to `main` and publishes to the `gh-pages` branch; `CNAME` is committed in `public/` so GitHub Pages serves `devendra.me`.

**Tech Stack:** Astro 4.x · TypeScript strict · vanilla CSS · `@astrojs/rss` · `@fontsource-variable/fraunces` · `@fontsource/jetbrains-mono` · GitHub Actions (`actions/configure-pages` + `actions/deploy-pages`).

---

## Working branch

All work happens on a `redesign` branch off `master`. Do not touch `master` until cutover (Task 11). The `/wed/` directory and the top-level `CNAME` file must survive the redesign untouched.

## File structure

After the redesign, the repo looks like this. Files marked `(new)` are created by tasks below; files marked `(preserved)` must be carried through unchanged from `master`.

```
/
├─ .github/workflows/deploy.yml         (new — Task 9)
├─ .gitignore                            (new — Task 1)
├─ astro.config.mjs                      (new — Task 1)
├─ package.json                          (new — Task 1)
├─ tsconfig.json                         (new — Task 1)
├─ public/
│  ├─ CNAME                              (moved from repo root — Task 9)
│  ├─ resume.pdf                         (moved from assets/files/DevendraReddy.pdf — Task 8)
│  └─ favicon.ico                        (kept from old wed/favicon.ico OR generated — Task 8)
├─ src/
│  ├─ content/
│  │  ├─ config.ts                       (new — Task 5)
│  │  └─ blog/
│  │     └─ hello-world.md               (new — Task 5)
│  ├─ layouts/
│  │  └─ Layout.astro                    (new — Task 3)
│  ├─ components/
│  │  ├─ Hero.astro                      (new — Task 4)
│  │  ├─ About.astro                     (new — Task 4)
│  │  ├─ Projects.astro                  (new — Task 4)
│  │  ├─ WritingList.astro               (new — Task 4)
│  │  └─ Contact.astro                   (new — Task 4)
│  ├─ pages/
│  │  ├─ index.astro                     (new — Task 4)
│  │  └─ writing/
│  │     ├─ index.astro                  (new — Task 6)
│  │     ├─ [...slug].astro              (new — Task 6)
│  │     └─ rss.xml.js                   (new — Task 7)
│  └─ styles/
│     └─ global.css                      (new — Task 2)
├─ wed/                                  (preserved untouched)
├─ docs/superpowers/                     (preserved — spec and plan)
└─ README.md                             (updated — Task 11)
```

Files **deleted** at Task 10: every old top-level HTML (`index.html`, `index-2.html`, `about.html`, `work.html`, `education.html`, `skills.html`, `contact.html`) and most of `assets/` (Mobirise dirs listed in the spec §7). `assets/files/DevendraReddy.pdf` is moved, not deleted.

## Manual verification at each task

This is a personal static site — no e2e test suite is justified. Each task's "verify" step uses one or more of:

- `npm run build` — must complete without errors or warnings.
- `npx astro check` — must report 0 errors, 0 warnings, 0 hints.
- `npm run dev` + visual eyeball at `http://localhost:4321` — described per task.

---

## Task 1: Bootstrap Astro project on a redesign branch

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Branch: `redesign`

- [ ] **Step 1: Create branch off current master**

```bash
git checkout master
git pull
git checkout -b redesign
```

- [ ] **Step 2: Initialize npm package**

Create `package.json`:

```json
{
  "name": "devendra-me",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^4.16.0",
    "@astrojs/rss": "^4.0.0",
    "@astrojs/check": "^0.9.0",
    "@fontsource-variable/fraunces": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: a `node_modules/` directory and a fresh `package-lock.json`. No errors.

- [ ] **Step 4: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://devendra.me',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "wed"]
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
.env
.env.production
```

- [ ] **Step 7: Verify build runs against empty src**

```bash
mkdir -p src/pages
echo '---' > src/pages/index.astro
echo '---' >> src/pages/index.astro
echo '<h1>placeholder</h1>' >> src/pages/index.astro
npm run build
```

Expected: build completes, `dist/index.html` exists and contains `placeholder`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "Bootstrap Astro project on redesign branch"
```

---

## Task 2: Design tokens and global CSS

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css` with palette, type, and reset**

```css
/* ── Reset (Eric Meyer style, trimmed) ── */
*, *::before, *::after { box-sizing: border-box; }
html, body, h1, h2, h3, h4, h5, h6, p, ul, ol, figure, blockquote { margin: 0; padding: 0; }
ul, ol { list-style: none; }
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }

/* ── Fonts (self-hosted via @fontsource in Layout.astro) ── */

/* ── Design tokens ── */
:root {
  --bg: #FAF8F3;
  --ink: #1A1A1A;
  --muted: #6B6B66;
  --rule: #E5E1D6;
  --accent: #B5421F;

  --font-serif: 'Fraunces Variable', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  --measure: 640px;
  --space-section: 6rem;
  --leading: 1.6;
}

/* ── Base ── */
html { font-size: 18px; -webkit-font-smoothing: antialiased; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-serif);
  line-height: var(--leading);
  font-feature-settings: 'kern', 'liga';
}

.container {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

section + section { margin-top: var(--space-section); }

.section-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-bottom: 1.25rem;
}

.section-label::before {
  content: '── ';
  color: var(--rule);
}

a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: text-decoration-thickness 120ms ease;
}
a:hover { text-decoration-thickness: 2px; }

.mono { font-family: var(--font-mono); font-size: 0.85em; color: var(--muted); }
.muted { color: var(--muted); }

@media (max-width: 480px) {
  html { font-size: 17px; }
  :root { --space-section: 4rem; }
  .container { padding: 2.5rem 1.25rem; }
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: success. No new pages reference the CSS yet — that happens in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Add design tokens and global CSS"
```

---

## Task 3: Root layout component

**Files:**
- Create: `src/layouts/Layout.astro`

- [ ] **Step 1: Create `src/layouts/Layout.astro`**

```astro
---
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = 'Devendra Reddy — founder and product builder.', ogImage = '/og.png' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
  <meta name="twitter:card" content="summary_large_image" />
</head>
<body>
  <main class="container">
    <slot />
  </main>
</body>
</html>
```

- [ ] **Step 2: Update `src/pages/index.astro` placeholder to use Layout**

Replace the file with:

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Devendra Reddy">
  <h1>placeholder</h1>
</Layout>
```

- [ ] **Step 3: Verify build and dev server**

```bash
npm run build && npm run dev
```

Open `http://localhost:4321/`. Expected: warm off-white background, serif "placeholder" heading, no console errors. Kill the dev server with Ctrl-C.

- [ ] **Step 4: Run astro check**

```bash
npx astro check
```

Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/pages/index.astro
git commit -m "Add Layout.astro with self-hosted fonts and meta"
```

---

## Task 4: Home page components

**Files:**
- Create: `src/components/Hero.astro`, `About.astro`, `Projects.astro`, `WritingList.astro`, `Contact.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
interface Props { status?: string; }
const { status = 'Open to new product collaborations.' } = Astro.props;
---
<section class="hero">
  <h1>Devendra Reddy</h1>
  <p class="lede">
    I build software products — a hospital management system, a markets stack,
    a few things in between.
  </p>
  <p class="meta">
    <span class="mono">Hyderabad · 2026</span>
  </p>
  <p class="status">{status}</p>
</section>

<style>
  .hero { padding-top: 1rem; }
  h1 {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: 2.75rem;
    letter-spacing: -0.01em;
    line-height: 1.05;
    margin-bottom: 1.5rem;
  }
  .lede { font-size: 1.25rem; line-height: 1.5; margin-bottom: 1.25rem; }
  .meta { margin-bottom: 1rem; }
  .status {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--accent);
    padding: 0.4rem 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    display: inline-block;
    padding-inline: 0.75rem;
  }
</style>
```

- [ ] **Step 2: Create `src/components/About.astro`**

```astro
---
---
<section>
  <p class="section-label">about</p>
  <div class="prose">
    <p>
      I'm a builder. I write software end-to-end — backend, infra, frontend,
      whatever the product needs. The fun part is the experiment loop: prototype
      something rough, run it against reality, throw out what doesn't work, keep
      what does.
    </p>
    <p>
      Right now I'm shipping a hospital management system for tier-2/3 India and
      running a systematic trading stack on the side. Both are real products
      with real users and real bugs.
    </p>
    <p>
      I'm <strong>open to new product collaborations</strong> — especially with
      people who care about getting the thing into someone's hands and watching
      what happens. If that's you, find me below.
    </p>
  </div>
</section>

<style>
  .prose p + p { margin-top: 1.25rem; }
  strong { font-weight: 600; }
</style>
```

- [ ] **Step 3: Create `src/components/Projects.astro`**

```astro
---
const projects = [
  {
    name: 'markets',
    blurb: 'Systematic F&O trading stack — algo paper engine + execution loop, in production.',
    year: '2024 – present',
    status: 'live',
    href: null,
  },
  {
    name: 'sayuk-hms',
    blurb: 'Hospital management software for tier-2/3 India. FastAPI + SQLite-per-tenant + React PWA.',
    year: '2026',
    status: 'in dev',
    href: null,
  },
  {
    name: 'sayuk-cloud',
    blurb: 'Companion cloud layer for sayuk-hms.',
    year: '2026',
    status: 'in dev',
    href: null,
  },
  {
    name: 'social-studio',
    blurb: 'TBD — fill in once we have the one-liner.',
    year: '2026',
    status: 'in dev',
    href: null,
  },
  {
    name: 'devendra.me',
    blurb: 'This site. Astro static site, single page + writing.',
    year: '2026',
    status: 'open source',
    href: 'https://github.com/dev225reddys/dev225reddys.github.io',
  },
];
---
<section>
  <p class="section-label">projects</p>
  <ul class="projects">
    {projects.map(p => (
      <li class="project">
        <div class="row">
          <span class="name">{p.href ? <a href={p.href}>{p.name}</a> : p.name}</span>
          <span class="mono">{p.year} · {p.status}</span>
        </div>
        <p class="blurb">{p.blurb}</p>
      </li>
    ))}
  </ul>
</section>

<style>
  .projects { display: flex; flex-direction: column; gap: 1.75rem; }
  .project { border-top: 1px solid var(--rule); padding-top: 1rem; }
  .row {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 1rem; flex-wrap: wrap;
  }
  .name { font-family: var(--font-serif); font-weight: 600; font-size: 1.1rem; }
  .blurb { color: var(--muted); margin-top: 0.35rem; font-size: 0.95rem; }
</style>
```

- [ ] **Step 4: Create `src/components/WritingList.astro`**

```astro
---
import { getCollection } from 'astro:content';
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 5);
const fmt = (d: Date) => d.toISOString().slice(0, 10);
---
<section>
  <p class="section-label">writing</p>
  {posts.length === 0 ? (
    <p class="muted">Nothing published yet — soon.</p>
  ) : (
    <ul class="posts">
      {posts.map(p => (
        <li>
          <span class="mono">{fmt(p.data.date)}</span>
          <a href={`/writing/${p.slug}/`}>{p.data.title}</a>
        </li>
      ))}
    </ul>
  )}
  {posts.length > 0 && <p class="more"><a href="/writing/">All posts →</a></p>}
</section>

<style>
  .posts { display: flex; flex-direction: column; gap: 0.75rem; }
  .posts li { display: flex; gap: 1rem; align-items: baseline; }
  .more { margin-top: 1.25rem; }
</style>
```

- [ ] **Step 5: Create `src/components/Contact.astro`**

```astro
---
---
<section>
  <p class="section-label">contact</p>
  <ul class="links">
    <li><a href="mailto:mail@devendra.me">mail@devendra.me</a></li>
    <li><a href="https://github.com/dev225reddys">github</a></li>
    <li><a href="https://www.linkedin.com/in/dev225reddys">linkedin</a></li>
    <li><a href="https://twitter.com/dev225reddys">twitter</a></li>
    <li><a href="/resume.pdf">resume (pdf)</a></li>
  </ul>
</section>

<style>
  .links { display: flex; flex-wrap: wrap; gap: 1.25rem 1.5rem; }
  .links a { font-family: var(--font-mono); font-size: 0.9rem; }
</style>
```

- [ ] **Step 6: Replace `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Projects from '../components/Projects.astro';
import WritingList from '../components/WritingList.astro';
import Contact from '../components/Contact.astro';
---
<Layout title="Devendra Reddy — founder, product builder">
  <Hero />
  <About />
  <Projects />
  <WritingList />
  <Contact />
</Layout>
```

- [ ] **Step 7: Verify**

The content collection used by `WritingList.astro` doesn't exist yet, so the build will fail until Task 5. Skip `npm run build` here. Verify with the dev server, which tolerates the missing collection by showing the "Nothing published yet" branch only after collection exists.

Run:

```bash
npx astro check 2>&1 | head -30
```

Expected: complaints about `astro:content` `getCollection('blog')` because the collection schema is not defined yet. That's expected and fixed in Task 5.

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/pages/index.astro
git commit -m "Add home-page components (hero, about, projects, writing list, contact)"
```

---

## Task 5: Blog content collection + first post

**Files:**
- Create: `src/content/config.ts`, `src/content/blog/hello-world.md`

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Create `src/content/blog/hello-world.md`**

```markdown
---
title: "Hello, world"
date: 2026-05-21
summary: "Why this site exists and what's coming."
---

This is the first post on the redesigned devendra.me. The old site was a
2018-era template I never updated; this one is built to write in. Posts will
mostly be notes on what I'm building — trading systems, hospital software,
whatever else I'm in the middle of — and the occasional opinion.
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build completes, no errors. The home page now renders with the writing section showing one post.

- [ ] **Step 4: Verify in dev**

```bash
npm run dev
```

Open `http://localhost:4321/`. Expected: writing section shows `2026-05-21  Hello, world` with a link. Link will 404 until Task 6. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/content/
git commit -m "Add blog content collection with first post"
```

---

## Task 6: Writing index and post pages

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`

- [ ] **Step 1: Create `src/pages/writing/index.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const byYear = posts.reduce<Record<string, typeof posts>>((acc, p) => {
  const y = String(p.data.date.getFullYear());
  (acc[y] ||= []).push(p);
  return acc;
}, {});

const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
const fmt = (d: Date) => d.toISOString().slice(0, 10);
---
<Layout title="Writing — Devendra Reddy">
  <p class="section-label">writing</p>
  <p class="muted intro">Notes on what I'm building.</p>
  {years.map(year => (
    <section class="year">
      <h2 class="mono year-label">{year}</h2>
      <ul>
        {byYear[year].map(p => (
          <li>
            <span class="mono">{fmt(p.data.date)}</span>
            <a href={`/writing/${p.slug}/`}>{p.data.title}</a>
          </li>
        ))}
      </ul>
    </section>
  ))}
  <p class="back"><a href="/">← back</a></p>
</Layout>

<style>
  .intro { margin-bottom: 2.5rem; }
  .year { margin-top: 2.5rem; }
  .year-label { color: var(--muted); margin-bottom: 0.75rem; font-size: 0.9rem; }
  .year ul { display: flex; flex-direction: column; gap: 0.5rem; }
  .year li { display: flex; gap: 1rem; align-items: baseline; }
  .back { margin-top: 4rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/writing/[...slug].astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import type { GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({ params: { slug: post.slug }, props: { post } }));
}) satisfies GetStaticPaths;

const { post } = Astro.props;
const { Content } = await post.render();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
---
<Layout title={`${post.data.title} — Devendra Reddy`} description={post.data.summary}>
  <article>
    <p class="mono date">{fmt(post.data.date)}</p>
    <h1>{post.data.title}</h1>
    <div class="body"><Content /></div>
    <p class="back"><a href="/writing/">← all posts</a></p>
  </article>
</Layout>

<style>
  .date { color: var(--muted); margin-bottom: 0.5rem; }
  h1 { font-family: var(--font-serif); font-weight: 600; font-size: 2rem; line-height: 1.15; margin-bottom: 2rem; }
  .body :global(p) { margin-bottom: 1.25rem; }
  .body :global(h2) { font-family: var(--font-serif); font-weight: 600; font-size: 1.35rem; margin: 2.5rem 0 1rem; }
  .body :global(h3) { font-family: var(--font-serif); font-weight: 600; font-size: 1.1rem; margin: 2rem 0 0.75rem; }
  .body :global(a) { color: var(--accent); }
  .body :global(code) { font-family: var(--font-mono); font-size: 0.85em; background: var(--rule); padding: 0.05em 0.3em; border-radius: 3px; }
  .body :global(pre) { background: #F2EFE6; padding: 1rem; border-radius: 4px; overflow-x: auto; font-family: var(--font-mono); font-size: 0.85rem; }
  .body :global(blockquote) { border-left: 3px solid var(--rule); padding-left: 1rem; color: var(--muted); font-style: italic; }
  .back { margin-top: 4rem; }
</style>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build completes. `dist/writing/index.html` exists. `dist/writing/hello-world/index.html` exists.

- [ ] **Step 4: Verify in dev**

```bash
npm run dev
```

Open `http://localhost:4321/writing/`. Expected: list grouped by year `2026`, one entry. Click through — post renders with date, title, body. Click `← all posts` to confirm round-trip. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/writing/
git commit -m "Add writing index and individual post pages"
```

---

## Task 7: RSS feed

**Files:**
- Create: `src/pages/writing/rss.xml.js`

- [ ] **Step 1: Create `src/pages/writing/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Devendra Reddy — writing',
    description: 'Notes on what I am building.',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: `/writing/${post.slug}/`,
    })),
  });
}
```

- [ ] **Step 2: Verify**

```bash
npm run build
```

Expected: `dist/writing/rss.xml` exists. Inspect:

```bash
head -20 dist/writing/rss.xml
```

Expected: valid RSS XML with the `Hello, world` item.

- [ ] **Step 3: Commit**

```bash
git add src/pages/writing/rss.xml.js
git commit -m "Add RSS feed at /writing/rss.xml"
```

---

## Task 8: Static assets — favicon, resume, OG image

**Files:**
- Create: `public/resume.pdf` (copy from `assets/files/DevendraReddy.pdf`)
- Create: `public/favicon.ico` (copy from `wed/favicon.ico`)
- Create: `public/og.png` (placeholder until a real one is made)
- Create: `public/robots.txt`

- [ ] **Step 1: Copy resume and favicon into public/**

```bash
mkdir -p public
cp assets/files/DevendraReddy.pdf public/resume.pdf
cp wed/favicon.ico public/favicon.ico
```

Verify both files exist:

```bash
ls -la public/resume.pdf public/favicon.ico
```

- [ ] **Step 2: Create a placeholder OG image**

For now, copy the existing site image:

```bash
cp assets/images/DevW.jpg public/og.png 2>/dev/null || \
  cp assets/images/dr.png public/og.png 2>/dev/null || \
  echo "no source image found — leave public/og.png missing, Layout falls back gracefully"
```

If neither file exists, skip — `Layout.astro` references `/og.png` but a missing OG image will simply not render in previews; it won't break anything.

- [ ] **Step 3: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://devendra.me/sitemap-index.xml
```

(Astro doesn't generate a sitemap by default; this line is forward-looking — we can add `@astrojs/sitemap` later if needed.)

- [ ] **Step 4: Verify**

```bash
npm run build
ls dist/resume.pdf dist/favicon.ico dist/robots.txt
```

Expected: all three files in `dist/`.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "Add resume, favicon, robots, and OG image to public/"
```

---

## Task 9: GitHub Actions deploy + CNAME

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME`

- [ ] **Step 1: Move CNAME into public/**

```bash
mv CNAME public/CNAME
cat public/CNAME
```

Expected output: `devendra.me`.

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Carry over /wed/ subsite
        run: |
          if [ -d wed ]; then
            cp -R wed dist/wed
          fi
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

The `Carry over /wed/ subsite` step copies the untouched wedding microsite directly into the build output, since Astro doesn't process it.

- [ ] **Step 3: Verify build still passes locally**

```bash
npm run build
ls dist/CNAME
```

Expected: `dist/CNAME` exists and contains `devendra.me`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml public/CNAME
git rm -f CNAME 2>/dev/null || true
git commit -m "Add GH Actions deploy workflow and move CNAME to public/"
```

---

## Task 10: Delete the old Mobirise site

**Files:**
- Delete: all top-level legacy HTML, the bulk of `assets/`

Do this **only after** Tasks 1–9 have built cleanly and you've inspected the redesign locally.

- [ ] **Step 1: Inspect what's about to go**

```bash
ls *.html
ls assets/
```

You should see the seven legacy HTML files and the ~20 Mobirise asset dirs.

- [ ] **Step 2: Delete legacy HTML**

```bash
git rm index.html index-2.html about.html work.html education.html skills.html contact.html
```

- [ ] **Step 3: Delete Mobirise asset dirs**

```bash
git rm -r assets/anim assets/bootstrap assets/bootstrapcarouselswipe \
  assets/cookies-alert-plugin assets/dropdown assets/formoid \
  assets/gdpr-plugin assets/mbr-testimonials-slider assets/mobirise \
  assets/popper assets/smoothscroll assets/sociallikes assets/socicon \
  assets/tether assets/theme assets/touchswipe assets/web
```

- [ ] **Step 4: Remove `assets/` if now empty (except `files/` and `images/`)**

```bash
ls assets/
```

If only `files/` and `images/` remain and they are no longer referenced anywhere in `src/` or `public/`, delete them too:

```bash
grep -r "assets/" src/ public/ 2>/dev/null || echo "no references — safe to delete"
git rm -r assets/
```

If `grep` finds references, leave the referenced subdirs alone and only delete the rest.

- [ ] **Step 5: Verify clean build**

```bash
npm run build
ls dist/
```

Expected: a tidy `dist/` containing only the new site + `wed/` (added by the deploy workflow at CI time, not locally). The local `dist/` won't have `wed/` — that's normal.

- [ ] **Step 6: Commit**

```bash
git commit -m "Delete legacy Mobirise site and unused assets"
```

---

## Task 11: Update README and prepare cutover

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
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
```

- [ ] **Step 2: Verify `astro check` still clean**

```bash
npx astro check
```

Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Update README for new stack"
```

- [ ] **Step 4: Push the redesign branch**

```bash
git push -u origin redesign
```

- [ ] **Step 5: Open the branch on GitHub and confirm files look right**

Manual: open `https://github.com/dev225reddys/dev225reddys.github.io/tree/redesign` and eyeball the file tree. You should see `src/`, `public/`, `wed/`, `.github/workflows/deploy.yml`, and no legacy HTML at the top.

- [ ] **Step 6: STOP — do not merge yet**

Before merging to `master` (which would trigger deploy to the live site), do the cutover steps in Task 12.

---

## Task 12: Cutover to production

This task is the only one that touches live `devendra.me`. Do not run it until you have eyeballed the redesign branch in a preview environment and are happy with it.

- [ ] **Step 1: (Optional but recommended) Preview via Cloudflare Pages**

After the GoDaddy → Cloudflare registrar transfer completes:

1. Cloudflare dash → Pages → Create project → Connect to GitHub → pick `dev225reddys.github.io` → branch `redesign`.
2. Build command: `npm run build`. Build output: `dist`.
3. Preview URL like `redesign-xxx.pages.dev`. Open it and verify every section.

Skip this step if you are confident from local dev and want to ship straight from GH Pages.

- [ ] **Step 2: Verify the live old site is still resolving**

```bash
curl -I https://devendra.me
```

Expected: `200 OK`. (If not, fix DNS first before cutover — don't ship on top of a broken DNS.)

- [ ] **Step 3: Enable GitHub Pages from Actions in repo settings**

GitHub → repo → Settings → Pages → Source: **GitHub Actions** (not `Deploy from branch`).

- [ ] **Step 4: Merge `redesign` into `master`**

```bash
git checkout master
git merge redesign --no-ff -m "Cutover: replace Mobirise template with Astro redesign"
git push origin master
```

- [ ] **Step 5: Watch the deploy**

GitHub → repo → Actions → watch the `Deploy to GitHub Pages` workflow. It should succeed in ~2 minutes.

- [ ] **Step 6: Verify live**

```bash
curl -I https://devendra.me
curl -sL https://devendra.me | head -20
curl -I https://devendra.me/wed/
curl -I https://devendra.me/resume.pdf
curl -I https://devendra.me/writing/
curl -I https://devendra.me/writing/rss.xml
```

Expected: all return `200`. The home page HTML should contain `Devendra Reddy` and `I build software products`.

- [ ] **Step 7: Mobile + desktop visual check**

Open `https://devendra.me` on phone and desktop. Walk through all sections + a post. Spot-check the warm-paper look, serif rendering, single-column layout, and that `/wed/` is unchanged.

- [ ] **Step 8: Delete the redesign branch**

```bash
git branch -d redesign
git push origin --delete redesign
```

- [ ] **Step 9: Done.** Move on to filling in `social-studio`, writing the second post, and improving the OG image when you have a moment.

---

## Self-review summary

Spec coverage check (against `2026-05-21-devendra-me-redesign-design.md`):

| Spec section | Covered by |
|---|---|
| §3 IA — home sections | Task 4 (Hero/About/Projects/WritingList/Contact + index.astro) |
| §3 IA — blog routes | Tasks 5–7 |
| §3 IA — `/wed/` preserved | Task 9 (CI copy step) + Task 10 (not deleted) |
| §3 IA — old pages dropped | Task 10 |
| §4 Visual system — palette/type/layout | Task 2 (global.css) + Task 3 (Layout.astro) |
| §5 Projects list | Task 4 (Projects.astro) |
| §6 Writing/blog | Tasks 5–7 |
| §7 Tech stack & deploy | Tasks 1, 9 |
| §7 Repo cleanup | Task 10 |
| §8 Migration safety (branch, preview, cutover) | Tasks 1, 12 |
| §9 Out of scope | Honored — no dark mode, comments, search, animations |
| §10 Open questions (`social-studio` blurb, phone) | Placeholders in code; flagged in Task 12 step 9 follow-ups |

No placeholders other than the explicit `social-studio` blurb which is marked TBD in both spec §10 and the Projects component.
