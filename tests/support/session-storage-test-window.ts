const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

interface SessionStorageTestWindowOptions {
  hash?: string;
  pathname?: string;
  scrollY?: number;
  search?: string;
  throwOnGet?: boolean;
  throwOnRemove?: boolean;
  throwOnSet?: boolean;
}

interface ReplaceStateCall {
  state: unknown;
  title: string;
  url?: string | URL | null;
}

/**
 * Installs a minimal window/sessionStorage pair for Bun browser-storage tests.
 * @param options - Storage behavior overrides for the installed window stub.
 * @returns The backing store used by the installed sessionStorage stub.
 */
export function installSessionStorageTestWindow(
  options: SessionStorageTestWindowOptions = {},
): { replaceStateCalls: ReplaceStateCall[]; store: Map<string, string> } {
  const store = new Map<string, string>();
  const storage = createStorageStub(store, options);
  const replaceStateCalls: ReplaceStateCall[] = [];
  const locationStub = {
    hash: options.hash ?? "",
    pathname: options.pathname ?? "/",
    search: options.search ?? "",
  };
  const historyStub = {
    /** Records and applies same-origin replaceState calls for location tests. */
    replaceState(state: unknown, title: string, url?: string | URL | null) {
      replaceStateCalls.push({ state, title, url });

      if (url === undefined || url === null) return;

      const parsedUrl = new URL(String(url), "http://localhost");
      locationStub.hash = parsedUrl.hash;
      locationStub.pathname = parsedUrl.pathname;
      locationStub.search = parsedUrl.search;
    },
  } satisfies Pick<History, "replaceState">;
  const windowStub = {
    history: historyStub,
    location: locationStub,
    scrollY: options.scrollY ?? 0,
    sessionStorage: storage,
  } as Pick<
    Window,
    "history" | "location" | "scrollY" | "sessionStorage"
  > as Window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowStub,
  });

  return { replaceStateCalls, store };
}

/** Restores the original global window binding after storage-focused tests. */
export function restoreSessionStorageTestWindow(): void {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, "window");
}

/**
 * Builds a sessionStorage-compatible stub over a mutable Map.
 * @param store - The backing store used by the storage stub.
 * @param options - Behavioral overrides used to simulate storage failures.
 * @returns A `Storage` implementation suitable for browser-storage tests.
 */
function createStorageStub(
  store: Map<string, string>,
  options: SessionStorageTestWindowOptions,
): Storage {
  return {
    /** Clears every stored session key. */
    clear() {
      store.clear();
    },
    /**
     * Reads a stored session value.
     * @param key - The storage key to read.
     * @returns The stored value, or `null` when the key is absent.
     */
    getItem(key) {
      if (options.throwOnGet) {
        throw new Error("get failed");
      }

      return store.get(key) ?? null;
    },
    /**
     * Resolves the storage key at a specific numeric index.
     * @param index - The numeric position to resolve.
     * @returns The key at the requested position, or `null` when out of range.
     */
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    /** Reports the number of currently stored items. */
    get length() {
      return store.size;
    },
    /**
     * Removes a stored key from the stubbed storage.
     * @param key - The storage key to remove.
     */
    removeItem(key) {
      if (options.throwOnRemove) {
        throw new Error("remove failed");
      }

      store.delete(key);
    },
    /**
     * Persists a string value under the provided storage key.
     * @param key - The storage key to update.
     * @param value - The string value to store.
     */
    setItem(key, value) {
      if (options.throwOnSet) {
        throw new Error("set failed");
      }

      store.set(key, value);
    },
  };
}
