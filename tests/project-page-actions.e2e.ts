import { expect, test } from "./playwright";

test.describe("project page actions", () => {
  test("preserves the particle background when opening a project from the projects panel", async ({
    page,
  }) => {
    await page.goto("/projects");

    await page.evaluate(() => {
      const canvas = document.querySelector("div[aria-hidden='true'] canvas");

      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError("Particle canvas was not found.");
      }

      const trackedCanvas = canvas as HTMLCanvasElement & {
        persistentBackground?: boolean;
      };

      trackedCanvas.persistentBackground = true;
    });

    await page.getByRole("heading", { name: "SpringGate E-Commerce" }).click();
    await expect(page).toHaveURL(/\/projects\/springgate-ecommerce$/);

    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const canvas = document.querySelector(
              "div[aria-hidden='true'] canvas",
            );

            if (!(canvas instanceof HTMLCanvasElement)) {
              return false;
            }

            const trackedCanvas = canvas as HTMLCanvasElement & {
              persistentBackground?: boolean;
            };

            return trackedCanvas.persistentBackground === true;
          }),
      )
      .toBe(true);
  });

  test("restores the projects panel scroll position after opening a project card", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 720, width: 390 });
    await page.goto("/projects");

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

    await page.getByRole("heading", { name: "SpringGate E-Commerce" }).click();

    await expect(page).toHaveURL(/\/projects\/springgate-ecommerce$/);

    await page.getByRole("button", { name: /back to project list/i }).click();

    await expect(page).toHaveURL(/\/projects$/);
    expect(page.url()).not.toContain("#projects");
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const viewport = document.querySelector(
              "[data-radix-scroll-area-viewport]",
            );

            return viewport instanceof HTMLDivElement ? viewport.scrollTop : -1;
          }),
      )
      .toBeGreaterThan(0);
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
    await expect(repositoryLink).toHaveAttribute(
      "href",
      /^https:\/\/github\.com\//,
    );
  });

  test("reports project views through fetch when sendBeacon is unavailable", async ({
    page,
  }) => {
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
        response.url().endsWith("/api/views") &&
        response.request().method() === "POST",
    );

    await page.goto("/projects/springgate-ecommerce");

    expect((await viewReportResponse).status()).toBe(202);
  });

  test("routes featured-card project back navigation directly home without replaying intro", async ({
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
    expect(page.url()).not.toContain("#projects");

    const heroHeading = page.getByRole("heading", {
      name: "Evan Schoffstall",
    });
    await expect(heroHeading).toBeVisible({ timeout: 250 });

    await expect
      .poll(
        async () =>
          await heroHeading.evaluate((element) => {
            const computedStyle = getComputedStyle(element);

            return (
              computedStyle.opacity !== "1" ||
              computedStyle.transform !== "none"
            );
          }),
        { timeout: 250 },
      )
      .toBe(true);

    await expect(heroHeading).not.toHaveCSS("position", "fixed", {
      timeout: 250,
    });

    const replayButton = page.getByRole("button", { name: /replay intro/i });
    const seeAllProjectsLink = page.getByRole("link", {
      name: /see all projects/i,
    });
    const bioCopy = page.getByText(
      /i close the gap between engineering and outcome/i,
    );

    await expect(replayButton).toBeVisible({ timeout: 250 });
    await expect(seeAllProjectsLink).toBeVisible({ timeout: 250 });
    await expect(bioCopy).toBeVisible({ timeout: 250 });
  });

  test("routes the featured-project title back to landing", async ({
    page,
  }) => {
    // The featured card has two internal slug links. Both must mark the visit as
    // featured-origin navigation so Back returns to the landing view, not the
    // canonical projects route.
    await page.goto("/");

    await page.getByRole("link", { name: /^librerss$/i }).click();
    await expect(page).toHaveURL(/\/projects\/librerss$/);

    await page.getByRole("button", { name: /back to project list/i }).click();

    await expect(page).toHaveURL(/\/$/);
    expect(page.url()).not.toContain("#projects");
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

  test("back navigation from project slug returns to the projects route", async ({
    page,
  }) => {
    await page.goto("/projects");

    await page.getByRole("heading", { name: "SpringGate E-Commerce" }).click();
    await expect(page).toHaveURL(/\/projects\/springgate-ecommerce$/);

    await page.getByRole("button", { name: /back to project list/i }).click();

    const url = page.url();
    expect(url).not.toContain("#projects");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
  });

  test("back navigation from projects route stays canonical after another slug", async ({
    page,
  }) => {
    // This covers a repeated real-route navigation sequence that used to be
    // sensitive to stale hash state when the projects surface was hash-driven.
    await page.goto("/projects");

    await page.getByRole("heading", { name: "Gitaicmt" }).click();
    await expect(page).toHaveURL(/\/projects\/gitaicmt$/);

    await page.getByRole("button", { name: /back to project list/i }).click();

    const url = page.url();
    expect(url).not.toContain("#projects");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { name: "Gitaicmt" })).toBeVisible();
  });

  test("back navigation from directly-loaded project slug opens projects route", async ({
    page,
  }) => {
    // Direct load simulates an external link or page refresh — no session-storage
    // internal-navigation flag is set, so the deterministic path is used.
    await page.goto("/projects/librerss");

    await page.getByRole("button", { name: /back to project list/i }).click();

    const url = page.url();
    expect(url).not.toContain("#projects");
    await expect(page).toHaveURL(/\/projects$/);
  });
});
