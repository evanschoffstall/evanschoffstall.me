"use client";

import { formatCompactNumber } from "@/shared/format";
import { markSkipHomeIntroOnce } from "@/shared/hero-intro";
import {
  isSafeExternalUrl,
  normalizeExternalHref,
  normalizeRepoHref,
} from "@/shared/urls";
import {
  ArrowLeft,
  Eye,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NavSocialLink = { href: string; icon: React.ReactNode; label: string };

/** Social links mirrored in the slug nav — identical set to home and projects nav. */
const SOCIAL_LINKS: NavSocialLink[] = [
  {
    href: "https://github.com/evanschoffstall",
    icon: <Github className="h-3 w-3" />,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/",
    icon: <Linkedin className="h-3 w-3" />,
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/evnschoffstall",
    icon: <Twitter className="h-3 w-3" />,
    label: "Twitter",
  },
  {
    href: "mailto:hello@evanschoffstall.me",
    icon: <Mail className="h-3 w-3" />,
    label: "Email",
  },
];

type Props = {
  project: {
    url?: string;
    title: string;
    description: string;
    repository?: string;
  };
  views: number;
  /**
   * When true the README takes over as the page title and description, so the
   * hero collapses to just the link buttons — no duplicate title/description.
   */
  hasReadme: boolean;
};

export function Header({ project, views, hasReadme }: Props) {
  const router = useRouter();

  const rawRepoHref = project.repository
    ? normalizeRepoHref(project.repository)
    : "";
  const rawWebsiteHref = project.url ? normalizeExternalHref(project.url) : "";

  /** Validated safe links — only rendered if they pass the allowlist check. */
  const repoHref = isSafeExternalUrl(rawRepoHref) ? rawRepoHref : "";
  const websiteHref = isSafeExternalUrl(rawWebsiteHref) ? rawWebsiteHref : "";

  const handleBack = () => {
    if (window.history.length > 1) {
      markSkipHomeIntroOnce();
      router.back();
      return;
    }

    markSkipHomeIntroOnce();
    router.push("/");
  };

  return (
    <header className="relative isolate overflow-hidden">
      {/* Fixed nav — consistent frosted style regardless of scroll position */}
      <div className="fixed inset-x-0 top-0 z-50 backdrop-blur border-b bg-zinc-900/0 border-transparent">
        <div className="flex flex-row items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: back arrow */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="duration-200 text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Right: view counter + social icons as one row */}
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 mr-1 text-xs tabular-nums text-zinc-600">
              <Eye className="h-3 w-3" /> {formatCompactNumber(views)}
            </span>
            {SOCIAL_LINKS.map((sl) => (
              <Link
                key={sl.label}
                href={sl.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sl.label}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-500 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200 sm:h-7 sm:w-7"
              >
                {sl.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero content — title + description are suppressed when a README takes over */}
      <div
        className={`container mx-auto relative isolate overflow-hidden ${hasReadme ? "pt-20 pb-6" : "py-16 sm:py-20"}`}
      >
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          {!hasReadme && (
            <>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                {project.title}
              </h1>
              <p className="text-lg leading-8 text-zinc-400">
                {project.description}
              </p>
            </>
          )}

          {/* Action buttons — live site + repository pill links */}
          {(repoHref || websiteHref) && (
            <div className="flex flex-wrap justify-center items-center gap-2">
              {websiteHref ? (
                <Link
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
                >
                  Live site <ExternalLink className="h-3 w-3" />
                </Link>
              ) : null}
              {repoHref ? (
                <Link
                  href={repoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
                >
                  Repository <Github className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
