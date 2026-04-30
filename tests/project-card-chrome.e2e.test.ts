import { expect, test } from "./playwright";

test.describe("project card chrome", () => {
  test("keeps the projects surface on the shared interactive card chrome", async ({
    page,
  }) => {
    await page.goto("/projects");

    const featuredCard = page
      .getByRole("heading", { name: "Librerss" })
      .locator("xpath=ancestor::a[1]/parent::*");

    await expect(featuredCard).toBeVisible();

    // Regression coverage for Tailwind content scanning: when src/components is
    // excluded, the shared Card/FeaturedCard utilities collapse into square,
    // transparent, unshadowed wireframes on the projects surface.
    await expect(featuredCard).toHaveCSS("border-radius", "12px");
    await expect(featuredCard).toHaveCSS(
      "background-color",
      "rgba(24, 24, 27, 0.4)",
    );
    await expect(featuredCard).not.toHaveCSS("box-shadow", "none");

    const primaryOverlayBackground = await featuredCard
      .locator(":scope > .pointer-events-none > div")
      .nth(1)
      .evaluate((overlay) => getComputedStyle(overlay).backgroundImage);

    expect(primaryOverlayBackground).toContain("linear-gradient");
  });
});
