# Phase IE-01 - Canonical API

## Mục tiêu

Tạo API để Admin UI đọc/sửa canonical data của một CIS issue mà không ghi đè dữ liệu nguồn Backlog/Jira.

## API cần có

```text
GET   /api/v1/issues/:issueId/editor
PATCH /api/v1/issues/:issueId
GET   /api/v1/issues/:issueId/history
```

API chuẩn bị cho worklogs:

```text
GET   /api/v1/issues/:issueId/worklogs
```

`GET /worklogs` có thể làm tối thiểu hoặc deferred nếu chưa có bảng worklogs. Dù deferred endpoint này, `GET /editor` vẫn phải có `worklog_summary` rỗng để contract UI rõ ràng.

## Shape `GET /editor`

```json
{
  "data": {
    "issue": {
      "id": "issue_123",
      "project_id": 1,
      "backlog_issue_key": "BL-1",
      "jira_issue_key": "DMP-1",
      "sync_status": "update_pending",
      "updated_at": "2026-07-01T10:00:00.000Z"
    },
    "canonical": {
      "summary": { "value": "Login error", "source": "cis" },
      "description": { "value": "Plain text description", "source": "jira" },
      "issue_type": { "value": "Task", "source": "jira" },
      "priority": { "value": "Medium", "source": "cis" },
      "status": { "value": "To Do", "source": "cis" },
      "assignee": { "value": "user@example.test", "source": "cis" },
      "due_date": { "value": "2026-07-31", "source": "cis" }
    },
    "sources": {
      "summary": {
        "backlog": "ログイン画面でエラー",
        "cis": "Login error",
        "jira": "Login error"
      }
    },
    "assignee_meta": {
      "cis": { "jira_account_id": "account-id" },
      "jira": { "account_id": "account-id", "email": "user@example.test" }
    },
    "field_meta": {
      "profile": "jira_inspired",
      "editable_fields": ["summary", "description", "issue_type", "priority", "status", "assignee", "due_date"],
      "readonly_fields": ["reporter"],
      "catalogs": {
        "issue_type": ["Task", "Bug", "Story"],
        "priority": ["Highest", "High", "Medium", "Low", "Lowest"],
        "status": ["To Do", "In Progress", "Done"],
        "assignee": []
      },
      "field_types": {
        "summary": "string",
        "description": "text",
        "issue_type": "single_select",
        "priority": "single_select",
        "status": "single_select",
        "assignee": "user",
        "due_date": "date"
      }
    },
    "collections": {
      "worklog_summary": {
        "count": 0,
        "total_spent_seconds": 0,
        "sources": []
      }
    },
    "translation": {},
    "anomaly": {},
    "sync": {}
  }
}
```

Không trả `labels`, `components`, `fix_versions` trong `canonical`, `sources`, `field_meta.readonly_fields` hoặc `field_meta.field_types`.

## Effective canonical rule

Thứ tự đọc:

1. `fields_json.<field>.cis` nếu key tồn tại và value không phải `null`.
2. `fields_json.<field>.backlog` nếu có.
3. `fields_json.<field>.jira` nếu có.
4. Revision hiện tại nếu cần fallback.

`description` từ Jira phải là `plain_text`; raw ADF không được dùng làm value editor.

## PATCH payload

```json
{
  "summary": "Login error",
  "description": "Normalized plain text description",
  "issue_type": "Task",
  "priority": "High",
  "status": "To Do",
  "assignee": "user@example.test",
  "assignee_meta": {
    "jira_account_id": "account-id"
  },
  "due_date": "2026-07-31",
  "reason": "Chuẩn hóa trước khi sync Jira"
}
```

Rule:

- Auth bằng admin JWT.
- Chỉ nhận field trong allowlist.
- Reject `labels`, `components`, `fix_versions`, raw custom fields và các `*_meta` vô dụng.
- Cho phép `assignee_meta.jira_account_id` nếu đi cùng `assignee`.
- Validate `summary` non-empty sau trim.
- Validate `due_date` là `YYYY-MM-DD` hoặc chuỗi rỗng để clear canonical value.
- Validate option theo catalog nếu catalog tồn tại.
- Block nếu `sync_status` là `syncing` hoặc `archived`.
- Ghi thay đổi vào `fields_json.<field>.cis`.
- Ghi `assignee_meta.cis.jira_account_id` nếu payload có.
- Không sửa `fields_json.<field>.backlog` hoặc `fields_json.<field>.jira`.
- Cập nhật `issues.updated_at`.
- Chuyển `approved/synced` sang `update_pending`.
- Tạo revision manual khi cần.
- Ghi `sync_journal` action `issue_manual_edit_saved`.

## Worklog API

`GET /api/v1/issues/:issueId/worklogs` trả danh sách worklogs đã ingest hoặc synced.

Shape tối thiểu:

```json
{
  "data": {
    "issue_id": "issue_123",
    "items": [
      {
        "id": "wl_1",
        "source": "jira",
        "source_worklog_id": "10010",
        "author": "user@example.test",
        "started_at": "2026-07-01T09:00:00.000Z",
        "time_spent_seconds": 3600,
        "comment": "Investigation"
      }
    ],
    "summary": {
      "count": 1,
      "total_spent_seconds": 3600
    }
  }
}
```

Phase này chưa bắt buộc create/update worklog.

## Deliverables

- `getIssueEditor`.
- `updateCanonicalIssue`.
- `listIssueHistory` tối thiểu.
- `listIssueWorklogs` hoặc summary rỗng nếu chưa có storage.
- Helper resolve effective canonical field.
- Helper hash canonical issue.
- Journal manual edit có diff.
- Migration/rename `issues.status` sang `issues.sync_status` nếu code còn dùng tên cũ.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] `npm run verify:issue-editor:phase01` pass.
- [ ] `GET /editor` trả canonical value và source đúng.
- [ ] `GET /editor` không expose `labels/components/fix_versions`.
- [ ] `GET /editor` trả Jira description dạng `plain_text`.
- [ ] `GET /editor` cho phép `assignee_meta` tối thiểu.
- [ ] `PATCH` chỉ ghi `fields_json.*.cis`.
- [ ] `PATCH` không ghi đè source Backlog/Jira.
- [ ] `PATCH` reject field ngoài allowlist.
- [ ] `PATCH` reject meta vô dụng.
- [ ] `PATCH due_date` validate `YYYY-MM-DD`.
- [ ] `PATCH approved/synced` chuyển `update_pending`.
- [ ] `PATCH syncing/archived` bị block.
- [ ] Journal có diff, actor, reason, correlation id.

### Manual check (Người review)

- [ ] Gọi `GET /editor` với issue seed.
- [ ] PATCH summary/priority/due date và kiểm tra source không đổi.
- [ ] PATCH assignee kèm Jira account id và kiểm tra `assignee_meta.cis`.
- [ ] Gọi worklog endpoint hoặc thấy `worklog_summary` rỗng có chủ đích.
