const { DEFAULT_TRANSLATION_AI_PROVIDER } = require("../../../shared/translationModels");
const { hashText } = require("../support/hashText");

function contentTypeFor(item) {
  if (item.target_type === "comment") {
    return "comment";
  }

  return "issue";
}

function buildInstructions(contextBundle) {
  const instructions = [
    "Preserve code blocks, links, issue keys, IDs, commands, paths, and technical keys exactly.",
    "Translate only natural-language content that actually needs translation.",
    "If a segment is already fluent in the target language, keep it unchanged.",
  ];

  if (contextBundle && contextBundle.preservation_rules && contextBundle.preservation_rules.translate_japanese_only) {
    instructions.push("If the text is mixed-language, translate only the Japanese parts.");
  }

  if (contextBundle && contextBundle.glossary && contextBundle.glossary.length > 0) {
    instructions.push("When a glossary entry matches the source text, use exactly its target canonical term. Do not choose a source synonym's target variant or invent another term.");
  }

  if (contextBundle && contextBundle.translation_memory && contextBundle.translation_memory.length > 0) {
    instructions.push("Use translation memory as a consistency hint, but do not copy irrelevant phrases.");
  }

  return instructions;
}

function buildStandardTranslationInput({ item, issue, context_policy, context_bundle }) {
  const sourceHash = hashText(item.source_text);

  return {
    request_id: `trreq_${item.id}_${sourceHash.slice(0, 12)}`,
    queue_id: item.id,
    project_id: String(item.project_id),
    issue_id: item.issue_id,
    comment_id: item.comment_id || null,
    direction: {
      source_language: item.source_language || "ja",
      target_language: item.target_language || "vi",
    },
    target_type: item.target_type || "issue",
    content_type: contentTypeFor(item),
    source_text: item.source_text,
    source_text_hash: sourceHash,
    requested_ai_provider: item.provider || DEFAULT_TRANSLATION_AI_PROVIDER,
    requested_ai_transport: item.ai_transport || null,
    requested_ai_model: item.model_or_command || null,
    requested_provider: item.provider || DEFAULT_TRANSLATION_AI_PROVIDER,
    requested_model: item.model_or_command || null,
    context_policy: context_policy || "default_translation",
    context_bundle: context_bundle || {},
    instructions: buildInstructions(context_bundle),
    output_schema: {
      translated_text: "string",
      confidence: "number",
      warnings: ["string"],
      preserved_blocks: ["string"],
    },

    // Backward-compatible fields for existing adapter payloads.
    source_language: item.source_language || "ja",
    target_language: item.target_language || "vi",
    context: {
      project_id: String(item.project_id),
      issue_id: item.issue_id,
      backlog_issue_key: issue && issue.backlog_issue_key ? issue.backlog_issue_key : null,
      jira_issue_key: issue && issue.jira_issue_key ? issue.jira_issue_key : null,
      comment_id: item.comment_id || null,
    },
  };
}

module.exports = {
  buildStandardTranslationInput,
  contentTypeFor,
};
