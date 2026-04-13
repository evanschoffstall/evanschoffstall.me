/** Regression coverage for project-navigation session state stored in the browser. */
import { afterEach, describe, expect, test } from "bun:test";

import {
  consumeInternalProjectNavigation,
  markInternalProjectNavigation,
  resolveProjectBackNavigation,
} from "@/features/projects/browser/back-navigation";
import {
  consumeProjectsScrollPosition,
  registerProjectsViewport,
  saveProjectsScrollPosition,
} from "@/features/projects/browser/projects-scroll-session";

import {
  installSessionStorageTestWindow,
  restoreSessionStorageTestWindow,
} from "../../../lib/browser/session-storage/test-window";

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
  test("marks and consumes the internal project-navigation flag", () => {
    const { store } = installSessionStorageTestWindow();

    markInternalProjectNavigation();

    expect(store.get("projects:internal-navigation")).toBe("1");
    expect(consumeInternalProjectNavigation()).toBe(true);
    expect(store.has("projects:internal-navigation")).toBe(false);
  });

  test("routes project detail pages directly to the home projects section", () => {
    expect(
      resolveProjectBackNavigation("/projects/librerss", "", false),
    ).toEqual({
      href: "/#projects",
      kind: "push",
    });
  });

  test("routes project detail pages with trailing slash directly to the home projects section", () => {
    expect(
      resolveProjectBackNavigation("/projects/librerss/", "", false),
    ).toEqual({
      href: "/#projects",
      kind: "push",
    });
  });

  test("routes the projects route back to home", () => {
    expect(resolveProjectBackNavigation("/projects", "", false)).toEqual({
      href: "/",
      kind: "push",
    });
  });

  test("falls back to home for unknown routes", () => {
    expect(resolveProjectBackNavigation("/unknown", "", false)).toEqual({
      href: "/",
      kind: "push",
    });
  });

  test("uses browser history for external Librerss referrers", () => {
    expect(
      resolveProjectBackNavigation(
        "/projects/librerss",
        "https://app.librerss.com/feeds",
        false,
      ),
    ).toEqual({ kind: "history-back" });
  });

  test("prefers the deterministic projects target for internal project visits", () => {
    expect(
      resolveProjectBackNavigation(
        "/projects/librerss",
        "https://app.librerss.com/feeds",
        true,
      ),
    ).toEqual({
      href: "/#projects",
      kind: "push",
    });
  });

  // Regression: back navigation from a project slug must never produce
  // the double-hash URL /#projects#projects. This happens when the target is
  // /projects, which server-redirects to /#projects and then a second #projects
  // fragment gets appended by the Next.js router during the redirect.
  test("back navigation href never produces a double-hash URL", () => {
    const slugs = [
      "/projects/librerss",
      "/projects/gitaicmt",
      "/projects/evanschoffstall.me",
      "/projects/springgate-ecommerce",
      "/projects/open-emu",
    ];

    for (const pathname of slugs) {
      const result = resolveProjectBackNavigation(pathname, "", false);
      expect(result.kind).toBe("push");

      if (result.kind === "push") {
        expect(result.href).not.toContain("#projects#projects");
        expect(result.href).not.toBe("/projects");
        expect(result.href).toBe("/#projects");
      }
    }
  });

  test("back navigation href never routes through /projects server redirect", () => {
    // /projects triggers a server redirect to /#projects that can produce
    // a double-hash in the browser. The back target must be /#projects directly.
    const result = resolveProjectBackNavigation("/projects/any-slug", "", false);
    expect(result).toEqual({ href: "/#projects", kind: "push" });
    expect(result).not.toEqual({ href: "/projects", kind: "push" });
  });
});