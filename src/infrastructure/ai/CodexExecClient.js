const childProcess = require("child_process");

function tail(value, maxLength = 1200) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(text.length - maxLength);
}

function killProcessTree(child) {
  if (!child || !child.pid) {
    return;
  }

  if (process.platform === "win32") {
    childProcess.spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGKILL");
}

function createProcessClientError({ code, message, status, retryable, details, cause }) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.retryable = retryable;
  error.details = details || {};
  if (cause) {
    error.cause = cause;
  }
  return error;
}

function createCodexExecClient({ command, timeoutSeconds = 60, workdir }) {
  async function runJson(input) {
    if (!command) {
      throw createProcessClientError({
        code: "CODEX_EXEC_COMMAND_MISSING",
        message: "CODEX_EXEC_COMMAND is required.",
        status: 500,
        retryable: false,
      });
    }

    const stdin = JSON.stringify(input);

    return new Promise((resolve, reject) => {
      let settled = false;
      let stdout = "";
      let stderr = "";

      const child = childProcess.spawn(command, {
        cwd: workdir,
        shell: true,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timeout = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        killProcessTree(child);
        reject(createProcessClientError({
          code: "CODEX_EXEC_TIMEOUT",
          message: "codex_exec timed out.",
          status: 504,
          retryable: true,
          details: { timeout_seconds: timeoutSeconds },
        }));
      }, timeoutSeconds * 1000);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (spawnError) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);
        reject(createProcessClientError({
          code: "CODEX_EXEC_SPAWN_ERROR",
          message: "codex_exec could not be started.",
          status: 502,
          retryable: true,
          cause: spawnError,
        }));
      });

      child.on("close", (exitCode) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);

        if (exitCode !== 0) {
          reject(createProcessClientError({
            code: "CODEX_EXEC_EXIT_ERROR",
            message: "codex_exec exited with a non-zero status.",
            status: 502,
            retryable: true,
            details: {
              exit_code: exitCode,
              stderr_tail: tail(stderr || stdout),
            },
          }));
          return;
        }

        resolve({ stdout, stderr });
      });

      child.stdin.write(stdin);
      child.stdin.end();
    });
  }

  return {
    runJson,
  };
}

module.exports = {
  createCodexExecClient,
};
