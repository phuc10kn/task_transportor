const { createTranslationContextRepository } = require("../infrastructure/TranslationContextRepository");
const { createTranslationGlossaryRepository } = require("../infrastructure/TranslationGlossaryRepository");
const { detectTextSignals } = require("../support/detectTextSignals");

function normalizeLanguage(value, fallback) {
  const normalized = String(value === null || value === undefined ? "" : value)
    .trim()
    .toLowerCase();
  return normalized || fallback;
}

function truncate(value, maxLength) {
  const text = String(value || "");
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function buildPreservationRules(signals) {
  return {
    translate_japanese_only: signals.is_mixed_language,
    keep_target_language_segments: signals.contains_vietnamese,
    preserve_identifiers: signals.contains_many_identifiers || signals.contains_stack_trace,
    preserve_code_blocks: signals.contains_code_block,
    preserve_stack_traces: signals.contains_stack_trace,
  };
}

function prepareGlossaryForContext(glossary, sourceText, limit = 40) {
  const haystack = String(sourceText || "").toLowerCase();
  if (!haystack) {
    return [];
  }

  const candidates = [];
  for (const entry of Array.isArray(glossary) ? glossary : []) {
    const sourceKey = String(entry && (entry.source_term_match_key || entry.source) || "").trim().toLowerCase();
    if (!sourceKey) {
      continue;
    }
    let offset = haystack.indexOf(sourceKey);
    while (offset >= 0) {
      candidates.push({ entry, sourceKey, offset });
      offset = haystack.indexOf(sourceKey, offset + sourceKey.length);
    }
  }

  const selected = [];
  let cursor = 0;
  while (cursor < haystack.length) {
    const matches = candidates
      .filter((candidate) => candidate.offset >= cursor)
      .sort((left, right) => left.offset - right.offset
        || right.sourceKey.length - left.sourceKey.length
        || String(left.entry.concept_key || "").localeCompare(String(right.entry.concept_key || ""))
        || Number(left.entry.concept_id || 0) - Number(right.entry.concept_id || 0));
    if (matches.length === 0) {
      cursor += 1;
      continue;
    }
    selected.push(matches[0]);
    cursor = matches[0].offset + matches[0].sourceKey.length;
  }

  const unique = new Map();
  for (const candidate of selected) {
    const entry = candidate.entry;
    const key = `${entry.concept_id || entry.concept_key || entry.source}\u0000${entry.target_language || ""}`;
    const current = unique.get(key);
    if (!current || candidate.sourceKey.length > current.sourceKey.length || candidate.offset < current.offset) {
      unique.set(key, candidate);
    }
  }

  return [...unique.values()]
    .sort((left, right) => right.sourceKey.length - left.sourceKey.length
      || left.offset - right.offset
      || String(left.entry.group_key || "").localeCompare(String(right.entry.group_key || ""))
      || String(left.entry.concept_key || "").localeCompare(String(right.entry.concept_key || ""))
      || Number(left.entry.concept_id || 0) - Number(right.entry.concept_id || 0))
    .slice(0, limit)
    .map(({ entry }) => ({
      source: entry.source,
      target: entry.target,
      notes: entry.notes,
      group_key: entry.group_key,
      concept_key: entry.concept_key,
    }));
}

function collectTranslationContext({ config, item }) {
  const repository = createTranslationContextRepository({ config });
  const bundle = repository.getIssueBundle(item.issue_id);
  if (!bundle) {
    return {
      context_policy: "default_translation",
      context_bundle: {
        issue_keys: {
          backlog_issue_key: null,
          jira_issue_key: null,
        },
        project_profile: {},
        issue_context: {},
        neighbor_comments: [],
        translation_memory: [],
        glossary: [],
        preservation_rules: {},
        signals: detectTextSignals(item.source_text),
      },
    };
  }

  const signals = detectTextSignals(item.source_text);
  const revision = bundle.revision || null;
  const project = bundle.project || null;
  const sourceLanguage = normalizeLanguage(
    item.source_language || (project && project.source_language),
    "ja"
  );
  const targetLanguage = normalizeLanguage(
    item.target_language || (project && project.target_language),
    "vi"
  );
  const neighborComments = item.comment_id
    ? repository.listNeighborComments(item.issue_id, item.comment_id, { before: 3, after: 1 })
    : [];
  const translationMemory = repository
    .listRecentApprovedTranslations(item.project_id, { limit: 5, targetType: item.target_type })
    .filter((entry) => entry.id !== item.id)
    .map((entry) => ({
      source_text: truncate(entry.source_text, 300),
      reviewed_text: truncate(entry.ai_draft || "", 300),
      target_type: entry.target_type,
      review_status: entry.review_status,
    }));
  const glossary = prepareGlossaryForContext(
    createTranslationGlossaryRepository({ config }).listRuntimeTerms({
      projectId: item.project_id,
      sourceLanguage,
      targetLanguage,
    }),
    item.source_text
  );

  const contextPolicy = item.target_type === "comment" && signals.is_mixed_language
    ? "comment_mixed_language"
    : item.target_type === "comment"
      ? "high_context_comment"
      : "default_translation";

  return {
    context_policy: contextPolicy,
    context_bundle: {
      issue_keys: {
        backlog_issue_key: bundle.issue.backlog_issue_key || null,
        jira_issue_key: bundle.issue.jira_issue_key || null,
      },
      project_profile: {
        id: String(project && project.id ? project.id : item.project_id),
        name: project && project.name ? project.name : null,
        translation_ai_provider: project && project.translation_ai_provider
          ? project.translation_ai_provider
          : item.provider,
        translation_ai_transport: item.ai_transport ||
          (project && project.translation_ai_transport) ||
          null,
        translation_ai_model: item.model_or_command ||
          (project && project.translation_ai_model) ||
          (project && project.translation_model) ||
          null,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      },
      issue_context: {
        status: bundle.issue.status || null,
        source_system: bundle.issue.source_system || null,
        summary: revision && revision.summary ? truncate(revision.summary, 500) : null,
        description: revision && revision.description ? truncate(revision.description, 1200) : null,
        issue_type: revision && revision.issue_type ? revision.issue_type : null,
        priority: revision && revision.priority ? revision.priority : null,
      },
      neighbor_comments: neighborComments.map((comment) => ({
        id: comment.id,
        source_system: comment.source_system || null,
        author: comment.author_name || null,
        text: truncate(comment.content_original || "", 500),
        translated_text: truncate(comment.content_translated || "", 500),
        created_at_source: comment.created_at_source || null,
      })),
      translation_memory: translationMemory,
      glossary,
      preservation_rules: buildPreservationRules(signals),
      signals,
    },
  };
}

module.exports = {
  collectTranslationContext,
  prepareGlossaryForContext,
};
