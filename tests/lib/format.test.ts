/**
 * Regression coverage for number and date formatting helpers.
 */
import { describe, expect, test } from "bun:test";

import {
  formatCompactNumber,
  formatDateTime,
  formatMediumDate,
} from "@/shared";

describe("formatCompactNumber", () => {
  test("formats numbers using the compact US locale formatter", () => {
    expect(formatCompactNumber(1200)).toBe("1.2K");
  });
});

describe("formatDateTime", () => {
  test("returns an ISO string for valid string input", () => {
    expect(formatDateTime("2024-01-02T03:04:05.000Z")).toBe(
      "2024-01-02T03:04:05.000Z",
    );
  });

  test("returns an ISO string for valid Date input", () => {
    expect(formatDateTime(new Date("2024-06-07T08:09:10.000Z"))).toBe(
      "2024-06-07T08:09:10.000Z",
    );
  });

  test("returns an empty string for invalid dates", () => {
    expect(formatDateTime("not-a-date")).toBe("");
  });
});

describe("formatMediumDate", () => {
  test("formats valid string input with the medium formatter", () => {
    const expected = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date("2024-03-15T00:00:00.000Z"));

    expect(formatMediumDate("2024-03-15T00:00:00.000Z")).toBe(expected);
  });

  test("formats valid Date input with the medium formatter", () => {
    const value = new Date("2024-12-25T00:00:00.000Z");
    const expected = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(value);

    expect(formatMediumDate(value)).toBe(expected);
  });

  test("returns an empty string for invalid dates", () => {
    expect(formatMediumDate("still-not-a-date")).toBe("");
  });
});
