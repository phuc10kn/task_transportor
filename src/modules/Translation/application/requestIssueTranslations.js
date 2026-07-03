const { translateQueueItemNow } = require("./translateQueueItemNow");
const CisApi = require("../../Cis/CisApi");
const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const { syncIssueTranslationState } = require("./syncIssueTranslationState");

function normalizeSource(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function issueTranslationItems(items) {
  return items.filter((item) => item.target_type === "issue" && !item.comment_id);
}

function inferTargetField(item, targets, index, total) {
  if (item.target_field) {
    return item.target_field;
  }

  const sourceText = normalizeSource(item.source_text);
  const target = targets.find((entry) => normalizeSource(entry.value) === sourceText);
  if (target) {
    return target.field;
  }

  if (sourceText.includes("\n") || sourceText.length > 120) {
    return "description";
  }

  if (total > 1) {
    return index === 0 ? "summary" : "description";
  }

  return null;
}

function translationTimeKey(item) {
  return item.updated_at || item.created_at || "";
}

function latestTranslationItem(items) {
  return items
    .slice()
    .sort((left, right) => {
      const timeCompare = translationTimeKey(left).localeCompare(translationTimeKey(right));
      if (timeCompare !== 0) {
        return timeCompare;
      }

      return Number(left.id || 0) - Number(right.id || 0);
    })
    .pop() || null;
}

function decorateTranslations(items, targets) {
  const issueItems = issueTranslationItems(items);
  const decorated = issueItems.map((item, index) => {
    const targetField = inferTargetField(item, targets, index, issueItems.length);
    const target = targets.find((entry) => entry.field === targetField);
    const currentSource = normalizeSource(target && target.value);
    const originalSource = normalizeSource(item.source_text);
    const isCurrentQueueSource = Boolean(currentSource && originalSource === currentSource);
    const isSourceStale = Boolean(originalSource && !isCurrentQueueSource);

    return {
      ...item,
      target_field: targetField,
      source_text_original: item.source_text,
      source_text: currentSource,
      current_source_text: currentSource,
      reviewed_text: isSourceStale ? "" : item.reviewed_text,
      ai_draft: isSourceStale ? "" : item.ai_draft,
      is_source_stale: isSourceStale,
    };
  });

  const picked = [];
  for (const target of targets) {
    const currentSource = normalizeSource(target.value);
    const candidates = decorated.filter((item) => item.target_field === target.field);
    if (!candidates.length) {
      continue;
    }

    const currentMatches = candidates.filter((item) => normalizeSource(item.source_text_original) === currentSource);
    const latestCurrentMatch = latestTranslationItem(currentMatches);
    picked.push(latestCurrentMatch || latestTranslationItem(candidates));
  }

  return [
    ...picked,
    ...decorated.filter((item) => !item.target_field),
  ];
}

function shouldTranslate(item) {
  return !["approved", "edited"].includes(item.review_status) && !item.ai_draft;
}

async function requestIssueTranslations({ config, issueId, executedBy, correlationId }) {
  const repository = createTranslationRepository({ config });
  const bundle = CisApi.getIssueTranslationTargets({ config, issueId });
  const issue = bundle.issue;
  const targets = bundle.targets;
  const existingItems = bundle.translations;
  const items = issueTranslationItems(existingItems);
  const decoratedItems = decorateTranslations(items, targets);
  const created = [];

  for (const target of targets) {
    const currentSource = normalizeSource(target.value);
    const existing = decoratedItems.find((item) =>
      item.target_field === target.field &&
      (
        normalizeSource(item.source_text_original) === currentSource ||
        (
          ["approved", "edited"].includes(item.review_status) &&
          normalizeSource(item.reviewed_text || item.ai_draft) === currentSource
        )
      )
    );
    if (existing) {
      continue;
    }

    const item = CisApi.createTranslationQueueItem({
      config,
      input: {
        project_id: issue.project_id,
        issue_id: issue.id,
        target_type: "issue",
        target_field: target.field,
        source_text: String(target.value),
      },
    });
    created.push({ ...item, target_field: target.field, field: target.field });
    items.push(item);
    decoratedItems.push({
      ...item,
      target_field: target.field,
      source_text_original: item.source_text,
      current_source_text: item.source_text,
      is_source_stale: false,
    });
  }

  if (created.length > 0) {
    syncIssueTranslationState({
      config,
      repository,
      issueId: issue.id,
      correlationId,
    });
  }

  const translated = [];
  for (const item of decoratedItems
    .filter((item) => normalizeSource(item.current_source_text))
    .filter((item) => !item.is_source_stale)
    .filter(shouldTranslate)) {
    translated.push(await translateQueueItemNow({
      config,
      queueId: item.id,
      executedBy: executedBy || null,
      correlationId: correlationId || null,
      trigger: "manual",
    }));
  }

  syncIssueTranslationState({
    config,
    repository,
    issueId: issue.id,
    correlationId,
  });

  const refreshed = CisApi.getIssueTranslationTargets({ config, issueId: issue.id });
  return {
    issue_id: issue.id,
    created_items: created,
    queued_jobs: [],
    translated_items: translated,
    translations: decorateTranslations(refreshed.translations, targets),
  };
}

module.exports = {
  requestIssueTranslations,
};
