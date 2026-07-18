const crypto = require("crypto");
const { AsyncLocalStorage } = require("async_hooks");

const storage = new AsyncLocalStorage();
const SAFE_CORRELATION_ID = /^[A-Za-z0-9._:-]{1,128}$/;

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function correlationIdFrom(value) {
  const candidate = String(value || "").trim();
  return SAFE_CORRELATION_ID.test(candidate) ? candidate : createId("req");
}

function createRequestTrace(incomingCorrelationId) {
  return {
    trace_id: createId("trc"),
    correlation_id: correlationIdFrom(incomingCorrelationId),
    request_id: createId("http"),
  };
}

function currentTraceContext() {
  return storage.getStore() || {};
}

function runWithTraceContext(context, callback) {
  return storage.run({ ...context }, callback);
}

function withTraceContext(context, callback) {
  return storage.run({ ...currentTraceContext(), ...context }, callback);
}

function updateTraceContext(context) {
  const current = storage.getStore();
  if (!current) return;
  for (const [key, value] of Object.entries(context || {})) {
    if (value !== undefined && value !== null) current[key] = value;
  }
}

module.exports = {
  correlationIdFrom,
  createId,
  createRequestTrace,
  currentTraceContext,
  runWithTraceContext,
  updateTraceContext,
  withTraceContext,
};
