const SKIP_HOME_INTRO_ONCE_KEY = "skip-home-intro-once";

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

export function markSkipHomeIntroOnce(): void {
  if (!hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(SKIP_HOME_INTRO_ONCE_KEY, "1");
  } catch {
    // Silently fail if storage is full or disabled
  }
}

export function consumeSkipHomeIntroOnce(): boolean {
  if (!hasSessionStorage()) {
    return false;
  }

  try {
    const shouldSkip =
      window.sessionStorage.getItem(SKIP_HOME_INTRO_ONCE_KEY) === "1";

    if (shouldSkip) {
      window.sessionStorage.removeItem(SKIP_HOME_INTRO_ONCE_KEY);
    }

    return shouldSkip;
  } catch {
    return false;
  }
}
