import type { Dirent } from "node:fs";

import { type ChildProcess, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { access, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join, relative } from "node:path";

if (typeof globalThis.gc !== "function") {
  /**
   * Provides a no-op garbage-collection hook when Node was not started with gc exposed.
   */
  globalThis.gc = async () => {};
}

const DEFAULT_PLAYWRIGHT_HOST = "127.0.0.1";
const DEFAULT_PLAYWRIGHT_PORT = 3100;

const PLAYWRIGHT_COVERAGE_ENABLED =
  process.env.PLAYWRIGHT_COVERAGE_ENABLED === "1";
const PLAYWRIGHT_COVERAGE_OUTPUT_DIR =
  process.env.PLAYWRIGHT_COVERAGE_OUTPUT_DIR ?? "coverage/playwright-raw";
const PLAYWRIGHT_COVERAGE_REPORT_DIR =
  process.env.PLAYWRIGHT_COVERAGE_REPORT_DIR ?? "coverage/playwright";
const PLAYWRIGHT_JUNIT_OUTPUT_FILE =
  process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE ?? "coverage/playwright-junit.xml";
const PLAYWRIGHT_HOST = DEFAULT_PLAYWRIGHT_HOST;
const PLAYWRIGHT_PORT_START = Number.parseInt(
  process.env.PLAYWRIGHT_PORT_START ?? String(DEFAULT_PLAYWRIGHT_PORT),
  10,
);
const PLAYWRIGHT_SERVER_TIMEOUT_MS = Number.parseInt(
  process.env.PLAYWRIGHT_SERVER_TIMEOUT_MS ?? "120000",
  10,
);
const PLAYWRIGHT_SHUTDOWN_TIMEOUT_MS = Number.parseInt(
  process.env.PLAYWRIGHT_SHUTDOWN_TIMEOUT_MS ?? "5000",
  10,
);
const PLAYWRIGHT_DIST_DIR_PREFIX = ".next-playwright";
const PLAYWRIGHT_LOG_LINE_LIMIT = 120;
const PLAYWRIGHT_READINESS_PATH = process.env.PLAYWRIGHT_READINESS_PATH ?? "/";
const PLAYWRIGHT_TSCONFIG_PREFIX = "tsconfig.playwright";
const PROJECT_SOURCE_DIRECTORY_PATH = `${process.cwd().replaceAll("\\", "/")}/src/`;
const SUMMARY_METRIC_KEYS = [
  "lines",
  "statements",
  "functions",
  "branches",
  "branchesTrue",
] as const;
const PYTHON_PARENT_DEATHSIG_LAUNCHER = [
  "import ctypes",
  "import os",
  "import signal",
  "import sys",
  "libc = ctypes.CDLL(None, use_errno=True)",
  "PR_SET_PDEATHSIG = 1",
  "result = libc.prctl(PR_SET_PDEATHSIG, signal.SIGKILL)",
  "if result != 0:",
  "    raise OSError(ctypes.get_errno(), 'prctl(PR_SET_PDEATHSIG) failed')",
  "os.execv(sys.argv[1], sys.argv[1:])",
].join("\n");

interface CoverageMetric {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}
type CoverageMetricKey = (typeof SUMMARY_METRIC_KEYS)[number];
interface CoverageSourceInfo {
  distFile?: string;
}

type CoverageSummary = Record<string, unknown>;
type CoverageSummaryEntry = Partial<Record<CoverageMetricKey, CoverageMetric>>;

interface DevServerHandle {
  baseURL: string;
  getRecentOutput: () => string;
  port: number;
  process: ChildProcess;
  startForwarding: () => void;
}

interface MonocartCoverageReport {
  add: (coverageData: RawCoverageData) => Promise<void>;
  generate: () => Promise<unknown>;
}

type MonocartCoverageReportFactory = (
  options: Record<string, unknown>,
) => MonocartCoverageReport;

interface NodeV8CoveragePayload {
  result: V8CoverageEntry[];
}

type RawCoverageData = Record<string, unknown> | V8CoverageEntry[];

interface V8CoverageEntry {
  url: string;
}

/**
 * Ensures the generated summary still points at repository source files under src/.
 * @param reportDirectoryPath - The coverage report directory that contains the summary output.
 * @param projectSourceFilePathSet - The normalized repository source file paths that should appear in coverage.
 */
async function assertSourceMappedCoverage(
  reportDirectoryPath: string,
  projectSourceFilePathSet: ReadonlySet<string>,
): Promise<void> {
  const summaryFilePath = join(reportDirectoryPath, "summary.json");
  const summary = JSON.parse(
    await readFile(summaryFilePath, "utf8"),
  ) as CoverageSummary;
  const sourceEntries = Object.keys(summary).filter((key) => key !== "total");

  if (
    sourceEntries.some((key) =>
      isTrackedProjectSourceFile(key, projectSourceFilePathSet),
    )
  ) {
    return;
  }

  throw new Error(
    "Playwright coverage did not map to project source files under src/. The generated report still points at bundle artifacts.",
  );
}

/**
 * Builds the canonical Playwright base URL from validated host and port inputs.
 * @param host - The hostname that Playwright should target.
 * @param port - The TCP port that hosts the Playwright app server.
 * @returns The normalized base URL for Playwright requests.
 */
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

/**
 * Tracks recent child-process output while forwarding it to the parent streams.
 * @param child - The child process whose stdout and stderr should be mirrored.
 * @returns Helpers for reading buffered output and starting live forwarding.
 */
function createOutputMirror(child: ChildProcess) {
  const bufferedChunks: { stream: NodeJS.WriteStream; text: string }[] = [];
  const recentLines: string[] = [];
  let isForwarding = false;

  /**
   * Buffers child-process output until the caller starts forwarding it.
   * @param stream - The parent stream that should eventually receive the output.
   * @param chunk - The output chunk emitted by the child process.
   */
  const appendChunk = (stream: NodeJS.WriteStream, chunk: Buffer | string) => {
    const text = chunk.toString();

    if (isForwarding) {
      stream.write(text);
    } else {
      bufferedChunks.push({ stream, text });
    }

    for (const line of text.split(/\r?\n/u)) {
      if (!line) {
        continue;
      }

      recentLines.push(line);
      if (recentLines.length > PLAYWRIGHT_LOG_LINE_LIMIT) {
        recentLines.shift();
      }
    }
  };

  child.stdout?.on("data", (chunk: Buffer | string) => {
    appendChunk(process.stdout, chunk);
  });
  child.stderr?.on("data", (chunk: Buffer | string) => {
    appendChunk(process.stderr, chunk);
  });

  /**
   * Returns the recent child-process output as newline-delimited text.
   * @returns The most recent buffered output lines.
   */
  const getRecentOutput = () => recentLines.join("\n");

  /**
   * Flushes buffered output and starts forwarding future child-process output.
   */
  const startForwarding = () => {
    if (isForwarding) {
      return;
    }

    isForwarding = true;

    for (const chunk of bufferedChunks) {
      chunk.stream.write(chunk.text);
    }

    bufferedChunks.length = 0;
  };

  return {
    getRecentOutput,
    startForwarding,
  };
}

/**
 * Creates a filesystem-safe run identifier for per-run Playwright artifacts.
 * @returns The unique run identifier for the current Playwright execution.
 */
function createPlaywrightRunId() {
  return `${Date.now()}-${process.pid}`;
}

/**
 * Creates a disposable root tsconfig so Next never mutates the repo file.
 * @param runId - The unique identifier for the current Playwright run.
 * @returns The temporary tsconfig path created for the run.
 */
async function createPlaywrightTsconfig(runId: string) {
  const tsconfigPath = `${PLAYWRIGHT_TSCONFIG_PREFIX}.${runId}.json`;

  await writeFile(
    join(process.cwd(), tsconfigPath),
    await readFile(join(process.cwd(), "tsconfig.json"), "utf8"),
    "utf8",
  );

  return tsconfigPath;
}

/**
 * Formats a startup failure with recent server output for fast diagnosis.
 * @param message - The primary startup failure message.
 * @param recentOutput - The recent server output captured before the failure.
 * @returns The enriched startup error.
 */
function createStartupError(message: string, recentOutput: string) {
  return new Error(
    recentOutput
      ? `${message}\nRecent server output:\n${recentOutput}`
      : message,
  );
}

/**
 * Generates the aggregated Playwright coverage reports after a coverage run.
 * @param rawCoverageOutputDir - The directory that stores raw V8 coverage output for the run.
 * @returns The process exit code for coverage generation.
 */
async function generatePlaywrightCoverageReport(rawCoverageOutputDir: string) {
  try {
    await access(join(process.cwd(), rawCoverageOutputDir));
  } catch {
    return 0;
  }

  try {
    const monocartModule = (await import("monocart-coverage-reports")) as {
      default: MonocartCoverageReportFactory;
    };
    const reportDirectoryPath = join(
      process.cwd(),
      PLAYWRIGHT_COVERAGE_REPORT_DIR,
    );
    const projectSourceFilePathSet = new Set(
      (await listFilesRecursively(join(process.cwd(), "src"))).map((filePath) =>
        normalizeCoveragePath(filePath),
      ),
    );
    const rawCoverageFilePaths = (
      await listFilesRecursively(join(process.cwd(), rawCoverageOutputDir))
    )
      .filter((filePath) => filePath.endsWith(".json"))
      .sort((leftPath, rightPath) => leftPath.localeCompare(rightPath));

    if (rawCoverageFilePaths.length === 0) {
      throw new Error(
        `No Playwright coverage JSON files were found in ${join(process.cwd(), rawCoverageOutputDir)}.`,
      );
    }

    const coverageReport = monocartModule.default({
      clean: true,
      cleanCache: true,
      logging: "error",
      name: "playwright-e2e",
      outputDir: reportDirectoryPath,
      reports: [
        ["html", { subdir: "html" }],
        ["json-summary", { file: "summary.json" }],
        ["lcovonly", { file: "lcov.info" }],
      ],
      /**
       * Filters coverage rows down to tracked repository source files.
       * @param sourcePath - The source path emitted by the coverage report.
       * @returns Whether the source path belongs to a tracked repository file.
       */
      sourceFilter: (sourcePath: string) =>
        isTrackedProjectSourceFile(sourcePath, projectSourceFilePathSet),
      /**
       * Rewrites coverage source paths back to stable repository-relative paths.
       * @param sourcePath - The source path emitted by the coverage report.
       * @param sourceInfo - Additional coverage metadata supplied by Monocart.
       * @returns The normalized repository-relative coverage path.
       */
      sourcePath: (sourcePath: string, sourceInfo: CoverageSourceInfo) =>
        normalizeCoveragePath(sourcePath, sourceInfo.distFile),
    });

    for (const rawCoverageFilePath of rawCoverageFilePaths) {
      const rawCoverageJson = await readFile(rawCoverageFilePath, "utf8");
      await coverageReport.add(
        parseRawCoverageData(rawCoverageJson, rawCoverageFilePath),
      );
    }

    const coverageResults = await coverageReport.generate();

    if (!coverageResults) {
      throw new Error(
        "Playwright coverage generation did not produce results.",
      );
    }

    await rewriteCoverageArtifacts(
      reportDirectoryPath,
      projectSourceFilePathSet,
    );
    await assertSourceMappedCoverage(
      reportDirectoryPath,
      projectSourceFilePathSet,
    );

    console.log(
      `Generated Playwright coverage from ${rawCoverageFilePaths.length} raw file(s) into ${relative(process.cwd(), reportDirectoryPath) || "."}.`,
    );

    return 0;
  } catch (error) {
    console.error(error);
    return 1;
  }
}

/**
 * Returns the requested metric entry when present in a coverage summary row.
 * @param summaryEntry - The coverage summary row to inspect.
 * @param metricKey - The metric key to extract from the summary row.
 * @returns The requested metric entry when it exists.
 */
function getSummaryMetric(
  summaryEntry: CoverageSummaryEntry,
  metricKey: CoverageMetricKey,
): CoverageMetric | null {
  return summaryEntry[metricKey] ?? null;
}

/**
 * Narrows Node's NODE_V8_COVERAGE payload shape to its result array.
 * @param value - The unknown JSON payload to validate.
 * @returns Whether the payload matches Node's V8 coverage wrapper shape.
 */
function isNodeV8CoveragePayload(
  value: unknown,
): value is NodeV8CoveragePayload {
  return (
    isRecord(value) &&
    Array.isArray(value.result) &&
    value.result.every(isV8CoverageEntry)
  );
}

/**
 * Quickly probes whether a TCP port can be bound without spawning a full
 * Next.js process.  Returns in ~1 ms per port, letting the scan skip
 * obviously-taken ports before paying the cost of a child process.
 * @param port - The TCP port to probe.
 * @returns Whether the port can currently be bound.
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => {
      resolve(false);
    });
    probe.listen(port, PLAYWRIGHT_HOST, () => {
      probe.close(() => {
        resolve(true);
      });
    });
  });
}

/**
 * Detects startup failures that should retry the next port immediately.
 * @param output - The recent dev-server output to inspect.
 * @returns Whether the output indicates that the port is already unavailable.
 */
function isPortUnavailableOutput(output: string) {
  return /(EADDRINUSE|address already in use|port\s+\d+\s+is in use)/iu.test(
    output,
  );
}

/**
 * Narrows unknown JSON payloads before coverage processing consumes them.
 * @param value - The unknown value to validate.
 * @returns Whether the value is a non-null object record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Checks whether a source-path entry maps to a tracked repository file under src/.
 * @param sourcePath - The source path emitted by coverage tooling.
 * @param projectSourceFilePathSet - The normalized repository source file paths that should be retained.
 * @returns Whether the source path belongs to a tracked repository file.
 */
function isTrackedProjectSourceFile(
  sourcePath: string,
  projectSourceFilePathSet: ReadonlySet<string>,
): boolean {
  return projectSourceFilePathSet.has(normalizeCoveragePath(sourcePath));
}

/**
 * Checks the minimal V8 entry shape expected by Monocart coverage ingestion.
 * @param value - The unknown coverage entry to validate.
 * @returns Whether the value matches the minimal V8 coverage entry shape.
 */
function isV8CoverageEntry(value: unknown): value is V8CoverageEntry {
  return isRecord(value) && typeof value.url === "string";
}

/**
 * Recursively lists files under a directory without relying on shell utilities.
 * @param directoryPath - The directory whose files should be listed recursively.
 * @returns Every file path found under the directory.
 */
async function listFilesRecursively(directoryPath: string): Promise<string[]> {
  const directoryEntries = await readdir(directoryPath, {
    withFileTypes: true,
  });
  const nestedFiles = await Promise.all(
    directoryEntries.map(async (directoryEntry: Dirent) => {
      const entryPath = join(directoryPath, directoryEntry.name);
      if (directoryEntry.isDirectory()) {
        return await listFilesRecursively(entryPath);
      }

      return [entryPath];
    }),
  );

  return nestedFiles.flat();
}

/**
 * Runs the Playwright wrapper end to end, including server lifecycle and optional coverage generation.
 * @returns A promise that resolves after the wrapper exits the process.
 */
async function main() {
  const forwardedArguments = process.argv.slice(2);
  const runId = createPlaywrightRunId();
  const rawCoverageOutputDir = PLAYWRIGHT_COVERAGE_ENABLED
    ? `${PLAYWRIGHT_COVERAGE_OUTPUT_DIR}.${runId}`
    : PLAYWRIGHT_COVERAGE_OUTPUT_DIR;
  const distDir = `${PLAYWRIGHT_DIST_DIR_PREFIX}.${runId}`;
  const tsconfigPath = await createPlaywrightTsconfig(runId);
  let serverProcess: ChildProcess | null = null;
  let testProcess: ChildProcess | null = null;

  let cleaningUp = false;

  /** Collects all temporary paths that must be removed on exit. */
  const temporaryPaths = [
    distDir,
    tsconfigPath,
    ...(PLAYWRIGHT_COVERAGE_ENABLED ? [rawCoverageOutputDir] : []),
  ];

  /**
   * Removes temporary Playwright processes and runtime directories.
   */
  const cleanup = async () => {
    if (cleaningUp) {
      return;
    }

    cleaningUp = true;

    await Promise.allSettled([
      stopProcess(testProcess),
      stopProcess(serverProcess),
    ]);

    await Promise.allSettled(
      temporaryPaths.map((target) => removePlaywrightRuntimeDirectory(target)),
    );
  };

  /** Best-effort synchronous fallback that kills processes and removes temp files. */
  const cleanupSync = () => {
    stopProcessNow(testProcess);
    stopProcessNow(serverProcess);

    for (const target of temporaryPaths) {
      try {
        rmSync(join(process.cwd(), target), { force: true, recursive: true });
      } catch {
        // Best-effort only — the process is already exiting.
      }
    }
  };

  /**
   * Exits the process after attempting asynchronous cleanup.
   * @param exitCode - The process exit code to report.
   */
  const exitWithCleanup = async (exitCode: number) => {
    const forceExitTimer = setTimeout(() => {
      console.error("Async cleanup timed out — forcing exit.");
      cleanupSync();
      process.exit(exitCode);
    }, PLAYWRIGHT_SHUTDOWN_TIMEOUT_MS * 2);

    forceExitTimer.unref();

    try {
      await cleanup();
    } catch {
      cleanupSync();
    } finally {
      clearTimeout(forceExitTimer);
    }

    process.exit(exitCode);
  };

  process.once("exit", () => {
    cleanupSync();
  });

  let signalCount = 0;

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"] as const) {
    process.on(signal, () => {
      signalCount++;

      if (signalCount > 1) {
        console.error(`Received ${signal} again — forcing immediate exit.`);
        cleanupSync();
        process.exit(
          128 +
            (signal === "SIGINT"
              ? 2
              : signal === "SIGTERM"
                ? 15
                : signal === "SIGQUIT"
                  ? 3
                  : 1),
        );
      }

      void exitWithCleanup(
        128 +
          (signal === "SIGINT"
            ? 2
            : signal === "SIGTERM"
              ? 15
              : signal === "SIGQUIT"
                ? 3
                : 1),
      );
    });
  }

  process.once("uncaughtException", (error) => {
    console.error(error);
    void exitWithCleanup(1);
  });

  process.once("unhandledRejection", (error) => {
    console.error(error);
    void exitWithCleanup(1);
  });

  try {
    if (PLAYWRIGHT_COVERAGE_ENABLED) {
      await removePlaywrightRuntimeDirectory(rawCoverageOutputDir);
    }
    await removePlaywrightRuntimeDirectory(distDir);
    const server = await startFirstAvailableDevServer(
      distDir,
      rawCoverageOutputDir,
      tsconfigPath,
    );
    serverProcess = server.process;

    console.log(`Playwright dev server port: ${server.port}`);
    console.log(`Playwright dist dir: ${distDir}`);
    console.log(`Playwright tsconfig: ${tsconfigPath}`);

    testProcess = startPlaywrightTestRun(
      server.baseURL,
      server.port,
      forwardedArguments,
      rawCoverageOutputDir,
      runId,
    );
    const { code, signal } = await waitForChildExit(testProcess);

    if (signal) {
      console.error(`Playwright exited from signal ${signal}.`);
      await exitWithCleanup(1);
      return;
    }

    const coverageExitCode = PLAYWRIGHT_COVERAGE_ENABLED
      ? await generatePlaywrightCoverageReport(rawCoverageOutputDir)
      : 0;
    const exitCode = code === 0 ? coverageExitCode : (code ?? 1);

    await exitWithCleanup(exitCode);
  } catch (error) {
    console.error(error);
    await exitWithCleanup(1);
  }
}

/**
 * Merges coverage metrics across all filtered source entries into a total row.
 * @param summaryEntries - The filtered coverage summary rows to merge.
 * @param metricKey - The metric key to aggregate across rows.
 * @returns The aggregated coverage metric.
 */
function mergeCoverageMetric(
  summaryEntries: CoverageSummaryEntry[],
  metricKey: CoverageMetricKey,
): CoverageMetric {
  const total = summaryEntries.reduce(
    (sum, entry) => sum + (getSummaryMetric(entry, metricKey)?.total ?? 0),
    0,
  );
  const covered = summaryEntries.reduce(
    (sum, entry) => sum + (getSummaryMetric(entry, metricKey)?.covered ?? 0),
    0,
  );
  const skipped = summaryEntries.reduce(
    (sum, entry) => sum + (getSummaryMetric(entry, metricKey)?.skipped ?? 0),
    0,
  );

  return {
    covered,
    pct: total === 0 ? 100 : Number(((covered / total) * 100).toFixed(2)),
    skipped,
    total,
  };
}

/**
 * Normalizes Monocart source paths back to repository-relative src/ paths.
 * @param sourcePath - The source path emitted by coverage tooling.
 * @param distFilePath - The optional bundled file path associated with the source path.
 * @returns The normalized repository-relative coverage path.
 */
function normalizeCoveragePath(
  sourcePath: string,
  distFilePath?: string,
): string {
  const normalizedSourcePath = sourcePath.replaceAll("\\", "/");
  const normalizedDistFilePath = normalizeDistFilePath(distFilePath);

  if (normalizedSourcePath.startsWith(PROJECT_SOURCE_DIRECTORY_PATH)) {
    return normalizedSourcePath.slice(
      process.cwd().replaceAll("\\", "/").length + 1,
    );
  }

  if (normalizedSourcePath.startsWith("src/")) {
    if (normalizedDistFilePath.includes("/node_modules/")) {
      return `${normalizedDistFilePath}::${normalizedSourcePath}`;
    }

    return normalizedSourcePath;
  }

  const srcDirectoryIndex = normalizedSourcePath.lastIndexOf("/src/");
  if (srcDirectoryIndex >= 0 && !normalizedSourcePath.startsWith("/")) {
    return normalizedSourcePath.slice(srcDirectoryIndex + 1);
  }

  return normalizedSourcePath;
}

/**
 * Normalizes dist-file paths so rewritten coverage artifacts stay stable.
 * @param distFilePath - The optional dist-file path to normalize.
 * @returns The normalized dist-file path.
 */
function normalizeDistFilePath(distFilePath?: string): string {
  return distFilePath?.replaceAll("\\", "/") ?? "";
}

/**
 * Validates a raw coverage JSON payload before handing it to Monocart.
 * @param rawCoverageJson - The raw JSON payload read from disk.
 * @param rawCoverageFilePath - The file path that supplied the raw coverage JSON.
 * @returns The parsed coverage payload in a shape Monocart accepts.
 */
function parseRawCoverageData(
  rawCoverageJson: string,
  rawCoverageFilePath: string,
): RawCoverageData {
  const parsedCoverageData: unknown = JSON.parse(rawCoverageJson) as unknown;

  if (Array.isArray(parsedCoverageData)) {
    if (parsedCoverageData.every(isV8CoverageEntry)) {
      return parsedCoverageData;
    }

    throw new Error(
      `Expected ${rawCoverageFilePath} to contain an array of V8 coverage entries with string urls.`,
    );
  }

  if (isNodeV8CoveragePayload(parsedCoverageData)) {
    return parsedCoverageData.result;
  }

  if (isRecord(parsedCoverageData)) {
    return parsedCoverageData;
  }

  throw new Error(
    `Expected ${rawCoverageFilePath} to contain a JSON object or an array of V8 coverage entries.`,
  );
}

/**
 * Removes a Playwright runtime directory when the run exits.
 * @param directoryName - The runtime directory name relative to the repository root.
 */
async function removePlaywrightRuntimeDirectory(directoryName: string) {
  await rm(join(process.cwd(), directoryName), {
    force: true,
    recursive: true,
  });
}

/**
 * Rewrites the generated summary and LCOV files to tracked repository paths only.
 * @param reportDirectoryPath - The coverage report directory to rewrite.
 * @param projectSourceFilePathSet - The normalized repository source file paths that should be retained.
 */
async function rewriteCoverageArtifacts(
  reportDirectoryPath: string,
  projectSourceFilePathSet: ReadonlySet<string>,
): Promise<void> {
  await Promise.all([
    rewriteSummaryFile(reportDirectoryPath, projectSourceFilePathSet),
    rewriteLcovFile(reportDirectoryPath, projectSourceFilePathSet),
  ]);
}

/**
 * Filters LCOV output down to repository-owned source files and rewrites their paths.
 * @param reportDirectoryPath - The coverage report directory that contains the LCOV file.
 * @param projectSourceFilePathSet - The normalized repository source file paths that should be retained.
 */
async function rewriteLcovFile(
  reportDirectoryPath: string,
  projectSourceFilePathSet: ReadonlySet<string>,
): Promise<void> {
  const lcovFilePath = join(reportDirectoryPath, "lcov.info");
  const lcovBlocks = (await readFile(lcovFilePath, "utf8"))
    .split("end_of_record\n")
    .map((block) => block.trim())
    .filter(Boolean);
  const filteredBlocks = lcovBlocks.flatMap((block) => {
    const lines = block.split(/\r?\n/u);
    const sourceFileLine = lines.find((line) => line.startsWith("SF:"));
    if (!sourceFileLine) {
      return [];
    }

    const sourcePath = sourceFileLine.slice(3);
    if (!isTrackedProjectSourceFile(sourcePath, projectSourceFilePathSet)) {
      return [];
    }

    lines[lines.indexOf(sourceFileLine)] =
      `SF:${normalizeCoveragePath(sourcePath)}`;
    return [`${lines.join("\n")}\nend_of_record\n`];
  });

  await writeFile(lcovFilePath, filteredBlocks.join(""));
}

/**
 * Filters summary output to repository-owned files and recomputes the total row.
 * @param reportDirectoryPath - The coverage report directory that contains the summary file.
 * @param projectSourceFilePathSet - The normalized repository source file paths that should be retained.
 */
async function rewriteSummaryFile(
  reportDirectoryPath: string,
  projectSourceFilePathSet: ReadonlySet<string>,
): Promise<void> {
  const summaryFilePath = join(reportDirectoryPath, "summary.json");
  const summary = JSON.parse(
    await readFile(summaryFilePath, "utf8"),
  ) as CoverageSummary;
  const filteredEntries = Object.entries(summary)
    .filter(
      ([sourcePath]) =>
        sourcePath !== "total" &&
        isTrackedProjectSourceFile(sourcePath, projectSourceFilePathSet),
    )
    .map(
      ([sourcePath, summaryEntry]) =>
        [
          normalizeCoveragePath(sourcePath),
          summaryEntry as CoverageSummaryEntry,
        ] as const,
    );
  const totalEntry = Object.fromEntries(
    SUMMARY_METRIC_KEYS.map((metricKey) => [
      metricKey,
      mergeCoverageMetric(
        filteredEntries.map(([, summaryEntry]) => summaryEntry),
        metricKey,
      ),
    ]),
  );

  await writeFile(
    summaryFilePath,
    JSON.stringify({
      total: totalEntry,
      ...Object.fromEntries(filteredEntries),
    }),
  );
}

/**
 * Sleeps without depending on Bun runtime globals.
 * @param milliseconds - The number of milliseconds to wait.
 * @returns A promise that resolves after the requested delay.
 */
function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Starts Next on the first available port.  Randomises the starting port so
 * hundreds of concurrent runs spread across the range instead of all piling
 * up on port 3100.  A fast TCP probe skips obviously-taken ports before
 * spawning a child process.
 * @param distDir - The temporary Next.js dist directory for the run.
 * @param rawCoverageOutputDir - The raw coverage output directory for the run.
 * @param tsconfigPath - The temporary tsconfig path for the run.
 * @returns The first dev server that starts successfully.
 */
async function startFirstAvailableDevServer(
  distDir: string,
  rawCoverageOutputDir: string,
  tsconfigPath: string,
) {
  const portRangeSize = 65_535 - PLAYWRIGHT_PORT_START + 1;
  const randomOffset = Math.floor(Math.random() * portRangeSize);

  for (let attempt = 0; attempt < portRangeSize; attempt++) {
    const port =
      PLAYWRIGHT_PORT_START + ((randomOffset + attempt) % portRangeSize);

    const portFree = await isPortAvailable(port);
    if (!portFree) {
      continue;
    }

    const server = startPlaywrightDevServer(
      port,
      distDir,
      rawCoverageOutputDir,
      tsconfigPath,
    );

    try {
      await waitForServerStartup(server.process, server.getRecentOutput);
      await waitForServerReadiness(server, PLAYWRIGHT_SERVER_TIMEOUT_MS);
      server.startForwarding();
      return server;
    } catch (error) {
      const recentOutput = server.getRecentOutput();

      await stopProcess(server.process).catch(() => undefined);

      if (isPortUnavailableOutput(recentOutput)) {
        continue;
      }

      throw error instanceof Error
        ? error
        : createStartupError(
            `Playwright dev server failed to start on port ${port}.`,
            recentOutput,
          );
    }
  }

  throw new Error(
    `No usable Playwright dev-server port found from ${PLAYWRIGHT_PORT_START}.`,
  );
}

/**
 * Starts the dedicated Next.js Playwright dev server on the chosen port.
 * @param port - The TCP port the dev server should bind to.
 * @param distDir - The temporary Next.js dist directory for the run.
 * @param rawCoverageOutputDir - The raw coverage output directory for the run.
 * @param tsconfigPath - The temporary tsconfig path for the run.
 * @returns The dev server handle used by the wrapper.
 */
function startPlaywrightDevServer(
  port: number,
  distDir: string,
  rawCoverageOutputDir: string,
  tsconfigPath: string,
) {
  const child = spawn(
    "python3",
    [
      "-c",
      PYTHON_PARENT_DEATHSIG_LAUNCHER,
      join(process.cwd(), "node_modules", ".bin", "next"),
      "dev",
      "--turbopack",
      "-H",
      PLAYWRIGHT_HOST,
      "-p",
      String(port),
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_TYPESCRIPT_CONFIG_PATH: tsconfigPath,
        ...(PLAYWRIGHT_COVERAGE_ENABLED
          ? {
              // Capture Next.js server execution into the same raw coverage pool.
              NODE_V8_COVERAGE: join(process.cwd(), rawCoverageOutputDir),
            }
          : {}),
        PLAYWRIGHT_NEXT_DIST_DIR: distDir,
        PLAYWRIGHT_PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const outputMirror = createOutputMirror(child);

  return {
    baseURL: buildPlaywrightBaseUrl(PLAYWRIGHT_HOST, port),
    getRecentOutput: outputMirror.getRecentOutput,
    port,
    process: child,
    startForwarding: outputMirror.startForwarding,
  };
}

/**
 * Runs the Playwright CLI with the dynamically selected base URL.
 * @param baseURL - The base URL that Playwright should target.
 * @param port - The TCP port used by the dev server.
 * @param forwardedArguments - The CLI arguments forwarded to Playwright.
 * @param rawCoverageOutputDir - The raw coverage output directory for the run.
 * @param runId - The unique identifier for the current Playwright run.
 * @returns The spawned Playwright CLI child process.
 */
function startPlaywrightTestRun(
  baseURL: string,
  port: number,
  forwardedArguments: string[],
  rawCoverageOutputDir: string,
  runId: string,
) {
  return spawn("bunx", ["playwright", "test", ...forwardedArguments], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: baseURL,
      PLAYWRIGHT_COVERAGE_ENABLED: PLAYWRIGHT_COVERAGE_ENABLED ? "1" : "0",
      PLAYWRIGHT_COVERAGE_OUTPUT_DIR: rawCoverageOutputDir,
      PLAYWRIGHT_HOST,
      PLAYWRIGHT_HTML_REPORT_DIR:
        process.env.PLAYWRIGHT_HTML_REPORT_DIR ?? `playwright-report/${runId}`,
      PLAYWRIGHT_JUNIT_OUTPUT_FILE: PLAYWRIGHT_JUNIT_OUTPUT_FILE,
      PLAYWRIGHT_OUTPUT_DIR:
        process.env.PLAYWRIGHT_OUTPUT_DIR ?? `test-results/playwright/${runId}`,
      PLAYWRIGHT_PORT: String(port),
    },
    stdio: "inherit",
  });
}

/**
 * Stops the foreground Playwright CLI process if the wrapper is interrupted.
 * @param child - The child process to stop.
 */
async function stopProcess(child: ChildProcess | null) {
  if (child?.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill("SIGTERM");

  const exitedNaturally = await Promise.race([
    waitForChildExit(child).then(() => true),
    sleep(PLAYWRIGHT_SHUTDOWN_TIMEOUT_MS).then(() => false),
  ]);

  if (!exitedNaturally) {
    child.kill("SIGKILL");
    await waitForChildExit(child).catch(() => undefined);
  }
}

/**
 * Performs a best-effort synchronous kill of the Playwright CLI process.
 * @param child - The child process to kill synchronously.
 */
function stopProcessNow(child: ChildProcess | null) {
  if (child?.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill("SIGKILL");
}

/**
 * Waits for a child process to exit and resolves with its exit status.
 * @param child - The child process to observe.
 * @returns The child's exit code and terminating signal.
 */
async function waitForChildExit(child: ChildProcess) {
  return await new Promise<{
    code: null | number;
    signal: NodeJS.Signals | null;
  }>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });
}

/**
 * Waits for the configured app route to be reachable before tests start.
 * @param server - The dev server handle to poll for readiness.
 * @param timeoutMs - The maximum time to wait for readiness.
 */
async function waitForServerReadiness(
  server: DevServerHandle,
  timeoutMs: number,
) {
  const readinessURL = `${server.baseURL}${PLAYWRIGHT_READINESS_PATH}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (
      server.process.exitCode !== null ||
      server.process.signalCode !== null
    ) {
      throw createStartupError(
        `Playwright dev server exited before ${PLAYWRIGHT_READINESS_PATH} became ready.`,
        server.getRecentOutput(),
      );
    }

    let response: Response;

    try {
      response = await fetch(readinessURL, {
        signal: AbortSignal.timeout(3_000),
      });
    } catch {
      // Keep polling until the server becomes reachable or times out.
      await sleep(250);
      continue;
    }

    if (response.ok) {
      return;
    }

    if (response.status >= 500) {
      throw createStartupError(
        `Playwright dev server returned ${response.status} for ${PLAYWRIGHT_READINESS_PATH}.`,
        server.getRecentOutput(),
      );
    }

    await sleep(250);
  }

  throw createStartupError(
    `Timed out waiting for Playwright dev server readiness at ${readinessURL}.`,
    server.getRecentOutput(),
  );
}

/**
 * Detects whether the dev server has claimed its port by watching child-process
 * output for the "- Local:" line that Next.js emits once its HTTP server is
 * listening.  Falls back to EADDRINUSE detection and process-exit checks so
 * the port-scan loop can advance without the old two-second blind timer.
 * @param child - The spawned dev-server process to observe.
 * @param getRecentOutput - The callback that returns the recent server output.
 */
async function waitForServerStartup(
  child: ChildProcess,
  getRecentOutput: () => string,
) {
  const deadline = Date.now() + PLAYWRIGHT_SERVER_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw createStartupError(
        "Playwright dev server exited before startup completed.",
        getRecentOutput(),
      );
    }

    const output = getRecentOutput();

    if (isPortUnavailableOutput(output)) {
      throw createStartupError(
        "Playwright dev server port is already in use.",
        output,
      );
    }

    // Next.js (webpack and turbopack) prints "- Local:" followed by the
    // bound address once its HTTP server is listening.
    if (/- Local:\s+http/iu.test(output)) {
      return;
    }

    await sleep(50);
  }

  throw createStartupError(
    "Timed out waiting for Playwright dev server to claim its port.",
    getRecentOutput(),
  );
}

void main();
