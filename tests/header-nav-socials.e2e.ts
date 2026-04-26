import type { Page } from "@playwright/test";

import { expect, test } from "./playwright";

/**
 * Asserts that every page surface exposes its header navigation and the full
 * set of social icon links. Each social link must be present, labelled, and
 * configured to open safely in a new tab.
 */

const SOCIAL_LINKS = [
  { href: "https://github.com/evanschoffstall", label: "GitHub" },
  { href: /linkedin\.com/, label: "LinkedIn" },
  { href: /twitter\.com/, label: "X (Twitter)" },
  { href: "mailto:hello@evanschoffstall.me", label: "Email" },
];

const HOME_INTRO_TIMEOUT_MS = 10_000;

/** Assert all four social icon links are visible, safe, and well-labelled. */
async function assertSocialLinks(page: Page) {
  for (const { href, label } of SOCIAL_LINKS) {
    const link = page.getByRole("link", { name: label });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("href", href);
  }
}

test.describe("header navigation and social links", () => {
  test("home page shows header nav with availability badge, replay button, and social links", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for the hero animation to settle so HomeNavigation fades in.
    const replayButton = page.getByRole("button", { name: /replay intro/i });
    await expect(replayButton).toBeVisible({ timeout: HOME_INTRO_TIMEOUT_MS });

    // Availability badge is rendered inside the home nav.
    await expect(page.getByText(/available for new work/i)).toBeVisible();

    await assertSocialLinks(page);
  });

  test("projects panel shows Navigation header with back button and social links", async ({
    page,
  }) => {
    await page.goto("/#projects");

    // The Navigation component renders the back control as a button when
    // onBack is supplied (label="Projects" → aria-label="Back to Projects").
    await expect(
      page.getByRole("button", { name: /back to projects/i }),
    ).toBeVisible();

    await assertSocialLinks(page);
  });

  test("project slug page shows header with project-list back button and social links", async ({
    page,
  }) => {
    await page.goto("/projects/librerss");

    await expect(
      page.getByRole("button", { name: /back to project list/i }),
    ).toBeVisible();

    await assertSocialLinks(page);
  });
});
