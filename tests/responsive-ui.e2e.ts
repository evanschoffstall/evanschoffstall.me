import { expect, test } from "./playwright";

test.describe("responsive ui", () => {
  test("keeps primary home actions visible on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /see all projects/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /replay intro/i }),
    ).toBeVisible();
  });

  test("keeps the project header actions usable on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/projects/librerss");

    await expect(page.getByRole("button", { name: "Go back" })).toBeVisible();
    await expect(page.getByRole("link", { name: /live site/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /repository/i })).toBeVisible();
  });
});