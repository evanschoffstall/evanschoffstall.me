import { expect, test } from "./playwright";

/**
 * These assertions exercise the user-visible contract that matters most here:
 * the landing page renders, the projects route fills with published content,
 * and a README-backed project page loads its mirrored content.
 */
test.describe("content loads", () => {
  test("renders the canonical projects route", async ({ page }) => {
    await page.goto("/projects");

    await expect(page).toHaveURL(/\/projects$/);
    expect(page.url()).not.toContain("#projects");
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Librerss" })).toBeVisible();
  });

  test("renders home page content and links to the projects route", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/evanschoffstall\.me/i);
    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Technologist .* Engineer .* Business Officer/i),
    ).toBeVisible();

    const viewProjectsLink = page.getByRole("link", {
      name: /See all projects/i,
    });

    await expect(viewProjectsLink).toBeVisible();
    await viewProjectsLink.click();

    await expect(page).toHaveURL(/\/projects$/);
    expect(page.url()).not.toContain("#projects");
    await expect(
      page.getByText(
        "Some of the projects are from work and some are on my own time.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gitaicmt" })).toBeVisible();

    await page.getByRole("link", { name: /home/i }).click();
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

  test("renders published project MDX content when no mirrored README exists", async ({
    page,
  }) => {
    await page.goto("/projects/librerss");
    await expect(page.locator("[data-project-content-motion]")).toHaveCSS(
      "opacity",
      "1",
    );
    const readmeBody = page.locator(".markdown-body").first();
    await expect(readmeBody).toBeVisible();
    const readmeContentTop = await readmeBody.evaluate((markdownBody) =>
      Math.round(markdownBody.getBoundingClientRect().top),
    );

    await page.goto("/projects/springgate-ecommerce");

    await expect(
      page.getByRole("heading", { name: "SpringGate E-Commerce" }),
    ).toBeVisible();
    await expect(
      page.getByText(/pickup, delivery, and ordering expectations/i),
    ).toBeVisible();
    await expect(
      page.getByText(/smoother path from product discovery to checkout/i),
    ).toBeVisible();
    await expect(page.locator("[data-project-content-motion]")).toHaveCSS(
      "opacity",
      "1",
    );

    const pureMdxLayout = await page.evaluate(() => {
      const title = document.querySelector("header h1");
      const description = document.querySelector("header p");
      const body = document.querySelector(".prose");

      if (
        !(title instanceof HTMLElement) ||
        !(description instanceof HTMLElement) ||
        !(body instanceof HTMLElement)
      ) {
        throw new TypeError("Pure MDX project layout elements were not found.");
      }

      const titleBox = title.getBoundingClientRect();
      const descriptionBox = description.getBoundingClientRect();
      const bodyBox = body.getBoundingClientRect();

      return {
        bodyGapAfterHero: Math.round(bodyBox.top - descriptionBox.bottom),
        titleTop: Math.round(titleBox.top),
      };
    });

    expect(
      Math.abs(pureMdxLayout.titleTop - readmeContentTop),
    ).toBeLessThanOrEqual(12);
    expect(pureMdxLayout.bodyGapAfterHero).toBeLessThanOrEqual(56);
  });

  test("applies the project body fade-in shell to README and MDX project content", async ({
    page,
  }) => {
    await page.goto("/projects/librerss", { waitUntil: "domcontentloaded" });
    const readmeMotionShell = page.locator("[data-project-content-motion]");
    const readmeFirstContentBlock = readmeMotionShell
      .locator(".markdown-body > *")
      .first();

    await expect(readmeMotionShell).toBeVisible();
    await expect(readmeMotionShell.locator(".markdown-body")).toBeVisible();
    await expect(readmeMotionShell).toHaveCSS("opacity", "1");
    await expect(readmeFirstContentBlock).toHaveCSS(
      "animation-name",
      "projectContentItemReveal",
    );

    await page.goto("/projects/springgate-ecommerce", {
      waitUntil: "domcontentloaded",
    });
    const mdxMotionShell = page.locator("[data-project-content-motion]");
    const mdxFirstContentBlock = mdxMotionShell.locator(".mdx > *").first();

    await expect(mdxMotionShell).toBeVisible();
    await expect(mdxMotionShell.locator(".prose")).toBeVisible();
    await expect(mdxMotionShell).toHaveCSS("opacity", "1");
    await expect(mdxFirstContentBlock).toHaveCSS(
      "animation-name",
      "projectContentItemReveal",
    );
  });

  test("opens the projects view from the direct projects route", async ({
    page,
  }) => {
    await page.goto("/projects");

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(
      page.getByText(
        "Some of the projects are from work and some are on my own time.",
      ),
    ).toBeVisible();
  });

  test("renders the 404 status page and returns home", async ({ page }) => {
    await page.goto("/definitely-not-a-real-route");

    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();

    await page.getByRole("link", { name: "Go home" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Evan Schoffstall" }),
    ).toBeVisible();
  });
});
