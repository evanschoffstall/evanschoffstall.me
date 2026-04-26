/** Regression coverage for the browser storage availability guard. */
import { afterEach, describe, expect, test } from "bun:test";

import { hasSessionStorage } from "@/shared";

import {
  installSessionStorageTestWindow,
  restoreSessionStorageTestWindow,
} from "../../../support/session-storage-test-window";

afterEach(() => {
  restoreSessionStorageTestWindow();
});

describe("hasSessionStorage", () => {
  test("returns false when window is unavailable", () => {
    restoreSessionStorageTestWindow();

    expect(hasSessionStorage()).toBe(false);
  });

  test("returns true when storage round-trips successfully", () => {
    installSessionStorageTestWindow();

    expect(hasSessionStorage()).toBe(true);
  });

  test("returns false when storage access throws", () => {
    installSessionStorageTestWindow({
      throwOnGet: true,
      throwOnRemove: true,
      throwOnSet: true,
    });

    expect(hasSessionStorage()).toBe(false);
  });
});
