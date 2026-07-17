const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function currentIssueSource(config, item) {
  if (item.comment_id || item.target_type !== "issue" || !item.target_field) return null;
  return CisApi.getIssueTranslationTargets({ config, issueId: item.issue_id }).target_map[item.target_field] || null;
}

function normalizedDraft(config, item, draftText) {
  if (item.comment_id || item.target_type !== "issue" || item.target_field !== "description") return draftText;
  const issue = CisApi.getIssueById({ config, issueId: item.issue_id });
  return CisApi.normalizeCanonicalDescription({ config, issue, description: draftText });
}

function saveTranslationDraft({ config, queueId, draftText, editedBy, reviewNotes, correlationId }) {
  if (typeof draftText !== "string" || !draftText.trim()) {
    throw new AppError({
      code: "TRANSLATION_DRAFT_TEXT_REQUIRED",
      message: "draft_text is required.",
      status: 422,
    });
  }

  const repository = createTranslationRepository({ config });
  const existing = repository.findById(queueId);
  if (!existing) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  const item = repository.saveDraft(queueId, {
    draft_text: normalizedDraft(config, existing, draftText),
    source_text: currentIssueSource(config, existing),
    review_notes: reviewNotes,
  });

  syncIssueTranslationState({ config, repository, issueId: item.issue_id, correlationId });
  SyncApi.writeJournal({
    config,
    input: {
      project_id: item.project_id,
      issue_id: item.issue_id,
      comment_id: item.comment_id,
      direction_from: "cis",
      direction_to: "cis",
      job_type: "translate",
      action: "translation_draft_saved",
      status: "success",
      trigger: "manual",
      message: "Translation draft saved without applying canonical state.",
      details_json: { translation_queue_id: item.id },
      executed_by: editedBy,
      correlation_id: correlationId,
    },
  });

  return item;
}

module.exports = { saveTranslationDraft };
