"use client";

import { useIsIntersecting } from "@/presentation/hooks/use-is-intersecting";
import { ArrowLeft, Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

type Props = {
  href?: string;
  onBack?: () => void;
  label?: string;
};

const SOCIAL_LINKS = [
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
] as const;

export function Navigation({ href = "/", onBack, label }: Props) {
  const { ref, isIntersecting } = useIsIntersecting<HTMLElement>();

  return (
    <header ref={ref}>
      <div
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur duration-200 border-b ${
          isIntersecting
            ? "bg-zinc-900/0 border-transparent"
            : "bg-zinc-900/50 border-zinc-800"
        }`}
      >
        <div className="flex flex-row items-center justify-between px-4 py-3 sm:px-6">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 duration-200 text-zinc-400 hover:text-zinc-100"
              aria-label={label ? `Back to ${label}` : "Back"}
            >
              <ArrowLeft className="w-5 h-5" />
              {label && <span className="text-sm font-medium">{label}</span>}
            </button>
          ) : (
            <Link
              href={href}
              className="flex items-center gap-1.5 duration-200 text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft className="w-5 h-5" />
              {label && <span className="text-sm font-medium">{label}</span>}
            </Link>
          )}

          <div className="flex items-center gap-1">
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
    </header>
  );
}
