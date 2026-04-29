/** Regression coverage for project-navigation session state stored in the browser. */
import { afterEach, describe, expect, test } from "bun:test";

import {
  consumeHomeIntroSkip,
  consumeInternalProjectNavigation,
  consumeProjectsScrollPosition,
  markInternalProjectNavigation,
  registerProjectsViewport,
  requestHomeIntroSkip,
  resolveProjectBackNavigation,
  saveProjectsScrollPosition,
} from "@/features/projects/browser";

import {
  installSessionStorageTestWindow,
  restoreSessionStorageTestWindow,
} from "../../support/session-storage-test-window";

afterEach(() => {
  registerProjectsViewport(null);
  restoreSessionStorageTestWindow();
});

describe("projects scroll session state", () => {
  test("returns null when restore was not requested", () => {
    installSessionStorageTestWindow();

    expect(consumeProjectsScrollPosition()).toBeNull();
  });

  test("returns null when the stored scroll position is missing", () => {
    const { store } = installSessionStorageTestWindow();
    store.set("projects:restore", "1");

    expect(consumeProjectsScrollPosition()).toBeNull();
    expect(store.has("projects:restore")).toBe(false);
  });

  test("returns null for invalid stored values", () => {
    const { store } = installSessionStorageTestWindow();
    store.set("projects:restore", "1");
    store.set("projects:scrollY", "NaN");

    expect(consumeProjectsScrollPosition()).toBeNull();

    store.set("projects:restore", "1");
    store.set("projects:scrollY", "-5");

    expect(consumeProjectsScrollPosition()).toBeNull();
  });

  test("returns the saved scroll position when restore is requested", () => {
    const { store } = installSessionStorageTestWindow();
    store.set("projects:restore", "1");
    store.set("projects:scrollY", "128");

    expect(consumeProjectsScrollPosition()).toBe(128);
    expect(store.has("projects:restore")).toBe(false);
  });

  test("returns null when reading project scroll state fails", () => {
    installSessionStorageTestWindow({ throwOnGet: true });

    expect(consumeProjectsScrollPosition()).toBeNull();
  });

  test("saves the registered viewport scroll position", () => {
    const { store } = installSessionStorageTestWindow({ scrollY: 24 });
    registerProjectsViewport({ scrollTop: 320 } as HTMLElement);

    saveProjectsScrollPosition();

    expect(store.get("projects:scrollY")).toBe("320");
    expect(store.get("projects:restore")).toBe("1");
  });

  test("falls back to window scrollY when no viewport is registered", () => {
    const { store } = installSessionStorageTestWindow({ scrollY: 72 });

    saveProjectsScrollPosition();

    expect(store.get("projects:scrollY")).toBe("72");
    expect(store.get("projects:restore")).toBe("1");
  });

  test("silently ignores write failures", () => {
    const { store } = installSessionStorageTestWindow({
      scrollY: 88,
      throwOnSet: true,
    });

    saveProjectsScrollPosition();

    expect(store.has("projects:scrollY")).toBe(false);
    expect(store.has("projects:restore")).toBe(false);
  });
});

describe("project back navigation", () => {
  test("marks and consumes the default projects navigation source", () => {
    const { store } = installSessionStorageTestWindow();

    markInternalProjectNavigation();

    expect(store.get("projects:internal-navigation")).toBe("projects");
    expect(consumeInternalProjectNavigation()).toBe("projects");
    expect(store.has("projects:internal-navigation")).toBe(false);
  });

  test("marks and consumes the featured-card navigation source", () => {
    const { store } = installSessionStorageTestWindow();

    markInternalProjectNavigation("featured");

    expect(store.get("projects:internal-navigation")).toBe("featured");
    expect(consumeInternalProjectNavigation()).toBe("featured");
    expect(store.has("projects:internal-navigation")).toBe(false);
  });

  test("consumes legacy boolean project-navigation flags as projects source", () => {
    const { store } = installSessionStorageTestWindow();
    store.set("projects:internal-navigation", "1");

    expect(consumeInternalProjectNavigation()).toBe("projects");
    expect(store.has("projects:internal-navigation")).toBe(false);
  });

  test("marks and consumes the one-time home intro skip flag", () => {
    const { store } = installSessionStorageTestWindow();

    requestHomeIntroSkip();

    expect(store.get("home:skip-intro")).toBe("1");
    expect(consumeHomeIntroSkip()).toBe(true);
    expect(store.has("home:skip-intro")).toBe(false);
    expect(consumeHomeIntroSkip()).toBe(false);
  });

  test("consumes the in-memory home intro skip flag when storage is unavailable", () => {
    requestHomeIntroSkip();

    expect(consumeHomeIntroSkip()).toBe(true);
    expect(consumeHomeIntroSkip()).toBe(false);
  });

  test("falls back to the in-memory home intro skip flag when storage reads fail", () => {
    installSessionStorageTestWindow({ throwOnGet: true });

    requestHomeIntroSkip();

    expect(consumeHomeIntroSkip()).toBe(true);
    expect(consumeHomeIntroSkip()).toBe(false);
  });

  test("routes project detail pages directly to the canonical projects route", () => {
    expect(
      resolveProjectBackNavigation("/projects/librerss", "", null),
    ).toEqual({
      href: "/projects",
      kind: "push",
    });
  });

  test("routes project detail pages with trailing slash directly to the projects route", () => {
    expect(
      resolveProjectBackNavigation("/projects/librerss/", "", null),
    ).toEqual({
      href: "/projects",
      kind: "push",
    });
  });

  test("routes the projects route back to home", () => {
    expect(resolveProjectBackNavigation("/projects", "", null)).toEqual({
      href: "/",
      kind: "push",
    });
  });

  test("falls back to home for unknown routes", () => {
    expect(resolveProjectBackNavigation("/unknown", "", null)).toEqual({
      href: "/",
      kind: "push",
    });
  });

  test("uses browser history for external Librerss referrers", () => {
    expect(
      resolveProjectBackNavigation(
        "/projects/librerss",
        "https://app.librerss.com/feeds",
        null,
      ),
    ).toEqual({ kind: "history-back" });
  });

  test("prefers the deterministic projects target for internal project visits", () => {
    expect(
      resolveProjectBackNavigation(
        "/projects/librerss",
        "https://app.librerss.com/feeds",
        "projects",
      ),
    ).toEqual({
      href: "/projects",
      kind: "push",
    });
  });

  test("routes featured-card project visits back to settled home", () => {
    expect(
      resolveProjectBackNavigation("/projects/librerss", "", "featured"),
    ).toEqual({
      href: "/",
      kind: "push",
      skipHomeIntro: true,
    });
  });

  test("back navigation href always uses the real projects route", () => {
    const slugs = [
      "/projects/librerss",
      "/projects/gitaicmt",
      "/projects/evanschoffstall.me",
      "/projects/springgate-ecommerce",
      "/projects/open-emu",
    ];

    for (const pathname of slugs) {
      const result = resolveProjectBackNavigation(pathname, "", null);
      expect(result.kind).toBe("push");

      if (result.kind === "push") {
        expect(result.href).not.toContain("#");
        expect(result.href).toBe("/projects");
      }
    }
  });

  test("back navigation href does not depend on a projects redirect", () => {
    const result = resolveProjectBackNavigation("/projects/any-slug", "", null);
    expect(result).toEqual({ href: "/projects", kind: "push" });
  });
});
