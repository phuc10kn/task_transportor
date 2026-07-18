const { AppError } = require("../../../http/errors/AppError");

const BOUNDARY_ERROR_CODES = new Set([
  "EXTERNAL_GATE_BLOCKED",
  "EXTERNAL_OPERATION_NOT_REGISTERED",
  "EXTERNAL_ENDPOINT_BLOCKED",
  "EXTERNAL_SCOPE_INVALID",
  "EXTERNAL_SCOPE_PROJECT_MISMATCH",
]);

function externalError(code, message, details = {}, status = 409) {
  const error = new AppError({ code, message, status, details });
  error.retryable = false;
  return error;
}

function providerOrigin(value, field) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch (_error) {
    url = null;
  }
  if (
    !url || url.protocol !== "https:" || !url.hostname || url.username || url.password
    || url.search || url.hash || (url.pathname && url.pathname !== "/")
  ) {
    throw externalError(
      "EXTERNAL_ENDPOINT_BLOCKED",
      `${field} must be a configured HTTPS origin.`,
      { field },
      422
    );
  }
  return url.origin;
}

function assertRegisteredOperation(registry, provider, operation) {
  const definition = registry[operation];
  if (!definition) {
    throw externalError(
      "EXTERNAL_OPERATION_NOT_REGISTERED",
      `External operation '${operation}' is not registered for ${provider}.`,
      { provider, operation },
      500
    );
  }
  return definition;
}

function assertCapability(project, provider, operation, definition) {
  if (project[definition.capability] !== true) {
    throw externalError(
      "EXTERNAL_GATE_BLOCKED",
      `${provider === "backlog" ? "Backlog" : "Jira"} external ${definition.access} are disabled for this Project.`,
      {
        provider,
        operation,
        capability: definition.capability,
        endpoint_template: definition.template,
      }
    );
  }
}

function isExternalBoundaryError(error) {
  return BOUNDARY_ERROR_CODES.has(error && error.code);
}

module.exports = {
  assertCapability,
  assertRegisteredOperation,
  externalError,
  isExternalBoundaryError,
  providerOrigin,
};
