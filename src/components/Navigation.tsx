"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SocialIconLinks } from "@/components";

/** IntersectionObserver configuration forwarded to the tracked element watcher. */
interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Optional destination label and back action used by the shared top navigation bar.
 */
interface Props {
  href?: string;
  label?: string;
  onBack?: () => void;
  onNavigate?: () => void;
}

/**
 * Renders the shared top navigation bar used by the projects surfaces.
 * @param props - The optional href, label, and back handler for the navigation.
 * @returns The shared navigation bar.
 */
export function Navigation(props: Props) {
  const { href = "/", label, onBack, onNavigate } = props;

  const { isIntersecting, ref } = useIsIntersecting<HTMLElement>();

  return (
    <header ref={ref}>
      <div
        className={`
          fixed inset-x-0 top-0 z-50 border-b backdrop-blur-sm duration-200
          ${
            isIntersecting
              ? "border-transparent bg-zinc-900/0"
              : "border-zinc-800 bg-zinc-900/50"
          }
        `}
      >
        <div
          className="
          flex flex-row items-center justify-between px-4 py-3
          sm:px-6
        "
        >
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
              onClick={onNavigate}
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

/**
 * Tracks whether an observed element is intersecting the current viewport.
 * @param options - Intersection observer options for the tracked element.
 * @returns The observed ref and the current intersection state.
 */
function useIsIntersecting<T extends Element>(
  options: IntersectionOptions = {},
) {
  const { root, rootMargin, threshold } = options;
  const ref = useRef<null | T>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { root, rootMargin, threshold },
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold]);

  return { isIntersecting, ref };
}
