import { expect, test } from "./playwright";

/**
 * These assertions exercise the user-visible contract that matters most here:
 * the landing page renders, the projects drawer fills with published content,
 * and a README-backed project page loads its mirrored content.
 */
test.describe("content loads", () => {
  test("redirects the projects route into the hash-based projects view", async ({ page }) => {
    await page.goto("/projects");

    await expect(page).toHaveURL(/\/#projects$/);
    await expect(
      page.getByRole("button", { name: /back to projects/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Librerss" }),
    ).toBeVisible();
  });

  test("renders home page content and the projects panel", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/evanschoffstall\.me/i);
    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Technologist .* Engineer .* Business Officer/i),
    ).toBeVisible();

    const viewProjectsButton = page.getByRole("button", {
      name: /See all projects/i,
    });

    await expect(viewProjectsButton).toBeVisible();
    await viewProjectsButton.click();

    await expect(page).toHaveURL(/#projects$/);
    await expect(
      page.getByText(
        "Some of the projects are from work and some are on my own time.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Gitaicmt" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /back to projects/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
  });

  test("renders published project README content", async ({ page }) => {
    await page.goto("/projects/evanschoffstall.me");

    await expect(page).toHaveTitle(/evanschoffstall\.me/i);
    await expect(
      page.getByRole("heading", { name: "evanschoffstall.me" }),
    ).toBeVisible();
    await expect(
      page.getByText("Portfolio. Projects. Built in the open."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quick Start" }),
    ).toBeVisible();
  });

  test("renders published project MDX content when no mirrored README exists", async ({ page }) => {
    await page.goto("/projects/springgate-ecommerce");

    await expect(
      page.getByRole("heading", { name: "SpringGate E-Commerce" }),
    ).toBeVisible();
    await expect(
      page.getByText(/ordering options for pickup and local delivery/i),
    ).toBeVisible();
    await expect(
      page.getByText(/responsive design for optimal viewing experience/i),
    ).toBeVisible();
  });

  test("opens the projects view from a direct hash route", async ({ page }) => {
    await page.goto("/#projects");

    await expect(page).toHaveURL(/#projects$/);
    await expect(
      page.getByRole("button", { name: /back to projects/i }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Some of the projects are from work and some are on my own time.",
      ),
    ).toBeVisible();
  });

  test("renders the 404 status page and returns home", async ({ page }) => {
    await page.goto("/definitely-not-a-real-route");

    await expect(
      page.getByRole("heading", { name: "404" }),
    ).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();

    await page.getByRole("link", { name: "Go home" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
  });
});