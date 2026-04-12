"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SocialIconLinks } from "@/ui";
import { useIsIntersecting } from "@/ui/hooks";

interface Props {
  href?: string;
  label?: string;
  onBack?: () => void;
}

export function Navigation({ href = "/", label, onBack }: Props) {
  const { isIntersecting, ref } = useIsIntersecting<HTMLElement>();

  return (
    <header ref={ref}>
      <div
        className={`
          fixed inset-x-0 top-0 z-50 border-b backdrop-blur duration-200
          ${
          isIntersecting
            ? "border-transparent bg-zinc-900/0"
            : "border-zinc-800 bg-zinc-900/50"
        }
        `}
      >
        <div className="
          flex flex-row items-center justify-between px-4 py-3
          sm:px-6
        ">
          {onBack ? (
            <button
              aria-label={label ? `Back to ${label}` : "Back"}
              className="
                flex items-center gap-1.5 text-zinc-400 duration-200
                hover:text-zinc-100
              "
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="size-5" />
              {label && <span className="text-sm font-medium">{label}</span>}
            </button>
          ) : (
            <Link
              className="
                flex items-center gap-1.5 text-zinc-400 duration-200
                hover:text-zinc-100
              "
              href={href}
            >
              <ArrowLeft className="size-5" />
              {label && <span className="text-sm font-medium">{label}</span>}
            </Link>
          )}
          <SocialIconLinks />
        </div>
      </div>
    </header>
  );
}
