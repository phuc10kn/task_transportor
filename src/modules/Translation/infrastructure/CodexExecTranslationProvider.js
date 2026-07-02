const childProcess = require("child_process");

const { AppError } = require("../../../http/errors/AppError");
const { hashText } = require("../support/hashText");
const { parseCodexExecOutput } = require("../support/parseCodexExecOutput");

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

function createCodexExecTranslationProvider({ config }) {
  async function translate(request) {
    const command = config.translation.codexExecCommand;
    if (!command) {
      const error = new AppError({
        code: "CODEX_EXEC_COMMAND_MISSING",
        message: "CODEX_EXEC_COMMAND is required for codex_exec translation.",
        status: 500,
      });
      error.retryable = false;
      throw error;
    }

    const startedAt = Date.now();
    const stdin = JSON.stringify(request);
    const requestHash = hashText(stdin);

    return new Promise((resolve, reject) => {
      let settled = false;
      let stdout = "";
      let stderr = "";

      const child = childProcess.spawn(command, {
        cwd: config.translation.codexExecWorkdir,
        shell: true,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const timeout = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        killProcessTree(child);
        const error = new AppError({
          code: "CODEX_EXEC_TIMEOUT",
          message: "codex_exec timed out.",
          status: 504,
          details: {
            timeout_seconds: config.translation.codexExecTimeoutSeconds,
            request_hash: requestHash,
          },
        });
        error.retryable = true;
        reject(error);
      }, config.translation.codexExecTimeoutSeconds * 1000);

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
        const error = new AppError({
          code: "CODEX_EXEC_SPAWN_ERROR",
          message: "codex_exec could not be started.",
          status: 502,
          details: {
            request_hash: requestHash,
          },
        });
        error.retryable = true;
        error.cause = spawnError;
        reject(error);
      });

      child.on("close", (exitCode) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);

        if (exitCode !== 0) {
          const error = new AppError({
            code: "CODEX_EXEC_EXIT_ERROR",
            message: "codex_exec exited with a non-zero status.",
            status: 502,
            details: {
              exit_code: exitCode,
              request_hash: requestHash,
              stderr_hash: hashText(stderr),
              stderr_tail: tail(stderr || stdout),
            },
          });
          error.retryable = true;
          reject(error);
          return;
        }

        try {
          const parsed = parseCodexExecOutput(stdout);
          resolve({
            ...parsed,
            provider: "codex_exec",
            model_or_command: command,
            provider_request_id: requestHash,
            duration_ms: Date.now() - startedAt,
          });
        } catch (error) {
          error.details = {
            ...(error.details || {}),
            request_hash: requestHash,
            stdout_hash: hashText(stdout),
          };
          reject(error);
        }
      });

      child.stdin.write(stdin);
      child.stdin.end();
    });
  }

  return {
    translate,
  };
}

module.exports = {
  createCodexExecTranslationProvider,
};
