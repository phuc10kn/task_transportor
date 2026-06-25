# Deepdive: `src/mapper.js` — Backlog → Jira Payload Builder

## Vai trò

Mapper là nơi diễn ra phép thuật chính — chuyển đổi một Backlog issue thành Jira issue payload, sẵn sàng để gửi lên Jira API.

## Public API

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `mapBacklogIssueToJira(issue, project)` | Backlog issue + ProjectConfig | `{ok, payload}` hoặc `{ok, errors}` | Build Jira payload sau khi guardrails pass |

## Flow chi tiết

```
mapBacklogIssueToJira(issue, project)
    │
    ├── 1. validateBacklogIssueForProject(issue, project)
    │       └── Nếu có errors → return { ok: false, errors }
    │
    └── 2. Build payload:
            ├── project_key: project.jira.projectKey
            │
            ├── issue_type: Xác định từ mapping
            │   ├── Nếu issue.issueType có trong mapping → dùng mapped value
            │   └── Nếu không → dùng project.jira.defaultIssueType
            │
            ├── summary: buildSummary(issue, project)
            │   ├── Nếu rules.requireBacklogKeyInSummary == true
            │   │   └── "[{issueKey}] {summary}"
            │   └── Cắt tại rules.maxSummaryLength characters
            │
            ├── description: buildDescription(issue, project)
            │   ├── Dòng 1: "Backlog issue: {issueKey}"
            │   ├── Dòng 2: "Backlog project: {projectKey}"
            │   ├── Nếu rules.requireBacklogUrlInDescription == true
            │   │   └── Dòng 3: "Backlog URL: https://{space}.backlog.com/view/{issueKey}"
            │   ├── Dòng trống
            │   └── "Original description:\n{issue.description}"
            │
            ├── labels: [jira.labels] (nếu có)
            │   └── ["backlog-migrated", ...]
            │
            ├── priority: priorityMap[issue.priority] (nếu có mapping)
            │
            └── metadata: Object để tracking
                ├── source: "backlog"
                ├── backlog_issue_key: issue.issueKey
                ├── backlog_project_key: issue.projectKey
                ├── backlog_status: issue.status
                ├── mapped_jira_status: statusMap[issue.status]
                └── project_config_id: project.id
```

## Builders chi tiết

### `buildSummary(issue, project)`
```
Input: issue = { issueKey: "EXAMPLE-123", summary: "Fix login bug" }
       project.rules.requireBacklogKeyInSummary = true
       project.rules.maxSummaryLength = 255

Output: "[EXAMPLE-123] Fix login bug"
         (bị truncate nếu > 255 chars)
```

### `buildDescription(issue, project)`
```
Input: issue = { issueKey: "EXAMPLE-123", projectKey: "EXAMPLE",
                 description: "User cannot login..." }
       project.rules.requireBacklogUrlInDescription = true
       project.backlog.spaceKey = "example"

Output: "Backlog issue: EXAMPLE-123
Backlog project: EXAMPLE
Backlog URL: https://example.backlog.com/view/EXAMPLE-123

Original description:
User cannot login..."
```

## Jira payload mẫu

```json
{
  "project_key": "EXJ",
  "issue_type": "Bug",
  "summary": "[EXAMPLE-123] Fix login bug",
  "description": "Backlog issue: EXAMPLE-123\nBacklog project: EXAMPLE\nBacklog URL: https://example.backlog.com/view/EXAMPLE-123\n\nOriginal description:\nUser cannot login with valid credentials",
  "labels": ["backlog-migrated", "example"],
  "priority": "High",
  "metadata": {
    "source": "backlog",
    "backlog_issue_key": "EXAMPLE-123",
    "backlog_project_key": "EXAMPLE",
    "backlog_status": "Open",
    "mapped_jira_status": "To Do",
    "project_config_id": "example"
  }
}
```

## Thiết kế

- **Non-destructive**: Không sửa đổi issue gốc, luôn build payload mới
- **Safety first**: Guardrails luôn chạy trước khi build payload
- **Traceable**: Mọi payload đều chứa metadata để biết nguồn gốc từ Backlog
- **Resilient**: Fallback `defaultIssueType` nếu type mapping không có — không fail cứng
