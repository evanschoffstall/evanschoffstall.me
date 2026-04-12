/**
 * Thin guard around the browser sessionStorage API.
 *
 * Returns false during SSR (no window) and when the browser has denied
 * storage access, so callers can skip storage operations gracefully.
 */
export function hasSessionStorage(): boolean {
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