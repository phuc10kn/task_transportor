const { AppError } = require("../../../http/errors/AppError");
const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const SyncApi = require("../../Sync/SyncApi");
const { createCisRepository } = require("../infrastructure/CisRepository");

function projectsApi() {
  return require("../../Projects/ProjectsApi");
}

function optionalText(value) {
  const text = String(value === undefined || value === null ? "" : value).trim();
  return text || null;
}

function createManualIssue({ config, input, executedBy, correlationId }) {
  const projectId = Number(input && input.project_id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "project_id is required.", status: 422, details: { field: "project_id" } });
  }
  projectsApi().getProject({ config, projectId });
  const summary = optionalText(input.summary);
  if (!summary) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "summary is required.", status: 422, details: { field: "summary" } });
  }
  const dueDate = optionalText(input.due_date);
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new AppError({ code: "VALIDATION_ERROR", message: "due_date must be YYYY-MM-DD.", status: 422, details: { field: "due_date" } });
  }

  const values = {
    summary,
    description: input.description === undefined || input.description === null ? null : String(input.description),
    issue_type: optionalText(input.issue_type),
    priority: optionalText(input.priority),
    status: optionalText(input.status),
    assignee: optionalText(input.assignee),
    due_date: dueDate,
    story_point: 1,
  };
  const fieldsJson = {};
  for (const [field, value] of Object.entries(values)) {
    if (value !== null) {
      fieldsJson[field] = { cis: value };
    }
  }

  const db = createConnection({ config });
  try {
    const issue = runImmediateTransaction(db, () => {
      const created = createCisRepository({ config, db }).createManualIssueRow({
        project_id: projectId,
        ...values,
        fields_json: fieldsJson,
      });
      SyncApi.writeJournalInTransaction({
        db,
        input: {
          project_id: projectId,
          issue_id: created.id,
          direction_from: "cis",
          direction_to: "cis",
          job_type: "manual_create",
          action: "issue_manual_created",
          status: "success",
          trigger: "manual",
          message: "Manual CIS issue created.",
          details_json: { source_system: "manual", revision: 1 },
          executed_by: executedBy || null,
          correlation_id: correlationId || null,
        },
      });
      return created;
    });
    return { outcome: "created", issue };
  } finally {
    db.close();
  }
}

module.exports = { createManualIssue };
