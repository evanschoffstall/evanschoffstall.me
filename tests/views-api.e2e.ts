import { expect, test } from "./playwright";

const PUBLISHED_PROJECT_SLUG = "librerss";

test.describe("views api", () => {
  test("returns the published project views payload", async ({ request }) => {
    const response = await request.get("/api/views");

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();

    const payload = await response.json();

    expect(payload).toEqual({
      views: expect.any(Object),
    });
  });

  test("rejects non-json analytics requests", async ({ request }) => {
    const response = await request.fetch("/api/views", {
      data: `slug=${PUBLISHED_PROJECT_SLUG}`,
      headers: {
        "content-type": "text/plain",
      },
      method: "POST",
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toBe("must be json");
  });

  test("rejects invalid json payloads", async ({ request }) => {
    const response = await request.fetch("/api/views", {
      data: Buffer.from("{", "utf8"),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toBe("invalid json");
  });

  test("rejects invalid or missing slugs", async ({ request }) => {
    const response = await request.post("/api/views", {
      data: {
        slug: "   ",
      },
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toBe("Invalid or missing slug");
  });

  test("rejects unknown slugs", async ({ request }) => {
    const response = await request.post("/api/views", {
      data: {
        slug: "unknown-project",
      },
    });

    expect(response.status()).toBe(404);
    expect(await response.text()).toBe("Unknown slug");
  });

  test("accepts valid project slugs", async ({ request }) => {
    const response = await request.post("/api/views", {
      data: {
        slug: PUBLISHED_PROJECT_SLUG,
      },
    });

    expect(response.status()).toBe(202);
  });
});