/**
 * Regression coverage for the class-name join helper.
 */
import { describe, expect, test } from "bun:test";

import { cn } from "@/shared/cn";

describe("cn", () => {
  test("joins only truthy class values", () => {
    expect(cn("base", undefined, false, "active", null, "accent")).toBe(
      "base active accent",
    );
  });
});