function backlogIssuePullDedupeKey({ projectId, backlogIssueKey, trigger = "manual" }) {
  return `backlog:${trigger}:issue:${projectId}:${String(backlogIssueKey).toUpperCase()}`;
}

module.exports = {
  backlogIssuePullDedupeKey,
};
