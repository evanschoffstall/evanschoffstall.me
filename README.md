<div align="center">

<br/>

<img src="public/favicon.png" width="112" height="112" alt="evanschoffstall.me logo" />

<h1>evanschoffstall.me</h1>

<p><em>Portfolio. Projects. Built in the open.</em></p>

<p>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-runtime-F9F1E1?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License" /></a>
</p>

<p>My personal portfolio — project write-ups, live view counts, and smooth page transitions, all in one place.</p>

<br/>

</div>

---

## Overview

Personal portfolio and project showcase. Each project gets a dedicated page with a description, links, and optionally the full README pulled in from GitHub.

View counts are optional — the site works without any extra setup.

---

## Features

|     | Feature                     | Description                                                            |
| --- | --------------------------- | ---------------------------------------------------------------------- |
| 📝  | **Project pages from MDX**  | Write projects as Markdown files — pages are generated automatically   |
| 📄  | **Mirrored GitHub READMEs** | Optionally pull in a project's GitHub README and render it on the page |
| 👁️  | **Optional live views**     | Track how many times each project page has been visited                |
| 🎨  | **Syntax-highlighted code** | Code blocks rendered with accurate, theme-aware syntax highlighting    |
| ✨  | **Animated transitions**    | Smooth animations between the home page and project listings           |
| ♻️  | **Fast page loads**         | Pages are prebuilt at deploy time and refreshed in the background      |
| 📱  | **Responsive UI**           | Looks great on mobile, tablet, and desktop                             |

---

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Configure your environment

Copy the example file and fill in the values you need:

```bash
cp .env.example .env.local
```

```env
# Optional: enables live pageview tracking
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

Without these values the site still works — view counts just show zero.

### 3. Start the dev server

```bash
bun dev
```

`bun dev` processes content files and starts the dev server. To expose it on your local network:

```bash
bun run dev:local
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Refresh mirrored READMEs (optional)

```bash
bun run readmes:download
```

Downloads the latest README from each configured GitHub repository and saves a rendered copy locally.

---

## Stack

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| ⚡ Framework | Next.js 16 App Router · React 19 · TypeScript 5                |
| 🎨 UI        | Tailwind CSS · Framer Motion · Lucide React                    |
| 📝 Content   | Contentlayer · MDX · `rehype-pretty-code` · Shiki · remark-gfm |
| 📊 Analytics | Upstash Redis REST API                                         |
| 🏎️ Runtime   | Bun                                                            |

---

## Commands

| Command                      | Description                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `bun dev`                    | Contentlayer build, then start Next.js dev with Turbopack                     |
| `bun run dev:local`          | Same as `bun dev`, bound to `0.0.0.0:3000`                                    |
| `bun run build`              | Contentlayer build, then production Next.js build                             |
| `bun run start`              | Start the production Next.js server                                           |
| `bun run contentlayer:build` | Run the one-shot Contentlayer build script                                    |
| `bun run contentlayer:dev`   | Start Contentlayer in watch mode                                              |
| `bun run test:e2e`           | Run Playwright browser tests against an isolated app                          |
| `bun run readmes:download`   | Download and render GitHub READMEs into `public/projects/[slug]/content.html` |
| `bun run clean`              | Remove `.next`, `.cache`, and `.contentlayer`                                 |
| `bun run types`              | Type-check the project with `tsc --noEmit`                                    |

Unit tests use `bun:test`. Run them with:

```bash
bun test
```

Browser tests use Playwright and start a dedicated app on port `3100` with its
own `.next-playwright` output so your regular `.next` build stays untouched:

```bash
bun run test:e2e
```

---

## Adding a Project

Create a new MDX file using whichever layout fits:

- **Flat** (no other project assets): `public/projects/[slug].mdx`
- **Folder** (alongside images, HTML, or other assets): `public/projects/[slug]/content.mdx`

```mdx
---
title: Project Title
description: Brief description
date: "2024-01-01"
published: true
url: "https://project-url.com"
repository: owner/repo
contributor: false # true if you contributed to but didn't create it
legacy: false # true to mark as archived or old work
---

Your content here...
```

- `repository` is the `owner/repo` GitHub path — used to sync the README.
- `url`, `repository`, `contributor`, `legacy`, and `date` are all optional.
- Set `published: true` to make the project visible on the site.
- If a mirrored README exists for the project, it displays instead of the MDX body.

---

## Deployment

Optimized for [Vercel](https://vercel.com).

- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to enable live view counts.
- Add `GITHUB_TOKEN` if syncing READMEs in CI to avoid GitHub rate limits.
- Redis is fully optional — the site works without it.

---

<div align="center">

Made with ❤️ by [Evan Schoffstall](https://github.com/evanschoffstall)

</div>
