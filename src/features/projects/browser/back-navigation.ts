import { hasSessionStorage } from "@/shared/browser";

const INTERNAL_PROJECT_NAVIGATION_KEY = "projects:internal-navigation";
const SKIP_HOME_INTRO_KEY = "home:skip-intro";
const LIBRERSS_HOSTNAME_PATTERN = /(^|\.)librerss\.com$/i;

/** In-app surface that initiated project-detail navigation. */
type InternalProjectNavigationSource = "featured" | "projects";

/**
 * Back-navigation decision returned by the project detail page, either using browser history or a fallback href.
 */
type ProjectBackNavigation =
  | { href: string; kind: "push"; skipHomeIntro?: boolean }
  | { kind: "history-back" };

/**
 * Reads and clears the one-time home intro skip flag.
 * @returns `true` when the next home render should start in its settled state.
 */
export function consumeHomeIntroSkip(): boolean {
  if (!hasSessionStorage()) {
    return false;
  }

  try {
    const shouldSkipHomeIntro =
      window.sessionStorage.getItem(SKIP_HOME_INTRO_KEY) === "1";

    if (shouldSkipHomeIntro) {
      window.sessionStorage.removeItem(SKIP_HOME_INTRO_KEY);
    }

    return shouldSkipHomeIntro;
  } catch {
    return false;
  }
}

/**
 * Reads and clears the one-time flag for internal project-page navigation.
 * @returns The in-app source that opened the project page, or `null` for external/direct visits.
 */
export function consumeInternalProjectNavigation(): InternalProjectNavigationSource | null {
  if (!hasSessionStorage()) {
    return null;
  }

  try {
    const navigationSource = normalizeInternalProjectNavigationSource(
      window.sessionStorage.getItem(INTERNAL_PROJECT_NAVIGATION_KEY),
    );

    if (navigationSource) {
      window.sessionStorage.removeItem(INTERNAL_PROJECT_NAVIGATION_KEY);
    }

    return navigationSource;
  } catch {
    return null;
  }
}

/**
 * Records that the current project-page visit started from an internal link.
 * @param source - The in-app surface that opened the project detail page.
 */
export function markInternalProjectNavigation(
  source: InternalProjectNavigationSource = "projects",
): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(INTERNAL_PROJECT_NAVIGATION_KEY, source);
  } catch {
    // Silently fail if storage is full or disabled.
  }
}

/** Records that the next home-page render should skip the landing intro animation. */
export function requestHomeIntroSkip(): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(SKIP_HOME_INTRO_KEY, "1");
  } catch {
    // Silently fail if storage is full or disabled.
  }
}

/**
 * Resolves the project-header back target from the current route and referrer.
 * @param pathname - The current route pathname for the project surface.
 * @param referrer - The browser referrer recorded for the current page visit.
 * @param internalProjectNavigationSource - Indicates which in-app surface opened
 * the current project visit, or `null` for direct/external visits.
 * @returns The navigation action that should run when the user presses Back.
 */
export function resolveProjectBackNavigation(
  pathname: string,
  referrer: string,
  internalProjectNavigationSource: InternalProjectNavigationSource | null,
): ProjectBackNavigation {
  if (!internalProjectNavigationSource && isLibrerssReferrer(referrer)) {
    return { kind: "history-back" };
  }

  return {
    ...resolveDeterministicBackTarget(
      pathname,
      internalProjectNavigationSource,
    ),
    kind: "push",
  };
}

/**
 * Returns true when the browser referrer belongs to the Librerss origin family.
 * @param referrer - The browser referrer string to inspect.
 * @returns `true` when the referrer belongs to a Librerss hostname.
 */
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

/**
 * Collapses legacy boolean flags and current source names to canonical source values.
 * @param value - The stored internal project-navigation value.
 * @returns A canonical source value, or `null` when no valid source was stored.
 */
function normalizeInternalProjectNavigationSource(
  value: null | string,
): InternalProjectNavigationSource | null {
  if (value === "featured" || value === "projects") {
    return value;
  }

  if (value === "1") {
    return "projects";
  }

  return null;
}

/**
 * Normalizes pathname variants so the routing rules only handle canonical forms.
 * @param pathname - The pathname to normalize before applying routing rules.
 * @returns A canonical pathname with empty or trailing-slash variants collapsed.
 */
function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

/**
 * Maps in-app routes to the deterministic fallback target expected by the UI.
 * @param pathname - The current pathname for the project or projects surface.
 * @param internalProjectNavigationSource - The in-app source that opened the
 * project detail page, or `null` for direct/external visits.
 * @returns The deterministic back-navigation href expected by the UI.
 */
function resolveDeterministicBackTarget(
  pathname: string,
  internalProjectNavigationSource: InternalProjectNavigationSource | null,
): { href: string; skipHomeIntro?: boolean } {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname.startsWith("/projects/")) {
    if (internalProjectNavigationSource === "featured") {
      return { href: "/", skipHomeIntro: true };
    }

    // Navigate directly to the home page projects section instead of going
    // through /projects, which server-redirects to /#projects and can produce
    // the double-hash URL /#projects#projects in the browser.
    return { href: "/#projects" };
  }

  if (normalizedPathname === "/projects") {
    return { href: "/" };
  }

  return { href: "/" };
}
