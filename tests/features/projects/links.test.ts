import { describe, expect, test } from "bun:test";

import { resolveProjectExternalLinks } from "@/features/projects/model/links";

describe("resolveProjectExternalLinks", () => {
  test("normalizes repository and live URLs", () => {
    expect(
      resolveProjectExternalLinks({
        repository: "evanschoffstall/evanschoffstall.me",
        url: "evanschoffstall.me",
      }),
    ).toEqual({
      liveHref: "https://evanschoffstall.me",
      repositoryHref: "https://github.com/evanschoffstall/evanschoffstall.me",
    });
  });

  test("drops invalid protocols", () => {
    expect(
      resolveProjectExternalLinks({
        repository: "javascript:alert(1)",
        url: "javascript:alert(1)",
      }),
    ).toEqual({
      liveHref: "",
      repositoryHref: "",
    });
  });

  test("returns empty links when project fields are missing", () => {
    expect(resolveProjectExternalLinks({})).toEqual({
      liveHref: "",
      repositoryHref: "",
    });
  });
});