import { hasSessionStorage } from "@/shared/browser";

const PROJECTS_SCROLL_Y_KEY = "projects:scrollY";
const PROJECTS_RESTORE_FLAG_KEY = "projects:restore";

/**
 * Tracks the mounted ScrollArea viewport so project-card navigation can persist
 * and restore the in-panel scroll position instead of relying on window scroll.
 */
let registeredProjectsViewport: HTMLElement | null = null;

/**
 * Reads the saved projects-panel scroll position when a restore was requested.
 * @returns The saved scroll position, or `null` when no valid restore state exists.
 */
export function consumeProjectsScrollPosition(): null | number {
  if (!hasSessionStorage()) {
    return null;
  }

  try {
    const shouldRestore =
      window.sessionStorage.getItem(PROJECTS_RESTORE_FLAG_KEY) === "1";
    if (!shouldRestore) {
      return null;
    }

    window.sessionStorage.removeItem(PROJECTS_RESTORE_FLAG_KEY);

    const rawScrollPosition = window.sessionStorage.getItem(
      PROJECTS_SCROLL_Y_KEY,
    );
    if (!rawScrollPosition) {
      return null;
    }

    const scrollPosition = Number(rawScrollPosition);
    if (!Number.isFinite(scrollPosition) || scrollPosition < 0) {
      return null;
    }

    return scrollPosition;
  } catch {
    return null;
  }
}

/**
 * Registers or clears the projects ScrollArea viewport element.
 * @param viewport - The current projects viewport element, or `null` to clear it.
 */
export function registerProjectsViewport(viewport: HTMLElement | null): void {
  registeredProjectsViewport = viewport;
}

/** Saves the current projects-panel scroll position for the next restore. */
export function saveProjectsScrollPosition(): void {
  if (!hasSessionStorage()) {
    return;
  }

  const scrollPosition = registeredProjectsViewport
    ? registeredProjectsViewport.scrollTop
    : window.scrollY;

  try {
    window.sessionStorage.setItem(
      PROJECTS_SCROLL_Y_KEY,
      String(scrollPosition),
    );
    window.sessionStorage.setItem(PROJECTS_RESTORE_FLAG_KEY, "1");
  } catch {
    // Silently fail if storage is full or disabled.
  }
}
