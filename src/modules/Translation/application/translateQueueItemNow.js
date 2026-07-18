const { AppError } = require("../../../http/errors/AppError");
const CisApi = require("../../Cis/CisApi");
const SyncApi = require("../../Sync/SyncApi");
const { buildStandardTranslationInput } = require("./buildStandardTranslationInput");
const { collectTranslationContext } = require("./collectTranslationContext");
const { maybeCreateLowConfidenceAnomaly } = require("./maybeCreateLowConfidenceAnomaly");
const { refreshTranslationAiConfigForQueueItem } = require("./refreshTranslationAiConfigForQueueItem");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");
const { createConfiguredTranslationAdapter } = require("../infrastructure/translationAdapterFor");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { hashText } = require("../support/hashText");

function translatedText(config, item, issue, text) {
  if (item.comment_id || item.target_type !== "issue") return text;
  if (item.target_field === "summary") return CisApi.normalizeCanonicalSummary({ issue, summary: text });
  if (item.target_field === "description") return CisApi.normalizeCanonicalDescription({ config, issue, description: text });
  return text;
}

async function translateWithImmediateRetry({ config, item, request, maxAttempts }) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return {
        attempt,
        result: await createConfiguredTranslationAdapter({
          config,
          aiProvider: item.provider,
          aiTransport: item.ai_transport,
          modelOrCommand: item.model_or_command,
        }).generateDraft(request),
      };
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt >= maxAttempts) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function translateQueueItemNow({
  config,
  queueId,
  executedBy,
  correlationId,
  syncJobId,
  attemptCount = 0,
  trigger = "manual",
  maxImmediateAttempts = 2,
}) {
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
    const { attempt, result } = await translateWithImmediateRetry({
      config,
      item,
      request,
      maxAttempts: maxImmediateAttempts,
    });
    const updated = repository.markAiDraft(item.id, {
      ai_draft: translatedText(config, item, issue, result.translated_text),
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
      correlationId,
    });

    SyncApi.writeJournal({
      config,
      input: {
        sync_job_id: syncJobId || null,
        project_id: item.project_id,
        issue_id: item.issue_id,
        comment_id: item.comment_id,
        direction_from: "cis",
        direction_to: "cis",
        job_type: "translate",
        action: "translation_ai_draft",
        status: "success",
        trigger,
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
          immediate_attempt: attempt,
          warnings: result.warnings || [],
          preserved_blocks: result.preserved_blocks,
        },
        attempt_count: attemptCount,
        executed_by: executedBy,
        correlation_id: correlationId,
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
  createConfiguredTranslationAdapter,
  translateQueueItemNow,
};
