import { Redis } from "@upstash/redis";
import { beforeAll, describe, expect, mock, spyOn, test } from "bun:test";

import {
  getProjectView,
  getProjectViews,
  incrementProjectView,
} from "@/features/projects/model";

const redisGet = mock(async () => 12);
const redisIncrement = mock(async () => 1);
const redisMultiGet = mock(async () => ["7", -2, "bad"]);
const redisSet = mock(async (): Promise<"OK" | null> => "OK");

const redisClient = {
  get: redisGet,
  incr: redisIncrement,
  mget: redisMultiGet,
  set: redisSet,
} as unknown as ReturnType<typeof Redis.fromEnv>;

describe("project views", () => {
  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";

    spyOn(Redis, "fromEnv").mockReturnValue(redisClient);
  });

  test("reads a single project view count from Redis", async () => {
    await expect(getProjectView("librerss")).resolves.toBe(12);

    expect(redisGet).toHaveBeenCalledWith("pageviews:projects:librerss");
  });

  test("reads multiple view counts and normalizes unsafe values", async () => {
    await expect(
      getProjectViews(["librerss", "negative", "invalid"]),
    ).resolves.toEqual({
      invalid: 0,
      librerss: 7,
      negative: 0,
    });

    expect(redisMultiGet).toHaveBeenCalledWith(
      "pageviews:projects:librerss",
      "pageviews:projects:negative",
      "pageviews:projects:invalid",
    );
  });

  test("increments immediately when no caller IP is available", async () => {
    await incrementProjectView("librerss", null);

    expect(redisIncrement).toHaveBeenCalledWith("pageviews:projects:librerss");
  });

  test("deduplicates increments by caller IP", async () => {
    await incrementProjectView("gitaicmt", "203.0.113.10");

    const [dedupeKey, dedupeValue, dedupeOptions] = redisSet.mock.calls.at(
      -1,
    ) ?? ["", false, {}];

    expect(dedupeKey).toStartWith("deduplicate:");
    expect(dedupeKey).toEndWith(":gitaicmt");
    expect(dedupeValue).toBe(true);
    expect(dedupeOptions).toEqual({ ex: 60 * 60 * 24, nx: true });
    expect(redisIncrement).toHaveBeenCalledWith("pageviews:projects:gitaicmt");
  });

  test("skips duplicate caller IP increments", async () => {
    redisSet.mockResolvedValueOnce(null);

    const previousIncrementCount = redisIncrement.mock.calls.length;
    await incrementProjectView("gitaicmt", "203.0.113.10");

    expect(redisIncrement).toHaveBeenCalledTimes(previousIncrementCount);
  });
});
