const { AppError } = require("../../../http/errors/AppError");
const { hashText } = require("../support/hashText");
const { parseCodexExecOutput } = require("../support/parseCodexExecOutput");

function createProcessTranslationAdapter({ processClient, command }) {
  async function generateDraft(request) {
    const startedAt = Date.now();
    const stdin = JSON.stringify(request);
    const requestHash = hashText(stdin);

    let result;
    try {
      result = await processClient.runJson(request);
    } catch (error) {
      const appError = new AppError({
        code: error && error.code ? error.code : "CODEX_EXEC_REQUEST_ERROR",
        message: error && error.message ? error.message : "codex_exec request failed.",
        status: error && error.status ? error.status : 502,
        details: {
          ...(error && error.details ? error.details : {}),
          request_hash: requestHash,
          ...(error && error.details && error.details.stderr_tail
            ? { stderr_hash: hashText(error.details.stderr_tail) }
            : {}),
        },
      });
      appError.retryable = error && error.retryable !== undefined ? error.retryable : true;
      throw appError;
    }

    try {
      const parsed = parseCodexExecOutput(result.stdout);
      return {
        ...parsed,
        provider: "codex_exec",
        model_or_command: command,
        provider_request_id: requestHash,
        duration_ms: Date.now() - startedAt,
      };
    } catch (error) {
      error.details = {
        ...(error.details || {}),
        request_hash: requestHash,
        stdout_hash: hashText(result.stdout),
      };
      throw error;
    }
  }

  return {
    generateDraft,
  };
}

module.exports = {
  createProcessTranslationAdapter,
};
