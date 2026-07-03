const { createTranslationContextRepository } = require("../infrastructure/TranslationContextRepository");
const { detectTextSignals } = require("../support/detectTextSignals");

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

function selectGlossary(glossary, sourceText, revision) {
  const terms = Array.isArray(glossary) ? glossary : [];
  if (terms.length <= 20) {
    return terms;
  }

  const haystack = [
    String(sourceText || ""),
    revision && revision.summary ? revision.summary : "",
    revision && revision.description ? revision.description : "",
  ]
    .join("\n")
    .toLowerCase();

  const matched = terms.filter((entry) => haystack.includes(String(entry.source || "").toLowerCase()));
  if (matched.length > 0) {
    return matched.slice(0, 20);
  }

  return terms.slice(0, 20);
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
  const neighborComments = item.comment_id
    ? repository.listNeighborComments(item.issue_id, item.comment_id, { before: 3, after: 1 })
    : [];
  const translationMemory = repository
    .listRecentApprovedTranslations(item.project_id, { limit: 5, targetType: item.target_type })
    .filter((entry) => entry.id !== item.id)
    .map((entry) => ({
      source_text: truncate(entry.source_text, 300),
      reviewed_text: truncate(entry.reviewed_text || entry.ai_draft || "", 300),
      target_type: entry.target_type,
      review_status: entry.review_status,
    }));
  const glossary = selectGlossary(
    project && Array.isArray(project.translation_glossary_json) ? project.translation_glossary_json : [],
    item.source_text,
    revision
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
        source_language: item.source_language || (project && project.source_language) || "ja",
        target_language: item.target_language || (project && project.target_language) || "vi",
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
};
