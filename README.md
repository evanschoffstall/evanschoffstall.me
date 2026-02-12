# evanschoffstall.me

Personal portfolio website built with Next.js 16, showcasing projects and technical writing.

## ✨ Features

- MDX-powered project content with Contentlayer
- View tracking with Upstash Redis
- Syntax highlighting with Shiki
- Smooth animations with Framer Motion
- Responsive design with Tailwind CSS

## 🛠 Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Contentlayer** for MDX processing
- **Tailwind CSS** with Typography plugin
- **Upstash Redis** for analytics
- **Shiki** for code syntax highlighting
- **Framer Motion** for animations

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev
```

Set up environment variables in `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 📁 Project Structure

```
app/              # Next.js App Router
  components/     # React components
  projects/       # Project pages
content/
  projects/       # MDX project files
lib/              # Utilities and Redis client
pages/api/        # API routes
```

## ➕ Adding Projects

Create a new MDX file in `content/projects/`:

```mdx
---
title: "Project Title"
description: "Brief description"
date: "2024-01-01"
published: true
url: "https://project-url.com"
repository: "https://github.com/user/repo"
---

Your content here...
```

## 💻 Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server

## 🌐 Deployment

Optimized for [Vercel](https://vercel.com). Configure environment variables and deploy.

---

Made with ❤️ by Evan Schoffstall
