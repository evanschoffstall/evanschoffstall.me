<div align="center">

<br/>

<img src="public/favicon.png" width="112" height="112" alt="evanschoffstall.me logo" />

<h1>evanschoffstall.me</h1>

<p><em>Beautiful modern showcase</em></p>

<p>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-runtime-F9F1E1?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License" /></a>
</p>

<p>My personal portfolio showcasing my projects, bleeding-edge UIX, and basal backend.</p>

<br/>

</div>

---

Personal portfolio and project showcase. Each project is provided a dedicated page with a description, links, and optionally the full README pulled in from GitHub.

## Stack

Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS · Framer Motion · Contentlayer · MDX · Upstash Redis · Bun

## Quick Start

```bash
bun install
cp .env.example .env.local  # optional: add Redis vars for live view counts
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

**Environment variables** (all optional):

```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## Commands

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `bun dev`                  | Build content, start dev server with Turbopack |
| `bun run build`            | Build content, then production Next.js build   |
| `bun run start`            | Start the production server                    |
| `bun run readmes:download` | Download and render GitHub READMEs locally     |
| `bun run clean`            | Remove `.next`, `.cache`, and `.contentlayer`  |

## Adding a Project

Create `public/projects/[slug].mdx` (or `public/projects/[slug]/content.mdx` for folder-based projects):

```mdx
---
title: Project Title
description: Brief description
date: "2024-01-01"
published: true
url: "https://project-url.com" # optional
repository: owner/repo # optional — used to sync README
contributor: false # true if you contributed but didn't create it
legacy: false # true to mark as archived
---

Your content here...
```

If a mirrored README exists for the project, it displays instead of the MDX body.

## Deployment

Optimized for [Vercel](https://vercel.com). Add the Redis environment variables to enable live view counts. Add `GITHUB_TOKEN` if syncing READMEs in CI.

---

<div align="center">

Made with ❤️ by [Evan Schoffstall](https://github.com/evanschoffstall)

</div>
