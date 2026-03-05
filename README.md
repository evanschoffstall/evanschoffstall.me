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

<p>Personal portfolio built with Next.js 16 — MDX-powered project pages, live view counts,<br/>syntax-highlighted code, and smooth animations. Fast, minimal, and fully open source.</p>

<br/>

</div>

---

## What is this?

This is my personal portfolio site. It hosts write-ups for my projects, tracks page views with Upstash Redis, and renders MDX content via Contentlayer. The design prioritizes speed and clarity over flash.

---

## Features

|     | Feature                 | Description                                             |
| --- | ----------------------- | ------------------------------------------------------- |
| 📝  | **MDX project pages**   | Write project content in Markdown with React components |
| 👁️  | **Live view counts**    | Per-page view tracking powered by Upstash Redis         |
| 🎨  | **Syntax highlighting** | Beautiful code blocks via Shiki                         |
| ✨  | **Smooth animations**   | Page and element transitions with Framer Motion         |
| 📱  | **Responsive layout**   | Tailwind CSS — looks right on every screen              |
| 🗂️  | **Contentlayer**        | Type-safe MDX processing with hot reload in dev         |

---

## Quick Start

### 1 · Install dependencies

```bash
bun install
```

### 2 · Configure your environment

Create `.env.local` at the project root:

```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3 · Start the dev server

```bash
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** and you're live.

---

## Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| ⚡ Framework | Next.js 16 · React 19 · TypeScript 5        |
| 🎨 UI        | Tailwind CSS · Framer Motion · Lucide Icons |
| 📝 Content   | Contentlayer · MDX · Shiki                  |
| 📊 Analytics | Upstash Redis                               |
| 🏎️ Runtime   | Bun                                         |

---

## Scripts

| Command                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `bun dev`                    | Start dev server with Contentlayer watch      |
| `bun build`                  | Build for production                          |
| `bun start`                  | Start production server                       |
| `bun run contentlayer:build` | One-shot Contentlayer build                   |
| `bun run readmes:download`   | Fetch latest READMEs from GitHub              |
| `bun run clean`              | Remove `.next`, `.cache`, and `.contentlayer` |
| `bun run types`              | TypeScript type check (no emit)               |
| `bun test`                   | Run test suite                                |

---

## Adding a Project

Create a new MDX file in `content/projects/`:

```mdx
---
title: "Project Title"
description: "Brief description"
date: "2024-01-01"
published: true
url: "https://project-url.com"
repository: "https://github.com/user/repo"
contributor: false # true if you contributed to but didn't create it
legacy: false # true to mark as archived / old work
---

Your content here...
```

Contentlayer picks it up automatically — no registration needed.

---

## Project Structure

```
evanschoffstall.me/
├── src/
│   ├── app/                  # Next.js App Router (pages & API routes)
│   ├── presentation/
│   │   ├── components/       # UI components (nav, cards, MDX renderer)
│   │   └── hooks/            # Shared React hooks
│   ├── application/          # Use-case / service layer
│   ├── domain/               # Domain logic and policies
│   ├── infrastructure/       # Redis client and external adapters
│   └── shared/               # Cross-cutting utilities (cn, format, motion)
├── content/
│   └── projects/             # MDX source files for each project
├── public/                   # Static assets and downloaded READMEs
└── scripts/                  # Dev utilities (contentlayer, readme download)
```

---

## Deployment

Optimized for [Vercel](https://vercel.com). Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your project environment and deploy.

---

<div align="center">

Made with ❤️ by [Evan Schoffstall](https://github.com/evanschoffstall)

MIT License · Free forever · Open source

</div>
