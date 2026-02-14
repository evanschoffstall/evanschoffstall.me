const { spawn } = require("child_process");

const isKnownCliNoise = (line) => {
  if (line.trim() === "}") {
    return true;
  }
  return (
    line.includes('The "code" argument must be of type number') ||
    line.includes("at process.set [as exitCode]") ||
    line.includes("at Cli.runExit") ||
    line.includes("at run (file://") ||
    line.includes("at main (") ||
    line.includes("code: 'ERR_INVALID_ARG_TYPE'")
  );
};

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["contentlayer", "build"], {
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

const forwardFiltered = (chunk, destination, state) => {
  state.buffer += chunk.toString();
  const lines = state.buffer.split(/\r?\n/);
  state.buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (state.suppressingKnownError) {
      if (line.trim() === "}" || line.includes("ERR_INVALID_ARG_TYPE")) {
        state.suppressingKnownError = false;
      }
      continue;
    }

    if (line.includes('The "code" argument must be of type number')) {
      state.suppressingKnownError = true;
      continue;
    }

    if (!line.trim() || isKnownCliNoise(line)) {
      continue;
    }
    destination.write(`${line}\n`);
  }
};

const stdoutState = { buffer: "", suppressingKnownError: false };
child.stdout.on("data", (chunk) => {
  forwardFiltered(chunk, process.stdout, stdoutState);
});

const stderrState = { buffer: "", suppressingKnownError: false };
child.stderr.on("data", (chunk) => {
  forwardFiltered(chunk, process.stderr, stderrState);
});

child.on("close", (code, signal) => {
  if (stdoutState.buffer.trim() && !isKnownCliNoise(stdoutState.buffer)) {
    process.stdout.write(`${stdoutState.buffer}\n`);
  }
  if (stderrState.buffer.trim() && !isKnownCliNoise(stderrState.buffer)) {
    process.stderr.write(`${stderrState.buffer}\n`);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
