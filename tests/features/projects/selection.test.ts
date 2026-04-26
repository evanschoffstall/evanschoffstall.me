import type { Project } from "contentlayer/generated";

import { describe, expect, test } from "bun:test";

import {
  groupAndSortProjects,
  pickFeaturedProjects,
} from "@/features/projects/model";

describe("groupAndSortProjects", () => {
  test("groups published projects by type and sorts each group by date", () => {
    const projects = [
      createProject({ date: "2024-02-01", slug: "main-new" }),
      createProject({ date: "2024-01-01", slug: "main-old" }),
      createProject({ contributor: true, date: "2024-03-01", slug: "contrib" }),
      createProject({ date: "2022-01-01", legacy: true, slug: "legacy" }),
      createProject({ date: "2024-04-01", published: false, slug: "draft" }),
      createProject({ date: "2024-05-01", slug: "excluded" }),
    ];

    const result = groupAndSortProjects(projects, ["excluded"]);

    expect(result.sorted.map((project) => project.slug)).toEqual([
      "main-new",
      "main-old",
    ]);
    expect(result.sortedContributions.map((project) => project.slug)).toEqual([
      "contrib",
    ]);
    expect(result.sortedLegacy.map((project) => project.slug)).toEqual([
      "legacy",
    ]);
  });
});

describe("pickFeaturedProjects", () => {
  test("prefers the configured featured project slugs when available", () => {
    const projects = [
      createProject({ date: "2024-01-01", slug: "gitaicmt" }),
      createProject({ date: "2024-01-02", slug: "librerss" }),
      createProject({
        date: "2024-01-03",
        slug: "example-traefik-multitenant-ssl",
      }),
      createProject({ date: "2024-01-04", slug: "other-project" }),
    ];

    const result = pickFeaturedProjects(projects);

    expect(result).not.toBeNull();
    expect(result?.featured.slug).toBe("librerss");
    expect(result?.second.slug).toBe("example-traefik-multitenant-ssl");
    expect(result?.third.slug).toBe("gitaicmt");
  });

  test("falls back to the most recent published projects when preferred slugs are missing", () => {
    const projects = [
      createProject({ date: "2024-01-01", slug: "oldest" }),
      createProject({ date: "2024-01-02", slug: "middle" }),
      createProject({ date: "2024-01-03", slug: "newest" }),
    ];

    const result = pickFeaturedProjects(projects);

    expect(result).not.toBeNull();
    expect([
      result?.featured.slug,
      result?.second.slug,
      result?.third.slug,
    ]).toEqual(["newest", "middle", "oldest"]);
  });

  test("returns null when fewer than three published projects exist", () => {
    const projects = [
      createProject({ slug: "first" }),
      createProject({ published: false, slug: "draft" }),
      createProject({ slug: "second" }),
    ];

    expect(pickFeaturedProjects(projects)).toBeNull();
  });
});

function createProject(overrides: Partial<Project> = {}): Project {
  const slug = typeof overrides.slug === "string" ? overrides.slug : "project";

  return {
    _id: slug,
    _raw: createRawFields(slug),
    body: { code: "", raw: "" },
    contributor: false,
    description: "description",
    legacy: false,
    published: true,
    slug,
    title: slug,
    ...overrides,
  } as Project;
}

function createRawFields(slug: string): Project["_raw"] {
  return {
    contentType: "mdx",
    flattenedPath: slug,
    sourceFileDir: "projects",
    sourceFileName: `${slug}.mdx`,
    sourceFilePath: `projects/${slug}.mdx`,
  };
}
