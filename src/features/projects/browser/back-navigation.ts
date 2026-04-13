import { hasSessionStorage } from "@/lib/browser";

const INTERNAL_PROJECT_NAVIGATION_KEY = "projects:internal-navigation";
const LIBRERSS_HOSTNAME_PATTERN = /(^|\.)librerss\.com$/i;

type ProjectBackNavigation =
  | { href: string; kind: "push"; }
  | { kind: "history-back"; };

/** Reads and clears the one-time flag for internal project-page navigation. */
export function consumeInternalProjectNavigation(): boolean {
  if (!hasSessionStorage()) {
    return false;
  }

  try {
    const hasInternalNavigation =
      window.sessionStorage.getItem(INTERNAL_PROJECT_NAVIGATION_KEY) === "1";

    if (hasInternalNavigation) {
      window.sessionStorage.removeItem(INTERNAL_PROJECT_NAVIGATION_KEY);
    }

    return hasInternalNavigation;
  } catch {
    return false;
  }
}

/** Records that the current project-page visit started from an internal link. */
export function markInternalProjectNavigation(): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(INTERNAL_PROJECT_NAVIGATION_KEY, "1");
  } catch {
    // Silently fail if storage is full or disabled.
  }
}

/** Resolves the project-header back target from the current route and referrer. */
export function resolveProjectBackNavigation(
  pathname: string,
  referrer: string,
  hasInternalProjectNavigation: boolean,
): ProjectBackNavigation {
  if (
    !hasInternalProjectNavigation
    && isLibrerssReferrer(referrer)
  ) {
    return { kind: "history-back" };
  }

  return {
    href: resolveDeterministicBackTarget(pathname),
    kind: "push",
  };
}

/** Returns true when the browser referrer belongs to the Librerss origin family. */
function isLibrerssReferrer(referrer: string): boolean {
  if (!referrer) {
    return false;
  }

  try {
    const { hostname } = new URL(referrer);

    return LIBRERSS_HOSTNAME_PATTERN.test(hostname);
  } catch {
    return false;
  }
}

/** Normalizes pathname variants so the routing rules only handle canonical forms. */
function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

/** Maps in-app routes to the deterministic fallback target expected by the UI. */
function resolveDeterministicBackTarget(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname.startsWith("/projects/")) {
    // Navigate directly to the home page projects section instead of going
    // through /projects, which server-redirects to /#projects and can produce
    // the double-hash URL /#projects#projects in the browser.
    return "/#projects";
  }

  if (normalizedPathname === "/projects") {
    return "/";
  }

  return "/";
}