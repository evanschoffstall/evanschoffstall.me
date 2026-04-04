import { hasSessionStorage } from "@/shared/session-storage";

const PROJECTS_SCROLL_Y_KEY = "projects:scrollY";
const PROJECTS_RESTORE_FLAG_KEY = "projects:restore";

/**
 * Module-level reference to the Radix ScrollArea Viewport element used by the
 * projects list. Registered by HomeSections when the projects view mounts so
 * that saveProjectsScrollPosition can read the correct container's scrollTop
 * rather than window.scrollY (which is always 0 in a ScrollArea layout).
 */
let _viewport: HTMLElement | null = null;

/**
 * Register (or deregister) the projects ScrollArea viewport element.
 * Call with the element when the projects view mounts and with null on unmount.
 */
export function registerProjectsViewport(el: HTMLElement | null): void {
  _viewport = el;
}

export function saveProjectsScrollPosition(): void {
  if (!hasSessionStorage()) {
    return;
  }

  // Read from the registered ScrollArea viewport when available; fall back to
  // window.scrollY for any layout that still uses native body scroll.
  const scrollY = _viewport ? _viewport.scrollTop : window.scrollY;

  try {
    window.sessionStorage.setItem(PROJECTS_SCROLL_Y_KEY, String(scrollY));
    window.sessionStorage.setItem(PROJECTS_RESTORE_FLAG_KEY, "1");
  } catch {
    // Silently fail if storage is full or disabled
  }
}

export function consumeProjectsScrollPosition(): number | null {
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

    const raw = window.sessionStorage.getItem(PROJECTS_SCROLL_Y_KEY);
    if (!raw) {
      return null;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}
