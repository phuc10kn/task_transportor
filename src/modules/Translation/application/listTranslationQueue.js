const { createTranslationRepository } = require("../infrastructure/TranslationRepository");
const CisApi = require("../../Cis/CisApi");

function systemIssueIdentity(issue) {
  if (issue.source_system === "backlog" && issue.backlog_issue_key) {
    return { source_system: "backlog", system_issue_key: issue.backlog_issue_key };
  }
  if (issue.source_system === "jira" && issue.jira_issue_key) {
    return { source_system: "jira", system_issue_key: issue.jira_issue_key };
  }
  if (issue.backlog_issue_key) {
    return { source_system: "backlog", system_issue_key: issue.backlog_issue_key };
  }
  if (issue.jira_issue_key) {
    return { source_system: "jira", system_issue_key: issue.jira_issue_key };
  }
  return { source_system: "cis", system_issue_key: issue.id };
}

function listTranslationQueue({ config, filters = {} }) {
  const bundles = new Map();
  return createTranslationRepository({ config }).list(filters).map((item) => {
    if (!bundles.has(item.issue_id)) {
      bundles.set(item.issue_id, CisApi.getIssueTranslationTargets({ config, issueId: item.issue_id }));
    }
    const bundle = bundles.get(item.issue_id);
    const currentSource = item.target_type === "issue" && !item.comment_id && item.target_field
      ? bundle.target_map[item.target_field] || null
      : null;
    const isSourceStale = currentSource != null
      && String(currentSource).trim() !== String(item.source_text || "").trim();
    return {
      ...item,
      ...systemIssueIdentity(bundle.issue),
      source_text_original: item.source_text,
      source_text: currentSource || item.source_text,
      current_source_text: currentSource,
      reviewed_text: undefined,
      is_source_stale: isSourceStale,
    };
  });
}

module.exports = {
  listTranslationQueue,
};
