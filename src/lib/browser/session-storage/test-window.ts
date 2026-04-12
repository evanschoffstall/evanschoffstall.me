const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);

interface SessionStorageTestWindowOptions {
  scrollY?: number;
  throwOnGet?: boolean;
  throwOnRemove?: boolean;
  throwOnSet?: boolean;
}

/** Installs a minimal window/sessionStorage pair for Bun browser-storage tests. */
export function installSessionStorageTestWindow(
  options: SessionStorageTestWindowOptions = {},
): { store: Map<string, string> } {
  const store = new Map<string, string>();
  const storage = createStorageStub(store, options);
  const windowStub = {
    scrollY: options.scrollY ?? 0,
    sessionStorage: storage,
  } as Pick<Window, "scrollY" | "sessionStorage"> as Window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowStub,
  });

  return { store };
}

/** Restores the original global window binding after storage-focused tests. */
export function restoreSessionStorageTestWindow(): void {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, "window");
}

function createStorageStub(
  store: Map<string, string>,
  options: SessionStorageTestWindowOptions,
): Storage {
  return {
    clear() {
      store.clear();
    },
    getItem(key) {
      if (options.throwOnGet) {
        throw new Error("get failed");
      }

      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
    removeItem(key) {
      if (options.throwOnRemove) {
        throw new Error("remove failed");
      }

      store.delete(key);
    },
    setItem(key, value) {
      if (options.throwOnSet) {
        throw new Error("set failed");
      }

      store.set(key, value);
    },
  };
}