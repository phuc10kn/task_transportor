function transportError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

function createHttpTransport({ fetchImpl = globalThis.fetch } = {}) {
  async function request({ url, method = "GET", headers = {}, body, timeoutMs = 10000 } = {}) {
    if (typeof fetchImpl !== "function") {
      throw transportError("EXTERNAL_HTTP_FETCH_UNAVAILABLE", "Global fetch is required for external HTTP requests.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
    try {
      const response = await fetchImpl(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
      const rawBody = Buffer.from(await response.arrayBuffer());
      return {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
        rawBody,
        rawText: rawBody.toString("utf8"),
      };
    } catch (error) {
      throw transportError(
        error && error.name === "AbortError" ? "EXTERNAL_HTTP_TIMEOUT" : "EXTERNAL_HTTP_NETWORK",
        error && error.name === "AbortError" ? "External HTTP request timed out." : "External HTTP request failed.",
        error
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return { request };
}

module.exports = { createHttpTransport };
