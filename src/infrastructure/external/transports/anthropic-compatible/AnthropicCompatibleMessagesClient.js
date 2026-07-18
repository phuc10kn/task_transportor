function messagesUrl(baseUrl) {
  const normalized = String(baseUrl || "https://api.deepseek.com/anthropic").replace(/\/+$/, "");
  if (normalized.endsWith("/v1/messages")) {
    return normalized;
  }

  return `${normalized}/v1/messages`;
}

function extractContent(responseBody) {
  if (!responseBody) {
    return "";
  }

  if (typeof responseBody.content === "string") {
    return responseBody.content.trim();
  }

  if (!Array.isArray(responseBody.content)) {
    return "";
  }

  return responseBody.content
    .filter((part) => part && part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
}

function createAiClientError({ code, message, status, retryable, details, cause }) {
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

function createAnthropicCompatibleMessagesClient({
  apiKey,
  baseUrl,
  timeoutSeconds = 60,
  config,
  provider = "deepseek",
  httpTransport,
}) {
  const transport = httpTransport || createHttpTransport();

  async function createJsonChatCompletion(input) {
    if (!apiKey) {
      throw createAiClientError({
        code: "AI_API_KEY_MISSING",
        message: "AI API key is required.",
        status: 500,
        retryable: false,
      });
    }

    let response;
    let body;
    const requestBody = {
      model: input.model,
      max_tokens: input.max_tokens || 4096,
      system: input.system,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: input.user }],
        },
      ],
      stream: false,
      temperature: input.temperature === undefined ? 0.2 : input.temperature,
      thinking: input.thinking || { type: "disabled" },
      ...(input.reasoning_effort ? { output_config: { effort: input.reasoning_effort } } : {}),
    };

    try {
      response = await transport.request({
        url: messagesUrl(baseUrl),
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
        logBody: requestBody,
        timeoutMs: timeoutSeconds * 1000,
        observability: config ? { config, provider, operation: "messages.create" } : undefined,
      });
      try { body = response.rawText ? JSON.parse(response.rawText) : null; }
      catch (_error) { body = null; }
    } catch (error) {
      if (error && error.code === "EXTERNAL_HTTP_FETCH_UNAVAILABLE") {
        throw createAiClientError({
          code: "FETCH_UNAVAILABLE",
          message: "Global fetch is required for AI messages requests.",
          status: 500,
          retryable: false,
          cause: error,
        });
      }
      throw createAiClientError({
        code: error && error.code === "EXTERNAL_HTTP_TIMEOUT"
          ? "AI_ANTHROPIC_COMPATIBLE_TIMEOUT"
          : "AI_ANTHROPIC_COMPATIBLE_REQUEST_ERROR",
        message: error && error.code === "EXTERNAL_HTTP_TIMEOUT"
          ? "Anthropic-compatible AI request timed out."
          : "Anthropic-compatible AI request failed.",
        status: error && error.code === "EXTERNAL_HTTP_TIMEOUT" ? 504 : 502,
        retryable: true,
        cause: error,
      });
    }

    if (!response.ok) {
      throw createAiClientError({
        code: "AI_ANTHROPIC_COMPATIBLE_HTTP_ERROR",
        message: "Anthropic-compatible AI request returned an error response.",
        status: response.status === 429 ? 429 : 502,
        retryable: response.status === 429 || response.status >= 500,
        details: {
          http_status: response.status,
          provider_error_code: body && body.error ? body.error.type || body.error.code : null,
        },
      });
    }

    return {
      body,
      content: extractContent(body),
      request_id: body && body.id ? body.id : null,
    };
  }

  return {
    createJsonChatCompletion,
  };
}

module.exports = {
  createAnthropicCompatibleMessagesClient,
};
const { createHttpTransport } = require("../http/HttpTransport");
