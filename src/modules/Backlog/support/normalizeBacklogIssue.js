const { hashPayload } = require("./hashPayload");

function nameOf(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.mailAddress || value.emailAddress || value.email || value.name || value.displayName || null;
}

function normalizeComment(comment) {
  const id = comment.id || comment.commentId || comment.backlog_comment_id;

  return {
    backlog_comment_id: String(id),
    content_original: comment.content || comment.content_original || "",
    author_name: nameOf(comment.createdUser || comment.author),
    created_at_source: comment.created || comment.created_at || null,
  };
}

function normalizeAttachment(attachment) {
  const id = attachment.id || attachment.attachmentId || attachment.backlog_attachment_id;

  return {
    backlog_attachment_id: String(id),
    original_filename: attachment.name || attachment.filename || attachment.original_filename,
    mime_type: attachment.mimeType || attachment.mime_type || null,
    size_bytes: attachment.size || attachment.size_bytes || null,
    created_at_source: attachment.created || attachment.created_at || null,
  };
}

function normalizeBacklogIssue({ project, issue, comments = [], attachments = [] }) {
  const issueKey = issue.issueKey || issue.key || issue.backlog_issue_key;
  const summary = issue.summary || "";
  const description = issue.description || "";
  const normalizedComments = (comments || []).map(normalizeComment).filter((comment) => comment.backlog_comment_id);
  const normalizedAttachments = (attachments || [])
    .map(normalizeAttachment)
    .filter((attachment) => attachment.backlog_attachment_id && attachment.original_filename);

  const fieldsJson = {
    summary: { backlog: summary },
    description: { backlog: description },
    issue_type: { backlog: nameOf(issue.issueType) },
    status: { backlog: nameOf(issue.status) },
    priority: { backlog: nameOf(issue.priority) },
    assignee: { backlog: nameOf(issue.assignee) },
  };

  const contentForHash = {
    issueKey,
    summary,
    description,
    issue_type: fieldsJson.issue_type.backlog,
    priority: fieldsJson.priority.backlog,
    assignee: fieldsJson.assignee.backlog,
    updated: issue.updated || issue.updated_at || null,
    comments: normalizedComments,
    attachments: normalizedAttachments,
  };

  return {
    project_id: project.id,
    backlog_issue_key: issueKey,
    backlog_project_key: issue.projectKey || issue.project && issue.project.projectKey || project.backlog_project_key,
    summary,
    description,
    issue_type: fieldsJson.issue_type.backlog,
    status_name: fieldsJson.status.backlog,
    priority: fieldsJson.priority.backlog,
    assignee: fieldsJson.assignee.backlog,
    backlog_updated_at: issue.updated || issue.updated_at || null,
    fields_json: fieldsJson,
    comments: normalizedComments,
    attachments: normalizedAttachments,
    payload_hash: hashPayload(contentForHash),
    source_language: project.source_language || "ja",
    target_language: project.target_language || "vi",
    translation_provider: project.translation_provider || "codex_exec",
    translation_model: project.translation_model,
    translation_command_profile: project.translation_command_profile,
  };
}

module.exports = {
  normalizeBacklogIssue,
};
