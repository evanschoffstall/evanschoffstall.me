import { defineConfig, devices } from "@playwright/test";

const DEFAULT_PLAYWRIGHT_HOST = "127.0.0.1";
const DEFAULT_PLAYWRIGHT_PORT = 3100;

const isCi = Boolean(process.env.CI);
const isCoverageRun = process.env.PLAYWRIGHT_COVERAGE_ENABLED === "1";
const useFastLocalServer = !isCi && !isCoverageRun;
const playwrightReporter = process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE
  ? "junit"
  : "html";
const playwrightBaseUrl = resolvePlaywrightBaseUrl();
const playwrightServerCommand = isCoverageRun
  ? "bun run dev:playwright"
  : useFastLocalServer
    ? "bun run dev:playwright"
    : "bun run build:playwright && bun run start:playwright";

/** Builds the canonical Playwright base URL from validated host and port inputs. */
function buildPlaywrightBaseUrl(host: string, port: number) {
  const normalizedHost = host.trim();

  if (!normalizedHost) {
    throw new Error("PLAYWRIGHT_HOST must not be empty.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      `PLAYWRIGHT_PORT must be a valid TCP port. Received: ${port}`,
    );
  }

  return `http://${normalizedHost}:${port}`;
}

/** Resolves Playwright base URL from wrapper env first, then host and port defaults. */
function resolvePlaywrightBaseUrl() {
  const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim();

  if (configuredBaseUrl) {
    const normalizedUrl = new URL(configuredBaseUrl);
    normalizedUrl.hash = "";

    return normalizedUrl.toString().replace(/\/$/u, "");
  }

  const configuredHost =
    process.env.PLAYWRIGHT_HOST?.trim() ?? DEFAULT_PLAYWRIGHT_HOST;
  const configuredPort = Number.parseInt(
    process.env.PLAYWRIGHT_PORT?.trim() ?? String(DEFAULT_PLAYWRIGHT_PORT),
    10,
  );

  return buildPlaywrightBaseUrl(configuredHost, configuredPort);
}

/**
 * Playwright runs against an isolated app on port 3100.
 *
 * Local non-coverage runs use the dedicated webpack dev server for faster
 * iteration, while CI and coverage retain the slower but production-like path.
 */
export default defineConfig({
  expect: {
    timeout: isCoverageRun ? 10_000 : 5_000,
  },
  fullyParallel: !isCoverageRun,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  reporter: playwrightReporter,
  retries: isCi ? 2 : 0,
  testDir: "./tests",
  testMatch: ["**/*.e2e.ts"],
  timeout: isCoverageRun ? 60_000 : 30_000,
  use: {
    actionTimeout: isCoverageRun ? 15_000 : 0,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? playwrightBaseUrl,
    navigationTimeout: isCoverageRun ? 30_000 : 15_000,
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: playwrightServerCommand,
        port: new URL(playwrightBaseUrl).port
          ? Number.parseInt(new URL(playwrightBaseUrl).port, 10)
          : 80,
        reuseExistingServer: !isCi && !isCoverageRun,
      },
  workers: isCoverageRun ? 1 : isCi ? 2 : undefined,
});