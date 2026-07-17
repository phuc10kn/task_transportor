const { assertCapability, assertRegisteredOperation, externalError } = require("./policy");
const { BACKLOG_OPERATIONS } = require("./backlog/operations");
const { JIRA_OPERATIONS } = require("./jira/operations");

const states = new WeakMap();
const registries = { backlog: BACKLOG_OPERATIONS, jira: JIRA_OPERATIONS };

function createExternalAccessScope({ config, projectId }) {
  const project = require("../../modules/Projects/ProjectsApi").getProject({ config, projectId });
  const scope = Object.freeze({});
  states.set(scope, { config, project: Object.freeze({ ...project }) });
  return scope;
}

function scopeState(scope, expectedProjectId) {
  const state = states.get(scope);
  if (!state) {
    throw externalError("EXTERNAL_SCOPE_INVALID", "External access scope is invalid.", {}, 500);
  }
  if (expectedProjectId !== undefined && Number(state.project.id) !== Number(expectedProjectId)) {
    throw externalError(
      "EXTERNAL_SCOPE_PROJECT_MISMATCH",
      "External access scope belongs to a different Project.",
      { expected_project_id: Number(expectedProjectId), actual_project_id: Number(state.project.id) },
      500
    );
  }
  return state;
}

function assertScopeOperation(scope, expectedProjectId, provider, operation) {
  const state = scopeState(scope, expectedProjectId);
  const registry = registries[provider] || {};
  const definition = assertRegisteredOperation(registry, provider, operation);
  assertCapability(state.project, provider, operation, definition);
  return { state, definition };
}

module.exports = {
  assertScopeOperation,
  createExternalAccessScope,
  scopeState,
};
