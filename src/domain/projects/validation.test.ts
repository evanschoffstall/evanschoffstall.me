import {
  extractSlugFromBody,
  isValidProjectSlug,
  validateProjectSlug,
} from "@/domain/projects/validation";
import { describe, expect, test } from "bun:test";

describe("validateProjectSlug", () => {
  test("accepts valid slug", () => {
    const result = validateProjectSlug("my-project-123");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.slug).toBe("my-project-123");
    }
  });

  test("accepts slug with dots and underscores", () => {
    const result = validateProjectSlug("project.name_v2");
    expect(result.valid).toBe(true);
  });

  test("trims whitespace", () => {
    const result = validateProjectSlug("  project  ");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.slug).toBe("project");
    }
  });

  test("rejects empty string", () => {
    const result = validateProjectSlug("");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("empty");
    }
  });

  test("rejects whitespace-only string", () => {
    const result = validateProjectSlug("   ");
    expect(result.valid).toBe(false);
  });

  test("rejects non-string input", () => {
    const result = validateProjectSlug(123);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("string");
    }
  });

  test("rejects slug with invalid characters", () => {
    const result = validateProjectSlug("project@#$");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("invalid characters");
    }
  });

  test("rejects slug with spaces", () => {
    const result = validateProjectSlug("my project");
    expect(result.valid).toBe(false);
  });

  test("rejects slug exceeding max length", () => {
    const longSlug = "a".repeat(200);
    const result = validateProjectSlug(longSlug);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("maximum length");
    }
  });

  test("rejects null", () => {
    const result = validateProjectSlug(null);
    expect(result.valid).toBe(false);
  });

  test("rejects undefined", () => {
    const result = validateProjectSlug(undefined);
    expect(result.valid).toBe(false);
  });
});

describe("isValidProjectSlug", () => {
  test("returns true for valid slug", () => {
    expect(isValidProjectSlug("my-project")).toBe(true);
  });

  test("returns false for invalid slug", () => {
    expect(isValidProjectSlug("my project")).toBe(false);
    expect(isValidProjectSlug("")).toBe(false);
    expect(isValidProjectSlug(123)).toBe(false);
    expect(isValidProjectSlug(null)).toBe(false);
  });
});

describe("extractSlugFromBody", () => {
  test("extracts valid slug from body", () => {
    const body = { slug: "my-project" };
    expect(extractSlugFromBody(body)).toBe("my-project");
  });

  test("returns null for missing slug field", () => {
    const body = { name: "project" };
    expect(extractSlugFromBody(body)).toBe(null);
  });

  test("returns null for invalid slug", () => {
    const body = { slug: "invalid slug with spaces" };
    expect(extractSlugFromBody(body)).toBe(null);
  });

  test("returns null for non-object body", () => {
    expect(extractSlugFromBody("string")).toBe(null);
    expect(extractSlugFromBody(123)).toBe(null);
    expect(extractSlugFromBody(null)).toBe(null);
  });

  test("returns null for slug field with wrong type", () => {
    const body = { slug: 123 };
    expect(extractSlugFromBody(body)).toBe(null);
  });

  test("trims whitespace from extracted slug", () => {
    const body = { slug: "  project  " };
    expect(extractSlugFromBody(body)).toBe("project");
  });
});
