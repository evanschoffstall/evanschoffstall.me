import { describe, expect, test } from "bun:test";

import {
  addReadmeHeadingIds,
  slugifyHeadingText,
} from "@/features/projects/model";

describe("slugifyHeadingText", () => {
  test("creates GitHub-style slugs from heading text", () => {
    expect(slugifyHeadingText("Development")).toBe("development");
    expect(slugifyHeadingText("Local development")).toBe("local-development");
  });

  test("uses rendered text from inline heading markup", () => {
    expect(
      slugifyHeadingText("Configure <code>gitaicmt</code> &amp; Git"),
    ).toBe("configure-gitaicmt-git");
  });
});

describe("addReadmeHeadingIds", () => {
  test("adds ids to headings that do not already have them", () => {
    expect(addReadmeHeadingIds('<h2 dir="auto">Development</h2>')).toBe(
      '<h2 dir="auto" id="development">Development</h2>',
    );
  });

  test("preserves existing heading ids", () => {
    expect(addReadmeHeadingIds('<h2 id="custom">Development</h2>')).toBe(
      '<h2 id="custom">Development</h2>',
    );
  });

  test("deduplicates repeated headings", () => {
    expect(
      addReadmeHeadingIds("<h2>Usage</h2><h3>Usage</h3><h4>Usage</h4>"),
    ).toBe(
      '<h2 id="usage">Usage</h2><h3 id="usage-1">Usage</h3><h4 id="usage-2">Usage</h4>',
    );
  });
});
