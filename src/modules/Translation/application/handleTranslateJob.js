const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { buildStandardTranslationInput } = require("./buildStandardTranslationInput");
const { collectTranslationContext } = require("./collectTranslationContext");
const { maybeCreateLowConfidenceAnomaly } = require("./maybeCreateLowConfidenceAnomaly");
const { refreshTranslationAiConfigForQueueItem } = require("./refreshTranslationAiConfigForQueueItem");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");
const { translationAdapterFor } = require("./translationAdapterFor");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { hashText } = require("../support/hashText");

async function handleTranslateJob(job, { config }) {
  const queueId = job.payload_json && job.payload_json.translation_queue_id;
  if (!queueId) {
    throw new AppError({
      code: "TRANSLATE_PAYLOAD_INVALID",
      message: "translate job requires payload_json.translation_queue_id.",
      status: 422,
    });
  }

  const repository = createTranslationRepository({ config });
  let item = repository.findById(queueId);
  if (!item) {
    throw new AppError({
      code: "TRANSLATION_QUEUE_NOT_FOUND",
      message: "Translation queue item was not found.",
      status: 404,
    });
  }

  if (item.review_status === "approved" || item.review_status === "edited") {
    return {
      skipped: true,
      translation_queue_id: item.id,
      review_status: item.review_status,
    };
  }

  item = refreshTranslationAiConfigForQueueItem({ config, repository, item });

  const issue = CisApi.getIssueById({ config, issueId: item.issue_id });
  const context = collectTranslationContext({ config, item });
  const request = buildStandardTranslationInput({
    item,
    issue,
    context_policy: context.context_policy,
    context_bundle: context.context_bundle,
  });

  try {
    const adapter = translationAdapterFor({
      config,
      aiProvider: item.provider,
      aiTransport: item.ai_transport,
      modelOrCommand: item.model_or_command,
    });
    const result = await adapter.generateDraft(request);
    const updated = repository.markAiDraft(item.id, {
      ai_draft: result.translated_text,
      provider: result.provider || item.provider,
      model_or_command: result.model_or_command || item.model_or_command,
      provider_request_id: result.provider_request_id,
      confidence: result.confidence,
    });
    maybeCreateLowConfidenceAnomaly({
      config,
      item: updated,
      confidence: result.confidence,
    });
    syncIssueTranslationState({
      config,
      repository,
      issueId: item.issue_id,
      correlationId: job.correlation_id || null,
    });

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: job.id,
        project_id: item.project_id,
        issue_id: item.issue_id,
        comment_id: item.comment_id,
        direction_from: "cis",
        direction_to: "cis",
        job_type: "translate",
        action: "translation_ai_draft",
        status: "success",
        trigger: "ai",
        message: "Translation draft created.",
        details_json: {
          translation_queue_id: item.id,
          provider: updated.provider,
          model_or_command: updated.model_or_command,
          confidence: updated.confidence,
          context_policy: context.context_policy,
          neighbor_comments_count: request.context_bundle.neighbor_comments.length,
          translation_memory_count: request.context_bundle.translation_memory.length,
          glossary_count: request.context_bundle.glossary.length,
          signals: request.context_bundle.signals,
          context_bundle_hash: hashText(JSON.stringify(request.context_bundle || {})),
          source_hash: hashText(item.source_text),
          duration_ms: result.duration_ms,
          warnings: result.warnings || [],
          preserved_blocks: result.preserved_blocks,
        },
        attempt_count: job.attempt_count,
      },
    });

    return {
      translation_queue_id: updated.id,
      review_status: updated.review_status,
      provider: updated.provider,
      confidence: updated.confidence,
    };
  } catch (error) {
    repository.markProviderError(item.id, error.code || "TRANSLATION_PROVIDER_ERROR");
    error.retryable = error.retryable !== undefined ? Boolean(error.retryable) : true;
    throw error;
  }
}

module.exports = {
  handleTranslateJob,
};
