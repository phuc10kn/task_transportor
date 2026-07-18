const { startExternalRequest } = require("../../../observability/externalLifecycle");

function transportError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

function requestBodyForLog(body, explicitBody) {
  if (explicitBody !== undefined) return explicitBody;
  if (body === undefined || body === null || Buffer.isBuffer(body)) return body;
  if (typeof body !== "string") return body;
  try { return JSON.parse(body); } catch (_error) { return body; }
}

function responseBodyForLog(rawBody, contentType) {
  const type = String(contentType || "").toLowerCase();
  const text = rawBody.toString("utf8");
  if (type.includes("json")) {
    try { return { body: text ? JSON.parse(text) : null, binaryOmitted: false }; }
    catch (_error) { return { body: text, binaryOmitted: false }; }
  }
  if (type.startsWith("text/") || type.includes("xml") || type.includes("x-www-form-urlencoded")) {
    return { body: text, binaryOmitted: false };
  }
  if (!rawBody.length) return { body: null, binaryOmitted: false };
  return { body: null, binaryOmitted: true };
}

function providerRequestId(headers) {
  if (!headers || typeof headers.get !== "function") return null;
  return headers.get("x-request-id") || headers.get("x-arequestid") || headers.get("request-id") || null;
}

async function readRawBody(response) {
  if (response && typeof response.arrayBuffer === "function") {
    return { rawBody: Buffer.from(await response.arrayBuffer()), fallbackContentType: null };
  }
  if (response && typeof response.text === "function") {
    return { rawBody: Buffer.from(await response.text(), "utf8"), fallbackContentType: "text/plain" };
  }
  if (response && typeof response.json === "function") {
    return { rawBody: Buffer.from(JSON.stringify(await response.json()), "utf8"), fallbackContentType: "application/json" };
  }
  return { rawBody: Buffer.alloc(0), fallbackContentType: null };
}

const EMPTY_HEADERS = { get() { return null; } };

function createHttpTransport({ fetchImpl = globalThis.fetch } = {}) {
  async function request({
    url,
    method = "GET",
    headers = {},
    body,
    timeoutMs = 10000,
    observability,
    logBody,
  } = {}) {
    const lifecycle = observability && observability.config
      ? startExternalRequest({
        ...observability,
        method,
        url,
        body: requestBodyForLog(body, logBody),
      })
      : null;
    if (typeof fetchImpl !== "function") {
      const unavailable = transportError("EXTERNAL_HTTP_FETCH_UNAVAILABLE", "Global fetch is required for external HTTP requests.");
      if (lifecycle) lifecycle.error(unavailable);
      throw unavailable;
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
      const responseHeaders = response.headers && typeof response.headers.get === "function"
        ? response.headers
        : EMPTY_HEADERS;
      const readBody = await readRawBody(response);
      const rawBody = readBody.rawBody;
      if (lifecycle) {
        const loggedResponse = responseBodyForLog(
          rawBody,
          responseHeaders.get("content-type") || readBody.fallbackContentType
        );
        lifecycle.response({
          status: response.status,
          body: loggedResponse.body,
          binaryOmitted: loggedResponse.binaryOmitted,
          providerRequestId: providerRequestId(responseHeaders),
        });
      }
      return {
        status: response.status,
        ok: response.ok,
        headers: responseHeaders,
        rawBody,
        rawText: rawBody.toString("utf8"),
      };
    } catch (error) {
      const mapped = transportError(
        error && error.name === "AbortError" ? "EXTERNAL_HTTP_TIMEOUT" : "EXTERNAL_HTTP_NETWORK",
        error && error.name === "AbortError" ? "External HTTP request timed out." : "External HTTP request failed.",
        error
      );
      if (lifecycle) lifecycle.error(mapped);
      throw mapped;
    } finally {
      clearTimeout(timeout);
    }
  }

  return { request };
}

module.exports = { createHttpTransport };
