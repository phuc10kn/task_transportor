function jiraUserField(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  return text.includes("@")
    ? { emailAddress: text }
    : { accountId: text };
}

function canonicalValue(canonical, field) {
  const entry = canonical && canonical[field];
  if (!entry) {
    return null;
  }

  return entry.value === undefined ? null : entry.value;
}

function maybeSet(fields, key, value) {
  if (value !== null && value !== undefined && value !== "") {
    fields[key] = value;
  }
}

const WEC1_STORY_POINT_FIELD_ID = "customfield_10038";

function jiraStoryPointFieldId(project, jiraIssueType) {
  let hostname = "";
  try {
    hostname = new URL(project && project.jira_site_url || "https://invalid.local").hostname.toLowerCase();
  } catch (error) {
    hostname = "";
  }
  return hostname === "10kn-developer.atlassian.net"
    && String(project && project.jira_project_key || "").toUpperCase() === "WEC1"
    && String(jiraIssueType || "").toLowerCase() === "task"
    ? WEC1_STORY_POINT_FIELD_ID
    : null;
}

function buildJiraPayload({ issue, project, canonical, mapped, assigneeAccountId }) {
  const fields = {
    project: { key: project.jira_project_key || null },
    issuetype: { name: mapped.issue_type && mapped.issue_type.jira_value },
    summary: String(canonicalValue(canonical, "summary") || "").trim(),
    description: String(canonicalValue(canonical, "description") || ""),
    priority: { name: mapped.priority && mapped.priority.jira_value },
  };

  const dueDate = canonicalValue(canonical, "due_date");
  maybeSet(fields, "duedate", dueDate);
  const storyPointFieldId = jiraStoryPointFieldId(
    project,
    mapped.issue_type && mapped.issue_type.jira_value
  );
  const storyPoint = Number(canonicalValue(canonical, "story_point"));
  if (storyPointFieldId && Number.isFinite(storyPoint) && storyPoint >= 0) {
    fields[storyPointFieldId] = storyPoint;
  }

  if (assigneeAccountId) {
    fields.assignee = { accountId: assigneeAccountId };
  } else if (mapped.assignee && mapped.assignee.jira_value) {
    fields.assignee = jiraUserField(mapped.assignee.jira_value);
  }

  if (mapped.reporter && mapped.reporter.jira_value) {
    fields.reporter = jiraUserField(mapped.reporter.jira_value);
  }

  return {
    operation: issue.jira_issue_key ? "update" : "create",
    jira_issue_key: issue.jira_issue_key || null,
    fields,
    transition_preview: mapped.status && mapped.status.jira_value
      ? { status: mapped.status.jira_value }
      : null,
  };
}

module.exports = {
  buildJiraPayload,
  jiraStoryPointFieldId,
  jiraUserField,
  WEC1_STORY_POINT_FIELD_ID,
};
