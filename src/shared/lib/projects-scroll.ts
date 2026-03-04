const PROJECTS_SCROLL_Y_KEY = "projects:scrollY";
const PROJECTS_RESTORE_FLAG_KEY = "projects:restore";

function hasSessionStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const test = "__storage_test__";
    window.sessionStorage.setItem(test, test);
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function saveProjectsScrollPosition(): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PROJECTS_SCROLL_Y_KEY,
      String(window.scrollY),
    );
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
