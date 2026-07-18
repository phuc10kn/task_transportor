function chatCompletionsUrl(baseUrl) {
  const normalized = String(baseUrl || "https://api.deepseek.com").replace(/\/+$/, "");
  if (normalized.endsWith("/chat/completions")) {
    return normalized;
  }

  return `${normalized}/chat/completions`;
}

function extractContent(responseBody) {
  const choice = responseBody && Array.isArray(responseBody.choices)
    ? responseBody.choices[0]
    : null;
  const content = choice && choice.message ? choice.message.content : null;
  return typeof content === "string" ? content.trim() : "";
}

function temperatureFor(model, requestedTemperature) {
  if (/^gpt-5(?:[.-]|$)/i.test(String(model || ""))) {
    return 1;
  }

  return requestedTemperature === undefined ? 0.2 : requestedTemperature;
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

function createOpenAiCompatibleChatClient({
  apiKey,
  baseUrl,
  timeoutSeconds = 60,
  includeThinking = true,
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
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: temperatureFor(input.model, input.temperature),
      ...(includeThinking ? { thinking: input.thinking || { type: "disabled" } } : {}),
      ...(input.reasoning_effort ? { reasoning_effort: input.reasoning_effort } : {}),
    };

    try {
      response = await transport.request({
        url: chatCompletionsUrl(baseUrl),
        method: "POST",
        headers: {
          "authorization": `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
        logBody: requestBody,
        timeoutMs: timeoutSeconds * 1000,
        observability: config ? { config, provider, operation: "chat.completions" } : undefined,
      });
      try { body = response.rawText ? JSON.parse(response.rawText) : null; }
      catch (_error) { body = null; }
    } catch (error) {
      if (error && error.code === "EXTERNAL_HTTP_FETCH_UNAVAILABLE") {
        throw createAiClientError({
          code: "FETCH_UNAVAILABLE",
          message: "Global fetch is required for AI chat requests.",
          status: 500,
          retryable: false,
          cause: error,
        });
      }
      throw createAiClientError({
        code: error && error.code === "EXTERNAL_HTTP_TIMEOUT"
          ? "AI_OPENAI_COMPATIBLE_TIMEOUT"
          : "AI_OPENAI_COMPATIBLE_REQUEST_ERROR",
        message: error && error.code === "EXTERNAL_HTTP_TIMEOUT"
          ? "OpenAI-compatible AI request timed out."
          : "OpenAI-compatible AI request failed.",
        status: error && error.code === "EXTERNAL_HTTP_TIMEOUT" ? 504 : 502,
        retryable: true,
        cause: error,
      });
    }

    if (!response.ok) {
      throw createAiClientError({
        code: "AI_OPENAI_COMPATIBLE_HTTP_ERROR",
        message: "OpenAI-compatible AI request returned an error response.",
        status: response.status === 429 ? 429 : 502,
        retryable: response.status === 429 || response.status >= 500,
        details: {
          http_status: response.status,
          provider_error_code: body && body.error ? body.error.code : null,
          provider_error_param: body && body.error ? body.error.param : null,
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
  createOpenAiCompatibleChatClient,
};
const { createHttpTransport } = require("../http/HttpTransport");
