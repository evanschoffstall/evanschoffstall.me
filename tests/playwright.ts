import { test as base, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const coverageEnabled = process.env.PLAYWRIGHT_COVERAGE_ENABLED === "1"
  || process.env.PLAYWRIGHT_COVERAGE === "1";
const rawCoverageDirectory = process.env.PLAYWRIGHT_COVERAGE_OUTPUT_DIR
  || process.env.PLAYWRIGHT_COVERAGE_RAW_DIR;

/**
 * Capture Chromium browser coverage for every e2e test without changing the
 * existing test bodies. The wrapper only activates during the dedicated
 * coverage run used by check-suite.
 */
const test = base.extend({
  page: async ({ browserName, page }, runPageTest, testInfo) => {
    if (!coverageEnabled || browserName !== "chromium" || !rawCoverageDirectory) {
      await runPageTest(page);
      return;
    }

    const coverageStartTasks = new Map();

    const trackPage = (trackedPage = page) => {
      if (coverageStartTasks.has(trackedPage)) {
        return;
      }

      coverageStartTasks.set(
        trackedPage,
        (async () => {
          if (trackedPage.isClosed()) {
            return;
          }

          await Promise.all([
            trackedPage.coverage.startJSCoverage({ resetOnNavigation: false }),
            trackedPage.coverage.startCSSCoverage({ resetOnNavigation: false }),
          ]);
        })(),
      );
    };

    const handlePage = (trackedPage = page) => {
      trackPage(trackedPage);
    };

    page.context().on("page", handlePage);
    trackPage(page);

    let coverageEntries;
    let pageTestError;

    try {
      await runPageTest(page);
    } catch (error) {
      pageTestError = error;
    } finally {
      page.context().off("page", handlePage);

      coverageEntries = (
        await Promise.all(
          [...coverageStartTasks.entries()].map(async ([trackedPage, startTask]) => {
            try {
              await startTask;
            } catch {
              return [];
            }

            if (trackedPage.isClosed()) {
              return [];
            }

            const coverageResults = await Promise.allSettled([
              trackedPage.coverage.stopJSCoverage(),
              trackedPage.coverage.stopCSSCoverage(),
            ]);

            return coverageResults.flatMap((coverageResult) => {
              if (coverageResult.status !== "fulfilled") {
                return [];
              }

              return Array.isArray(coverageResult.value)
                ? coverageResult.value
                : [];
            });
          }),
        )
      ).flat();
    }

    if (pageTestError) {
      throw pageTestError;
    }

    if (!coverageEntries || coverageEntries.length === 0) {
      return;
    }

    await mkdir(rawCoverageDirectory, { recursive: true });

    const coverageFileId = createHash("sha1")
      .update(testInfo.file)
      .update(testInfo.project.name)
      .update(testInfo.titlePath.join(" > "))
      .update(String(testInfo.retry))
      .digest("hex");

    await writeFile(
      path.join(rawCoverageDirectory, `${coverageFileId}.json`),
      JSON.stringify(coverageEntries),
    );
  },
});

export { expect, test };