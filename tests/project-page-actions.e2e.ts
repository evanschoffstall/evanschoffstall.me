import { expect, test } from "./playwright";

test.describe("project page actions", () => {
  test("restores the projects panel scroll position after opening a project card", async ({ page }) => {
    await page.setViewportSize({ height: 720, width: 390 });
    await page.goto("/#projects");

    await page.waitForFunction(() => {
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );

      if (!(viewport instanceof HTMLDivElement)) {
        return false;
      }

      viewport.scrollTop = viewport.scrollHeight;
      return viewport.scrollTop > 0;
    });

    await page
      .getByRole("heading", { name: "SpringGate E-Commerce" })
      .click();

    await expect(page).toHaveURL(/\/projects\/springgate-ecommerce$/);

    await page.getByRole("button", { name: "Go back" }).click();

    await expect(page).toHaveURL(/\/#projects$/);
    await expect.poll(async () =>
      await page.evaluate(() => {
        const viewport = document.querySelector(
          "[data-radix-scroll-area-viewport]",
        );

        return viewport instanceof HTMLDivElement ? viewport.scrollTop : -1;
      })
    ).toBeGreaterThan(0);
    await expect(
      page.getByRole("heading", { name: "SpringGate E-Commerce" }),
    ).toBeVisible();
  });

  test("shows external project actions with safe targets", async ({ page }) => {
    await page.goto("/projects/librerss");

    const liveSiteLink = page.getByRole("link", { name: /live site/i });
    const repositoryLink = page.getByRole("link", { name: /repository/i });

    await expect(liveSiteLink).toBeVisible();
    await expect(repositoryLink).toBeVisible();
    await expect(liveSiteLink).toHaveAttribute("target", "_blank");
    await expect(repositoryLink).toHaveAttribute("target", "_blank");
    await expect(liveSiteLink).toHaveAttribute("rel", /noopener/);
    await expect(repositoryLink).toHaveAttribute("rel", /noopener/);
    await expect(liveSiteLink).toHaveAttribute("href", /^https?:\/\//);
    await expect(repositoryLink).toHaveAttribute("href", /^https:\/\/github\.com\//);
  });

  test("reports project views through fetch when sendBeacon is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "sendBeacon", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "cancelIdleCallback", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "requestIdleCallback", {
        configurable: true,
        value: undefined,
      });
    });

    const viewReportResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/views")
        && response.request().method() === "POST",
    );

    await page.goto("/projects/springgate-ecommerce");

    expect((await viewReportResponse).status()).toBe(202);
  });

  test("routes project back navigation through projects before returning home", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /read notes/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/librerss$/);

    await page.getByRole("button", { name: "Go back" }).click();

    await expect(
      page.getByRole("button", { name: /back to projects/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /back to projects/i }).click();

    await expect(page).toHaveURL(/\/$/);
    const heroHeading = page.getByRole("heading", {
      name: "Evan Schoffstall",
    });
    await expect(heroHeading).toBeVisible({ timeout: 250 });
    await expect(heroHeading).not.toHaveCSS("position", "fixed", {
      timeout: 250,
    });

    const replayButton = page.getByRole("button", { name: /replay intro/i });
    const seeAllProjectsButton = page.getByRole("button", {
      name: /see all projects/i,
    });
    const bioCopy = page.getByText(
      /i close the gap between engineering and outcome/i,
    );

    await expect(replayButton).toBeVisible({ timeout: 250 });
    await expect(seeAllProjectsButton).toBeVisible({ timeout: 250 });
    await expect(bioCopy).toBeVisible({ timeout: 250 });
  });
});