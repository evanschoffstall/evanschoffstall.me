import { expect, test } from "./playwright";

const HOME_INTRO_TIMEOUT_MS = 20_000;

test.describe("home navigation", () => {
  test("navigates from featured project card to the project page", async ({
    page,
  }) => {
    await page.goto("/");

    const readNotesLink = page
      .getByRole("link", { name: /read notes/i })
      .first();
    await expect(readNotesLink).toBeVisible({ timeout: HOME_INTRO_TIMEOUT_MS });
    await readNotesLink.click();

    await expect(page).toHaveURL(/\/projects\/librerss$/);
    await expect(
      page.getByRole("button", { name: /back to project list/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Librerss" })).toBeVisible();
  });

  test("opens the projects route from the landing page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /see all projects/i }).click();
    await expect(page).toHaveURL(/\/projects$/);
    expect(page.url()).not.toContain("#projects");

    await expect(page.getByRole("heading", { name: "Librerss" })).toBeVisible();
    await page.getByRole("link", { name: /home/i }).click();
    await expect(page).toHaveURL(/\/$/);

    const heroHeading = page.getByRole("heading", {
      name: "Evan Schoffstall",
    });
    await expect(heroHeading).toBeVisible({ timeout: 250 });
    await expect(heroHeading).not.toHaveCSS("position", "fixed", {
      timeout: 250,
    });
    await expect(
      page.getByRole("link", { name: /see all projects/i }),
    ).toBeVisible({ timeout: 250 });
  });

  test("skips the home intro when returning from a featured project", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /read notes/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/librerss$/);
    await page.getByRole("button", { name: /back to project list/i }).click();

    await expect(page).toHaveURL(/\/$/);

    const heroHeading = page.getByRole("heading", {
      name: "Evan Schoffstall",
    });

    await expect(heroHeading).toBeVisible({ timeout: 250 });
    await expect(heroHeading).not.toHaveCSS("position", "fixed", {
      timeout: 250,
    });
    await expect(
      page.getByRole("button", { name: /replay intro/i }),
    ).toBeVisible({ timeout: 250 });
    await expect(
      page.getByRole("link", { name: /see all projects/i }),
    ).toBeVisible({ timeout: 250 });
  });

  test("replays the intro without breaking the home hero", async ({ page }) => {
    await page.goto("/");

    const replayButton = page.getByRole("button", { name: /replay intro/i });
    await expect(replayButton).toBeVisible({ timeout: HOME_INTRO_TIMEOUT_MS });
    await replayButton.click();

    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toHaveCSS("position", "fixed", { timeout: 250 });

    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible({ timeout: HOME_INTRO_TIMEOUT_MS });
    await expect(
      page.getByRole("link", { name: /see all projects/i }),
    ).toBeVisible({ timeout: HOME_INTRO_TIMEOUT_MS });
  });
});
