export const AUTH_TOKEN_KEY = "cis_admin_token";

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
  correlation_id?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly correlationId?: string;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.correlationId = payload.correlation_id;
  }
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  timeoutMs?: number;
};

function assertRelativePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/api/") === false) {
    throw new Error("API client only accepts relative /api/* paths.");
  }
}

function notifyAuthExpired() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new Event("cis-auth-expired"));
  }
}

function serializeBody(body: ApiRequestInit["body"]): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string" || body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams) {
    return body;
  }
  return JSON.stringify(body);
}

export function getAuthToken() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, options: ApiRequestInit = {}): Promise<T> {
  assertRelativePath(path);
  const { timeoutMs = 15000, body: rawBody, ...requestInit } = options;
  const controller = new AbortController();
  const token = getAuthToken();
  const headers = new Headers(requestInit.headers);
  const body = serializeBody(rawBody);

  if (body && !(body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (token) headers.set("authorization", `Bearer ${token}`);

  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  requestInit.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const origin = process.env.NEXT_PUBLIC_CIS_API_ORIGIN?.replace(/\/$/, "") || "";
    const response = await fetch(`${origin}${path}`, {
      ...requestInit,
      body,
      headers,
      signal: controller.signal,
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);

    if (response.status === 401) notifyAuthExpired();
    if (!response.ok) {
      throw new ApiClientError(response.status, payload?.error || {
        code: "HTTP_ERROR",
        message: `Request failed with HTTP ${response.status}.`,
      });
    }
    if (response.status === 204) return undefined as T;
    if (!payload || !Object.prototype.hasOwnProperty.call(payload, "data")) {
      throw new ApiClientError(response.status, {
        code: "INVALID_ENVELOPE",
        message: "API response did not contain a data envelope.",
      });
    }
    return payload.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError(0, {
        code: timedOut ? "REQUEST_TIMEOUT" : "REQUEST_ABORTED",
        message: timedOut ? "The request timed out." : "The request was cancelled.",
      });
    }
    throw new ApiClientError(0, {
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Network request failed.",
    });
  } finally {
    window.clearTimeout(timer);
    requestInit.signal?.removeEventListener("abort", abortFromCaller);
  }
}
