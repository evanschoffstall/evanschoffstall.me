import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

const MAIN_BRANCH = "main";
const CICD_LOCK_NAME = "check-suite-cicd.lock";
type Command = readonly [string, ...string[]];
interface CommandResult { durationInMilliseconds: number; exitCode: number; stderr: string; stdout: string; }
interface MainBranchRevisionState { headRevision: string; remoteRevision: string; }
type MainBranchSyncAction = "continue" | "fail" | "fast-forward";
type MainBranchSyncPhase = "post-release" | "pre-release";
type OutputMode = "capture" | "inherit";
type ReleaseCandidatePreparationAction = "auto-stage" | "continue" | "use-clean-head";
interface ReleaseStep { command: Command; label: string; }
const existingLocalTagPattern = /fatal: tag '([^']+)' already exists/iu;

/** Keep CI/CD deterministic while still prompting for explicit operator consent. */
class ReleaseWorkflowError extends Error {
  constructor(message: string, readonly exitCode = 1) {
    super(message);
    this.name = "ReleaseWorkflowError";
  }
}

const git = (...arguments_: [string, ...string[]]): Command => ["git", ...arguments_];
const logRelease = (message: string): void => { console.info(`[cicd] ${message}`); };
const failRelease = (message: string): never => { logRelease(message); throw new ReleaseWorkflowError(message); };

/** Resolve whether a command is available on the current PATH before prompting to use it. */
const hasCommandAvailable = async (commandName: string): Promise<boolean> => {
  const result = await runCommand(["bash", "-lc", `command -v -- ${JSON.stringify(commandName)}`], "capture");
  return result.exitCode === 0;
};

/** Keep pre-release validation strict while allowing the published release commit to advance origin/main. */
export function determineMainBranchSyncAction(phase: MainBranchSyncPhase, state: MainBranchRevisionState): MainBranchSyncAction {
  if (state.headRevision === state.remoteRevision) return "continue";
  return phase === "post-release" ? "fast-forward" : "fail";
}

/**
 * Decide whether release validation should use the staged index, auto-stage the
 * current worktree, or accept the already-committed clean HEAD as the release
 * candidate.
 */
export function determineReleaseCandidatePreparationAction(hasStagedReleaseCandidate: boolean, hasPendingWorktreeChanges: boolean): ReleaseCandidatePreparationAction {
  if (hasStagedReleaseCandidate) return "continue";
  return hasPendingWorktreeChanges ? "auto-stage" : "use-clean-head";
}

/**
 * Convert semantic-release's raw git-tag collision into an actionable operator
 * message so local tag state is fixed before the workflow retries.
 */
export function formatExistingLocalTagFailure(stderr: string): string | undefined {
  const tagMatch = existingLocalTagPattern.exec(stderr);
  if (!tagMatch) return undefined;
  const [, tagName] = tagMatch;
  return `semantic-release could not create ${tagName} because that tag already exists in the local git repository. GitHub releases and visible remote tags can already be gone while the local tag still remains. Delete the local tag with 'git tag -d ${tagName}' and remove any matching remote tag ref before retrying.`;
}

function readProcessStream(stream: NodeJS.ReadableStream | null): Promise<string> {
  if (!stream) {
    return Promise.resolve("");
  }

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    stream.setEncoding("utf8");
    stream.on("data", (chunk: string) => {
      chunks.push(chunk);
    });
    stream.once("error", reject);
    stream.once("end", () => {
      resolve(chunks.join(""));
    });
  });
}

/** Run subprocesses in either streaming or captured mode without losing timing data. */
async function runCommand(command: Command, outputMode: OutputMode = "inherit", cwd = process.cwd()): Promise<CommandResult> {
  const [executable, ...arguments_] = command;
  const startedAt = Date.now();
  const shouldCaptureOutput = outputMode === "capture";
  const child = spawn(executable, arguments_, {
    cwd,
    env: process.env,
    stdio: [
      shouldCaptureOutput ? "ignore" : "inherit",
      shouldCaptureOutput ? "pipe" : "inherit",
      shouldCaptureOutput ? "pipe" : "inherit",
    ],
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    waitForExitCode(child),
    shouldCaptureOutput ? readProcessStream(child.stdout) : Promise.resolve(""),
    shouldCaptureOutput ? readProcessStream(child.stderr) : Promise.resolve(""),
  ]);
  return { durationInMilliseconds: Date.now() - startedAt, exitCode, stderr, stdout };
}

/** Abort immediately on failing steps so later release stages never run on invalid state. */
async function runStepOrExit(step: ReleaseStep, cwd?: string): Promise<void> {
  logRelease(`Starting: ${step.label}`);
  const result = await runCommand(step.command, "inherit", cwd);
  if (result.exitCode !== 0) {
    logRelease(`Failed: ${step.label} (exit code ${result.exitCode} after ${result.durationInMilliseconds}ms)`);
    throw new ReleaseWorkflowError(step.label, result.exitCode);
  }
  logRelease(`Completed: ${step.label} (${result.durationInMilliseconds}ms)`);
}

function waitForExitCode(child: ReturnType<typeof spawn>): Promise<number> {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (typeof code === "number") {
        resolve(code);
        return;
      }

      resolve(signal ? 1 : 0);
    });
  });
}

const runCommandForStdout = async (command: Command, failureLabel: string): Promise<string> => {
  const result = await runCommand(command, "capture");
  if (result.exitCode === 0) return result.stdout.trim();
  const stderr = result.stderr.trim();
  return failRelease(stderr.length > 0 ? `${failureLabel}: ${stderr}` : `${failureLabel}: command exited with ${result.exitCode}.`);
};

/** Preserve captured subprocess output while still allowing custom failure handling. */
const writeCapturedOutput = (stream: "stderr" | "stdout", text: string): void => {
  if (text.length === 0) return;
  const target = stream === "stdout" ? process.stdout : process.stderr;
  target.write(text.endsWith("\n") ? text : `${text}\n`);
};

/** Isolate staged and committed snapshots while reusing the main dependency tree. */
async function withSnapshot<T>(prefix: string, materialize: (path: string) => Promise<void>, cleanup: (path: string) => Promise<void>, action: (path: string) => Promise<T>): Promise<T> {
  const path = await mkdtemp(join(tmpdir(), prefix));
  let isMaterialized = false;
  try {
    await materialize(path);
    isMaterialized = true;
    await access(join(process.cwd(), "node_modules")).catch(() => failRelease("node_modules is required for staged CI/CD validation. Install dependencies before continuing."));
    await symlink(join(process.cwd(), "node_modules"), join(path, "node_modules"), "dir");
    return await action(path);
  } finally {
    await (isMaterialized ? cleanup(path) : rm(path, { force: true, recursive: true }));
  }
}

const askYesNo = async (question: string): Promise<boolean> => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return ["y", "yes"].includes((await readline.question(question)).trim().toLowerCase());
  } finally {
    readline.close();
  }
};

const getHeadRevision = async (label: string): Promise<string> => await runCommandForStdout(git("rev-parse", "HEAD"), label);
const getOriginMainRevision = async (label: string): Promise<string> => await runCommandForStdout(git("rev-parse", `refs/remotes/origin/${MAIN_BRANCH}`), label);
const hasPendingChanges = async (): Promise<boolean> => (await runCommandForStdout(git("status", "--porcelain"), "Unable to inspect the git worktree")).length > 0;
const hasStagedChanges = async (): Promise<boolean> => (await runCommandForStdout(git("diff", "--cached", "--name-only"), "Unable to inspect staged release changes")).length > 0;

/** Auto-stage the current release candidate when the workflow starts from a dirty but unstaged worktree. */
const stageAllPendingChanges = async (): Promise<void> => { await runStepOrExit({ command: git("add", "--all"), label: "Stage the release candidate" }); };

/**
 * Ensure the release flow has a deterministic snapshot to validate. A clean
 * worktree means HEAD and the index already represent the same committed
 * candidate, so no additional staging is required.
 */
const ensureStagedReleaseCandidate = async (): Promise<void> => {
  const preparationAction = determineReleaseCandidatePreparationAction(await hasStagedChanges(), await hasPendingChanges());
  if (preparationAction === "continue") return;
  if (preparationAction === "use-clean-head") {
    logRelease("No staged release candidate found at startup, but the worktree is clean. Continuing with the committed HEAD snapshot.");
    return;
  }
  logRelease("No staged release candidate found at startup. Auto-staging all pending changes.");
  await stageAllPendingChanges();
  if (await hasStagedChanges()) return;
  failRelease("Auto-staging completed, but no staged release candidate was produced. Inspect ignored files and release inputs before running CI/CD.");
};
const fetchOriginMain = async (label = `Fetch origin/${MAIN_BRANCH}`): Promise<void> => { await runStepOrExit({ command: git("fetch", "origin", MAIN_BRANCH), label }); };
const readMainBranchRevisionState = async (): Promise<MainBranchRevisionState> => {
  const [headRevision, remoteRevision] = await Promise.all([
    getHeadRevision("Unable to resolve local HEAD"),
    getOriginMainRevision(`Unable to resolve origin/${MAIN_BRANCH}`),
  ]);
  return { headRevision, remoteRevision };
};
const formatMainBranchMismatch = (state: MainBranchRevisionState): string => `Local HEAD (${state.headRevision}) does not match origin/${MAIN_BRANCH} (${state.remoteRevision}). Push or reconcile before continuing.`;

async function acquireReleaseLock(): Promise<() => Promise<void>> {
  const lockDirectoryPath = join(process.cwd(), await runCommandForStdout(git("rev-parse", "--git-dir"), "Unable to resolve the git directory"), CICD_LOCK_NAME);
  const metadataPath = join(lockDirectoryPath, "metadata.json");
  const writeMetadata = async (): Promise<void> => { await writeFile(metadataPath, JSON.stringify({ acquiredAt: new Date().toISOString(), pid: process.pid }, null, 2), "utf8"); };
  try {
    await mkdir(lockDirectoryPath);
  } catch (error_) {
    const isExistingLock = error_ instanceof Error && "code" in error_ && error_.code === "EEXIST";
    if (!isExistingLock) throw error_;
    const metadata = await readFile(metadataPath, "utf8").then((text) => JSON.parse(text) as { pid?: number }).catch(() => undefined);
    const isStale = typeof metadata?.pid === "number" && (() => { try { process.kill(metadata.pid, 0); return false; } catch (processError) { return processError instanceof Error && "code" in processError && processError.code === "ESRCH"; } })();
    if (!isStale) failRelease(`Another CI/CD run already holds ${lockDirectoryPath}. Remove it only after confirming the previous process is gone.`);
    await rm(lockDirectoryPath, { force: true, recursive: true });
    await mkdir(lockDirectoryPath);
    logRelease(`Recovered stale CI/CD lock at ${lockDirectoryPath}.`);
  }
  await writeMetadata();
  return async (): Promise<void> => { await rm(lockDirectoryPath, { force: true, recursive: true }); };
}

async function commitPendingChangesIfRequested(): Promise<void> {
  if (!(await hasPendingChanges())) return;
  if (!(await hasStagedChanges())) failRelease("Dirty worktree detected with no staged release candidate. Stage the exact release changes first so staged-only validation does not diverge from the eventual commit.");
  logRelease("Pending changes detected.");
  if (await hasCommandAvailable("gitaicmt")) {
    if (!(await askYesNo("Run gitaicmt? (y/n) "))) failRelease("CI/CD flow cancelled because the worktree is not clean.");
    await runStepOrExit({ command: ["gitaicmt"], label: "Create commit with gitaicmt" });
    return;
  }
  if (!(await askYesNo("Commit now as needed. Ready to proceed? (y/n) "))) {
    failRelease("CI/CD flow cancelled because the worktree is not clean.");
  }
  if (await hasPendingChanges()) {
    failRelease("CI/CD flow still has pending changes. Commit or clean the release candidate before continuing.");
  }
}

async function ensureHeadMatchesOriginMain(fetchLabel = `Fetch origin/${MAIN_BRANCH}`): Promise<string> {
  await fetchOriginMain(fetchLabel);
  const state = await readMainBranchRevisionState();
  if (determineMainBranchSyncAction("pre-release", state) === "fail") {
    failRelease(formatMainBranchMismatch(state));
  }
  return state.headRevision;
}

/** Fast-forward main to the source branch tip so semantic-release's commit is the sole release marker. */
async function fastForwardBranchIntoMain(sourceBranch: string): Promise<void> {
  if (sourceBranch === MAIN_BRANCH) return;
  await runStepOrExit({ command: git("checkout", MAIN_BRANCH), label: `Check out ${MAIN_BRANCH}` });
  await runStepOrExit({ command: git("merge", "--ff-only", sourceBranch), label: `Fast-forward ${MAIN_BRANCH} to '${sourceBranch}'` });
}

/** Preserve the source branch commits remotely before the release merge lands on main. */
async function pushSourceBranchIfNeeded(sourceBranch: string): Promise<void> {
  if (sourceBranch === MAIN_BRANCH) return;
  await runStepOrExit({ command: git("push", "--force-with-lease", "origin", sourceBranch), label: `Push ${sourceBranch} to origin` });
}

/**
 * Rebase source branch onto origin/main when main has advanced since the
 * last sync, so the subsequent fast-forward into main succeeds cleanly.
 */
async function reconcileSourceBranchWithMain(sourceBranch: string): Promise<void> {
  if (sourceBranch === MAIN_BRANCH) return;
  await fetchOriginMain();
  const ancestorCheck = await runCommand(git("merge-base", "--is-ancestor", `refs/remotes/origin/${MAIN_BRANCH}`, "HEAD"), "capture");
  if (ancestorCheck.exitCode === 0) return;
  logRelease(`Rebasing '${sourceBranch}' onto origin/${MAIN_BRANCH} so fast-forward into ${MAIN_BRANCH} succeeds.`);
  await runStepOrExit({ command: git("rebase", `refs/remotes/origin/${MAIN_BRANCH}`), label: `Rebase '${sourceBranch}' onto origin/${MAIN_BRANCH}` });
}

/** Resolve the current branch name and fail if in detached HEAD state. */
async function resolveSourceBranch(): Promise<string> {
  const branchName = await runCommandForStdout(git("rev-parse", "--abbrev-ref", "HEAD"), "Unable to determine the current branch");
  if (branchName === "HEAD") failRelease("CI/CD flow must run from a named branch, not detached HEAD.");
  return branchName;
}

/** Restore the operator's starting branch after temporarily checking out main during release automation. */
async function restoreSourceBranch(sourceBranch: string): Promise<void> {
  const currentBranch = await runCommandForStdout(git("rev-parse", "--abbrev-ref", "HEAD"), "Unable to determine the current branch for cleanup");
  if (currentBranch === sourceBranch) return;
  await runStepOrExit({ command: git("checkout", sourceBranch), label: `Restore ${sourceBranch}` });
}

const ensureNoStagedChangesRemain = async (): Promise<void> => {
  if (await hasStagedChanges()) failRelease("CI/CD flow still has staged changes after commit creation. Commit or unstage the remaining release candidate before continuing.");
};

const runBunCheckAgainstIndexSnapshot = async (): Promise<void> => { await withSnapshot("check-suite-cicd-", async (path) => { await runStepOrExit({ command: git("checkout-index", "--all", `--prefix=${path}/`), label: "Materialize the staged snapshot" }); }, async (path) => { await rm(path, { force: true, recursive: true }); }, async (path) => {
  logRelease(`Running bun check in staged snapshot ${path}`);
  await runStepOrExit({ command: ["bun", "check"], label: "Run bun check for the staged snapshot" }, path);
}); };

/** Validate the staged or committed candidate, run semantic-release on main, then sync branches. */
async function main(): Promise<void> {
  const releaseLock = await acquireReleaseLock();
  let sourceBranch: string | undefined;
  try {
    sourceBranch = await resolveSourceBranch();
    await ensureStagedReleaseCandidate();
    await runBunCheckAgainstIndexSnapshot();
    await commitPendingChangesIfRequested();
    await ensureNoStagedChangesRemain();
    await reconcileSourceBranchWithMain(sourceBranch);
    await pushSourceBranchIfNeeded(sourceBranch);
    await fastForwardBranchIntoMain(sourceBranch);
    await runStepOrExit({ command: git("push", "origin", MAIN_BRANCH), label: `Push ${MAIN_BRANCH} to origin` });
    const releaseRevision = await ensureHeadMatchesOriginMain();
    if (!(await askYesNo("Publish the release now? (y/n) "))) { logRelease("Publish step skipped by user."); return; }
    if ((await getHeadRevision("Unable to resolve the current revision")) !== releaseRevision) failRelease(`HEAD changed during the CI/CD workflow (${releaseRevision} -> ${await getHeadRevision("Unable to resolve the current revision")}). Restart from a stable state.`);
    await ensureHeadMatchesOriginMain();
    await runSemanticReleaseOrExit();
    await runStepOrExit({ command: git("fetch", "origin", MAIN_BRANCH), label: `Fetch origin/${MAIN_BRANCH} after release` });
    await runStepOrExit({ command: git("reset", "--hard", `refs/remotes/origin/${MAIN_BRANCH}`), label: `Reset local ${MAIN_BRANCH} to origin/${MAIN_BRANCH}` });
    await syncSourceBranchWithMain(sourceBranch);
  } finally {
    if (typeof sourceBranch === "string") {
      await restoreSourceBranch(sourceBranch);
    }
    await releaseLock();
  }
}

/** Run semantic-release with captured output so known git tag collisions can be surfaced clearly. */
async function runSemanticReleaseOrExit(): Promise<void> {
  const step: ReleaseStep = {
    command: ["bunx", "semantic-release", "--no-ci"],
    label: "Run semantic-release",
  };
  logRelease(`Starting: ${step.label}`);
  const result = await runCommand(step.command, "capture");
  writeCapturedOutput("stdout", result.stdout);
  writeCapturedOutput("stderr", result.stderr);
  if (result.exitCode === 0) {
    logRelease(`Completed: ${step.label} (${result.durationInMilliseconds}ms)`);
    return;
  }
  const existingLocalTagFailure = formatExistingLocalTagFailure(result.stderr);
  if (existingLocalTagFailure) {
    logRelease(existingLocalTagFailure);
    throw new ReleaseWorkflowError(existingLocalTagFailure, result.exitCode);
  }
  logRelease(`Failed: ${step.label} (exit code ${result.exitCode} after ${result.durationInMilliseconds}ms)`);
  throw new ReleaseWorkflowError(step.label, result.exitCode);
}

/** Fast-forward source branch to include the release merge and version bump so it stays in sync with main. */
async function syncSourceBranchWithMain(sourceBranch: string): Promise<void> {
  if (sourceBranch === MAIN_BRANCH) return;
  await runStepOrExit({ command: git("checkout", sourceBranch), label: `Check out ${sourceBranch}` });
  await runStepOrExit({ command: git("merge", "--ff-only", MAIN_BRANCH), label: `Fast-forward '${sourceBranch}' to ${MAIN_BRANCH}` });
  await runStepOrExit({ command: git("push", "origin", sourceBranch), label: `Push ${sourceBranch} to origin` });
}

if (import.meta.main) {
  try {
    await main();
  } catch (error_) {
    if (error_ instanceof ReleaseWorkflowError) process.exitCode = error_.exitCode;
    else throw error_;
  }
}