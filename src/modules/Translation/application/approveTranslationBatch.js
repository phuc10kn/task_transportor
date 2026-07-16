const { AppError } = require("../../../http/errors/AppError");
const { createConnection } = require("../../../infrastructure/database/connection");
const { runImmediateTransaction } = require("../../../infrastructure/database/transaction");
const CisApi = require("../../Cis/CisApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

const SUPPORTED_FIELDS = new Set(["summary", "description"]);

function batchError(code, message, details = {}) {
  return new AppError({ code, message, status: 422, details });
}

function approveTranslationBatch({ config, queueIds, reviewedBy, correlationId, parentSyncJobId }) {
  const ids = [...new Set((queueIds || []).map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
  if (ids.length === 0) throw batchError("TRANSLATION_BATCH_REQUIRED", "Translation batch is empty.");

  const db = createConnection({ config });
  let result;
  try {
    result = runImmediateTransaction(db, () => {
      const repository = createTranslationRepository({ config, db });
      const items = ids.map((id) => repository.findById(id));
      if (items.some((item) => !item)) throw batchError("TRANSLATION_BATCH_INCOMPLETE", "Translation batch item was not found.", { queue_ids: ids });
      const issueIds = new Set(items.map((item) => item.issue_id));
      const fields = new Set(items.map((item) => item.target_field));
      if (issueIds.size !== 1 || fields.size !== items.length || items.some((item) => item.comment_id || item.target_type !== "issue" || !SUPPORTED_FIELDS.has(item.target_field))) {
        throw batchError("TRANSLATION_BATCH_INVALID", "Translation batch must contain unique issue summary/description items from one issue.");
      }
      if (items.some((item) => !String(item.ai_draft || "").trim())) {
        throw batchError("TRANSLATION_BATCH_INCOMPLETE", "Every translation batch item requires an AI draft.", { queue_ids: ids });
      }

      const bundle = CisApi.getIssueTranslationTargets({ config, issueId: items[0].issue_id, db });
      const stale = items.filter((item) => String(bundle.target_map[item.target_field] || "").trim() !== String(item.source_text || "").trim());
      if (stale.length > 0) {
        throw new AppError({
          code: "TRANSLATION_SOURCE_STALE",
          message: "Translation source changed before batch approval.",
          status: 409,
          details: { queue_ids: stale.map((item) => item.id) },
        });
      }

      const payload = Object.fromEntries(items.map((item) => [item.target_field, item.ai_draft]));
      payload.reason = "Apply auto-approved translation batch for Jira delivery.";
      const canonical = CisApi.updateCanonicalIssue({
        config,
        db,
        issueId: items[0].issue_id,
        payload,
        executedBy: reviewedBy || null,
        correlationId,
        audit: {
          job_type: "sync_translate_jira",
          action: "translation_batch_auto_approved",
          trigger: "auto",
          message: "Translation batch auto-approved for Jira delivery.",
          details_json: { queue_ids: ids, parent_sync_job_id: parentSyncJobId || null },
        },
      });
      const approved = repository.approveBatchInTransaction(ids, {
        reviewed_by: reviewedBy || null,
        review_notes: "Auto-approved by Sync + Translate + Jira action.",
      });
      if (approved.length !== ids.length) throw batchError("TRANSLATION_BATCH_INCOMPLETE", "Translation batch approval was incomplete.");
      return { issue_id: items[0].issue_id, items: approved, canonical };
    });
  } finally {
    db.close();
  }

  syncIssueTranslationState({
    config,
    repository: createTranslationRepository({ config }),
    issueId: result.issue_id,
    correlationId,
  });
  return result;
}

module.exports = { approveTranslationBatch };
