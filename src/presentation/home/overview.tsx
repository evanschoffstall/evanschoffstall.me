"use client";

import { cn } from "@/shared/lib/cn";
import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/shared/lib/format";
import {
  isSafeExternalUrl,
  normalizeExternalHref,
  normalizeRepoHref,
} from "@/shared/lib/urls";
import type { Project } from "contentlayer/generated";
import { ArrowRight, ExternalLink, Github, Layers, Star } from "lucide-react";
import Link from "next/link";

type Props = {
  onViewProjects?: () => void;
  featuredProject?: Project;
  featuredViews?: number;
};

type StackTier = "lang" | "web" | "infra" | "data";

type StackItem = {
  label: string;
  tier: StackTier;
};

const stackItems: StackItem[] = [
  { label: "TypeScript", tier: "lang" },
  { label: "Rust", tier: "lang" },
  { label: "Python", tier: "lang" },
  { label: "C#", tier: "lang" },
  { label: "React", tier: "web" },
  { label: "Next.js", tier: "web" },
  { label: "Node.js", tier: "web" },
  { label: ".NET", tier: "web" },
  { label: "Docker", tier: "infra" },
  { label: "Neon", tier: "infra" },
  { label: "Oracle", tier: "infra" },
  { label: "PostgreSQL", tier: "data" },
  { label: "Redis", tier: "data" },
];

const tierStyle: Record<StackTier, string> = {
  lang: "bg-violet-950/50  text-violet-300  ring-violet-700/40",
  web: "bg-blue-950/50    text-blue-300    ring-blue-700/40",
  infra: "bg-sky-950/50     text-sky-300     ring-sky-700/40",
  data: "bg-emerald-950/50 text-emerald-300 ring-emerald-700/40",
};

const contextRows = [
  { label: "Experience", value: "15+ yrs · gov, enterprise, startup" },
  { label: "Current", value: "State-level procurement" },
  { label: "Past", value: "Winery: zero → multimillion revenue" },
  { label: "Style", value: "IC through executive; hands-on throughout" },
] as const;

/** Returns safe, validated external links for a project surface. */
function getFeaturedLinks(project: Project) {
  const repositoryHref = project.repository
    ? normalizeRepoHref(project.repository)
    : "";
  const liveHref = project.url ? normalizeExternalHref(project.url) : "";
  return {
    repositoryHref: isSafeExternalUrl(repositoryHref) ? repositoryHref : "",
    liveHref: isSafeExternalUrl(liveHref) ? liveHref : "",
  };
}

/** Thin horizontal gradient rule used as a section separator. */
function GradientRule() {
  return (
    <div
      className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent"
      aria-hidden
    />
  );
}

/**
 * Cardsless homepage body rendered beneath the animated hero name.
 *
 * Layout:
 *   - Bio (left) + Featured project (right) — two columns on lg+
 *   - "See all projects" slim row below both columns
 *   - Gradient rule
 *   - Context + Core Stack grid — technical depth as page anchor
 *
 * Status badge and social links live in the nav bar (content.tsx).
 */
export function HomeOverview({
  onViewProjects,
  featuredProject,
  featuredViews = 0,
}: Props) {
  const featuredLinks = featuredProject
    ? getFeaturedLinks(featuredProject)
    : null;
  const featuredDateTime = featuredProject?.date
    ? formatDateTime(featuredProject.date)
    : "";

  return (
    <div className="w-full space-y-6 pb-16 sm:space-y-7 sm:pb-20">
      {/* BIO + FEATURED: two columns on lg — intro on the left, featured work on the right */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-8 lg:items-start">
        {/* Left: bio / intro */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
            Technologist &middot; Engineer &middot; Business Officer
          </p>
          <p className="text-lg font-medium leading-7 text-zinc-200 sm:text-xl sm:leading-8 lg:text-2xl lg:leading-9">
            I close the gap between engineering and outcome &mdash;{" "}
            <span className="text-zinc-400">
              writing code that ships, infrastructure that scales, and
              organizations that compound on both.
            </span>
          </p>
          <p className="text-sm leading-7 text-zinc-500">
            15+ years across public sector, enterprise, and startups. Currently
            involved in state-level procurement; previously led a winery from
            inception to multimillion-dollar annual revenue.
          </p>
        </div>

        {/* Right: featured project */}
        {featuredProject ? (
          <div className="space-y-4 pt-5 lg:pt-0">
            {/* Separator — only visible when stacked in single-column (below lg) */}
            <div className="mb-1 block lg:hidden">
              <GradientRule />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/20">
                <Star className="h-2.5 w-2.5 fill-current" /> Featured
              </span>
              {featuredProject.date && featuredDateTime ? (
                <time
                  dateTime={featuredDateTime}
                  className="text-xs text-zinc-600"
                >
                  {formatMediumDate(featuredProject.date)}
                </time>
              ) : null}
              {featuredViews > 0 ? (
                <>
                  <span
                    className="select-none text-xs text-zinc-700"
                    aria-hidden
                  >
                    &middot;
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatCompactNumber(featuredViews)} views
                  </span>
                </>
              ) : null}
            </div>
            <Link
              href={`/projects/${featuredProject.slug}`}
              className="group inline-block"
            >
              <h2 className="font-display text-2xl tracking-tight text-zinc-100 transition-colors duration-200 group-hover:text-white sm:text-3xl lg:text-4xl">
                {featuredProject.title}
                <ArrowRight className="ml-2.5 inline-block h-6 w-6 align-text-bottom text-zinc-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-zinc-300" />
              </h2>
            </Link>
            <p className="text-sm leading-7 text-zinc-400 sm:text-[15px] sm:leading-relaxed">
              {featuredProject.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/projects/${featuredProject.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
              >
                Read notes <ArrowRight className="h-3 w-3" />
              </Link>
              {featuredLinks?.liveHref ? (
                <Link
                  href={featuredLinks.liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
                >
                  Live site <ExternalLink className="h-3 w-3" />
                </Link>
              ) : null}
              {featuredLinks?.repositoryHref ? (
                <Link
                  href={featuredLinks.repositoryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
                >
                  Repository <Github className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* SEE ALL PROJECTS — slim row spanning both columns */}
      <button
        type="button"
        onClick={onViewProjects}
        className="group flex w-full items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-900/30 px-3 py-2.5 text-left transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-800/40"
      >
        <span className="flex items-center gap-2 text-xs text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300">
          <Layers className="h-3.5 w-3.5 shrink-0" />
          See all projects
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-400" />
      </button>

      <GradientRule />

      {/* CONTEXT + STACK — technical depth as a natural page anchor */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9">
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
            Context
          </p>
          <dl className="space-y-2.5">
            {contextRows.map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[6rem_1fr] gap-x-3 text-sm"
              >
                <dt className="text-zinc-600">{label}</dt>
                <dd className="text-zinc-400">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Separator between Context and Stack in single-column (mobile) only */}
        <div className="block sm:hidden">
          <GradientRule />
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
            Core Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stackItems.map(({ label, tier }) => (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                  tierStyle[tier],
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
