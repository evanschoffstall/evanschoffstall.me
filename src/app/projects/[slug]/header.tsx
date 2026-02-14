"use client";

import { useIsIntersecting } from "@/presentation/hooks/use-is-intersecting";
import { formatCompactNumber } from "@/shared/lib/format";
import { ArrowLeft, Eye, Github } from "lucide-react";
import Link from "next/link";

type Props = {
  project: {
    url?: string;
    title: string;
    description: string;
    repository?: string;
  };

  views: number;
};

function normalizeRepoHref(repository: string): string {
  const trimmed = repository.trim().replace(/\/+$/g, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^github\.com\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://github.com/${trimmed}`;
}

export function Header({ project, views }: Props) {
  const { ref, isIntersecting } = useIsIntersecting<HTMLElement>();

  const links: { label: string; href: string }[] = [];
  const repoHref = project.repository ? normalizeRepoHref(project.repository) : "";
  if (repoHref) {
    links.push({
      label: "GitHub",
      href: repoHref,
    });
  }
  if (project.url?.trim()) {
    links.push({
      label: "Website",
      href: project.url.trim(),
    });
  }
  return (
    <header
      ref={ref}
      className="relative isolate overflow-hidden bg-gradient-to-tl from-black via-zinc-900 to-black"
    >
      <div
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur duration-200 border-b ${isIntersecting
          ? "bg-zinc-900/0 border-transparent"
          : "bg-zinc-900/50 border-zinc-800"
          }`}
      >
        <div className="container flex flex-row items-center justify-between p-4 mx-auto">
          <Link
            href="/projects"
            className="duration-200 text-zinc-300 hover:text-zinc-100"
          >
            <ArrowLeft className="w-6 h-6 " />
          </Link>

          <div className="flex justify-between gap-8">
            <span
              title="View counter for this page"
              className="duration-200 hover:font-medium flex items-center gap-1 text-zinc-300 hover:text-zinc-100"
            >
              <Eye className="w-5 h-5" />{" "}
              {formatCompactNumber(views)}
            </span>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={repoHref || "https://github.com/evanschoffstall"}
              aria-label={repoHref ? "View repository on GitHub" : "View profile on GitHub"}
            >
              <Github
                className="w-6 h-6 duration-200 hover:font-medium text-zinc-300 hover:text-zinc-100"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto relative isolate overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
              {project.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              {project.description}
            </p>
          </div>

          <div className="mx-auto mt-5 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-y-6 gap-x-8 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
              {links.map((link) => (
                <Link target="_blank" rel="noopener noreferrer" key={link.label} href={link.href}>
                  {link.label} <span aria-hidden="true">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
