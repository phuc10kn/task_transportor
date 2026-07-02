const handlers = new Map();

function registerHandler(jobType, handler) {
  handlers.set(jobType, handler);
}

function getHandler(jobType) {
  return handlers.get(jobType);
}

function listHandlerTypes() {
  return Array.from(handlers.keys()).sort();
}

function clearHandlersForTest() {
  handlers.clear();
}

async function noopTestHandler(job) {
  const payload = job.payload_json || {};

  if (payload.fail) {
    const error = new Error(payload.error_message || "Noop test handler failed.");
    error.retryable = Boolean(payload.retryable);
    throw error;
  }

  return {
    ok: true,
    job_id: job.id,
  };
}

async function manualPullHandler(job, context) {
  const BacklogApi = require("../../Backlog/BacklogApi");

  return BacklogApi.handleManualPullJob(job, context);
}

async function translateHandler(job, context) {
  const TranslationApi = require("../../Translation/TranslationApi");

  return TranslationApi.handleTranslateJob(job, context);
}

async function pushIssueHandler(job, context) {
  const JiraApi = require("../../Jira/JiraApi");

  return JiraApi.handlePushIssueJob(job, context);
}

async function pushCommentHandler(job, context) {
  const JiraApi = require("../../Jira/JiraApi");

  return JiraApi.handlePushCommentJob(job, context);
}

function registerDefaultHandlers() {
  registerHandler("noop_test", noopTestHandler);
  registerHandler("manual_pull", manualPullHandler);
  registerHandler("translate", translateHandler);
  registerHandler("push_issue", pushIssueHandler);
  registerHandler("push_comment", pushCommentHandler);
}

registerDefaultHandlers();

module.exports = {
  clearHandlersForTest,
  getHandler,
  listHandlerTypes,
  registerDefaultHandlers,
  registerHandler,
};
