# CIS main fields analysis from Jira Task

File này phân tích Jira Task sample trong:

- `jira-task-response-sample.json`
- `jira-task-response-raw-sample.json`

Mục tiêu là chốt field chính của CIS cho Issue Editor. Đây không phải spec ingest Jira đầy đủ.

## Kết luận nhanh

Issue Editor v1 dùng profile `jira_inspired`, nhưng chỉ giữ các field thực sự cần cho canonical issue và outbound Jira cơ bản.

Editable canonical fields:

| CIS field | Jira inspiration | Vai trò | Edit v1 |
| --- | --- | --- | --- |
| `summary` | `summary` | Tiêu đề issue | Có |
| `description` | `description` | Nội dung issue dạng plain text | Có |
| `issue_type` | `issuetype.name` | Loại issue | Có |
| `status` | `status.name` | Business status của ticket | Có |
| `priority` | `priority.name` | Độ ưu tiên | Có |
| `assignee` | `assignee.accountId/emailAddress` | Người xử lý | Có |
| `due_date` | `duedate` | Ngày hạn | Có |

Read-only context:

| CIS field | Jira inspiration | Vai trò |
| --- | --- | --- |
| `reporter` | `reporter.accountId/emailAddress` | Người báo cáo/source context |

Collections riêng:

| Collection | Jira inspiration | Vai trò v1 |
| --- | --- | --- |
| `comments` | `comment` | Bảng/flow riêng |
| `attachments` | `attachment` | Bảng/flow riêng |
| `worklogs` | `worklog` | Collection read-only hoặc flow riêng |

## Không đưa vào Issue Editor v1

- `labels`
- `components`
- `fixVersions` / `fix_versions`
- `versions`
- `customfield_*`
- `progress`, `aggregateprogress`
- `timetracking`, `timeestimate`, `timeoriginalestimate`, `timespent`
- `votes`, `watches`
- `resolution`, `resolutiondate`
- `environment`
- `issuerestriction`, `security`

Lý do:

- Không cần cho canonical editor tối thiểu.
- Nhiều field là calculated/read-only hoặc phụ thuộc Jira project template.
- `labels` dễ trộn user label với system trace label.
- `components` là module/phân vùng project, chưa cần route/sync theo module.
- `fixVersions` là release planning, chưa thuộc workflow Lite v1.
- Custom field cần catalog riêng, không hard-code từ một sample.

## Meta policy

Không contract các meta phụ vô dụng trong `fields_json`, ví dụ:

- `issue_type_meta`
- `status_meta`
- `priority_meta`
- `description_meta`

Ngoại lệ:

- `assignee_meta` được giữ tối thiểu để assign/update sang Jira bằng `accountId`.

Không lưu display name, avatar hoặc self URL như canonical contract.

## Core identity/state

Các field này nằm ở `issues`, không nằm trong `fields_json`:

| CIS | Jira source tham khảo | Ghi chú |
| --- | --- | --- |
| `issues.id` | không lấy từ Jira | ID nội bộ CIS |
| `issues.project_id` | `project.key/id` qua config mapping | Project nội bộ |
| `issues.backlog_issue_key` | trace từ source Backlog | Định danh Backlog nếu có |
| `issues.jira_issue_key` | `key` | Định danh Jira linked |
| `issues.source_system` | source ingest ban đầu | Nguồn tạo issue |
| `issues.sync_status` | không phải `status.name` | Lifecycle/sync state của CIS |
| `issues.current_revision` | không lấy từ Jira | Revision hiện tại |
| `issues.last_synced_at` | sync result | Audit sync |
| `issues.created_at/updated_at` | CIS timestamp | Timestamp nội bộ |

Quan trọng:

- `issues.sync_status` khác `fields_json.status.cis`.
- Jira `status.name = Done` là business field.
- CIS `sync_status = synced/update_pending/...` là workflow state nội bộ.

## Field details

### `summary`

```json
{
  "summary": {
    "backlog": "ログイン画面でエラー",
    "cis": "Login error",
    "jira": "Login error"
  }
}
```

Rule:

- Edit v1: có.
- Validate non-empty sau trim.
- Revision: có.
- Dry-run/sync: dùng effective canonical value.

### `description`

Jira Cloud dùng ADF cho `description`, nhưng CIS editor chỉ dùng `plain_text`.

```json
{
  "description": {
    "backlog": "Original text",
    "cis": "Canonical plain text",
    "jira": "Plain text extracted from Jira ADF"
  },
  "description_format": {
    "backlog": "plain_text",
    "cis": "plain_text",
    "jira": "plain_text"
  }
}
```

Rule:

- Edit v1: có.
- Revision: có.
- Jira inbound/reference phải convert ADF sang plain text trước khi lưu/hiển thị.
- Jira outbound adapter convert plain text sang ADF.
- Không lưu `description_meta` trong Issue Editor contract.

### `issue_type`

```json
{
  "issue_type": {
    "backlog": "Bug",
    "cis": "Task",
    "jira": "Task"
  }
}
```

Rule:

- Edit v1: có.
- Revision: có.
- Catalog lấy từ Jira project issue types nếu có; fallback config Lite.
- Không lưu `issue_type_meta`.

### `status`

```json
{
  "status": {
    "backlog": "Open",
    "cis": "To Do",
    "jira": "Done"
  }
}
```

Rule:

- Edit v1: có.
- Đây là business status, không phải `issues.sync_status`.
- Outbound Jira có thể cần transition nếu target status khác hiện tại.
- Không lưu `status_meta`.

### `priority`

```json
{
  "priority": {
    "backlog": "High",
    "cis": "Medium",
    "jira": "Medium"
  }
}
```

Rule:

- Edit v1: có.
- Revision: có nếu schema hỗ trợ.
- Catalog lấy từ Jira priorities nếu có.
- Không lưu `priority_meta`.

### `assignee`

```json
{
  "assignee": {
    "backlog": "tanaka@example.test",
    "cis": "user@example.test",
    "jira": "account-id"
  },
  "assignee_meta": {
    "cis": {
      "jira_account_id": "account-id"
    },
    "jira": {
      "account_id": "account-id",
      "email": "user@example.test"
    }
  }
}
```

Rule:

- Edit v1: có.
- Revision: có nếu schema hỗ trợ.
- Canonical value ưu tiên email hoặc stable user key.
- `assignee_meta.cis.jira_account_id` dùng để update Jira assignee.
- Nếu chưa có account id, adapter resolve từ canonical value.
- Không lưu display name/avatar/self URL như contract.

### `due_date`

```json
{
  "due_date": {
    "backlog": null,
    "cis": "2026-07-31",
    "jira": "2026-07-31"
  }
}
```

Rule:

- Edit v1: có.
- Validate `YYYY-MM-DD` hoặc chuỗi rỗng để clear canonical value.
- Không bắt buộc revision nếu `issue_revisions` chưa có cột `due_date`.
- Audit bằng journal diff.
- Dry-run/sync map sang Jira `duedate`.

### `reporter`

```json
{
  "reporter": {
    "jira": "account-id"
  }
}
```

Rule:

- Read-only v1.
- Dùng làm source/audit context.
- Chưa edit vì Jira reporter thường bị giới hạn bởi permission/config.

## Worklogs

Worklogs là collection riêng, không nằm trong canonical issue form.

Shape tham khảo nếu có storage:

```json
{
  "worklogs": [
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
  "worklog_summary": {
    "count": 1,
    "total_spent_seconds": 3600,
    "sources": ["jira"]
  }
}
```

Rule:

- Issue Editor v1 chỉ hiển thị read-only hoặc summary.
- Không PATCH qua canonical issue endpoint.
- Không đưa vào `canonical_hash` của issue payload v1.
- Nếu sync worklog sang Jira sau này, tạo dry-run/sync riêng cho worklogs.

## Shape `fields_json` đề xuất

```json
{
  "summary": {
    "backlog": "ログイン画面でエラー",
    "cis": "Login error",
    "jira": "Login error"
  },
  "description": {
    "backlog": "Original text",
    "cis": "Canonical plain text",
    "jira": "Plain text extracted from Jira ADF"
  },
  "description_format": {
    "backlog": "plain_text",
    "cis": "plain_text",
    "jira": "plain_text"
  },
  "issue_type": {
    "backlog": "Bug",
    "cis": "Task",
    "jira": "Task"
  },
  "status": {
    "backlog": "Open",
    "cis": "To Do",
    "jira": "Done"
  },
  "priority": {
    "backlog": "High",
    "cis": "Medium",
    "jira": "Medium"
  },
  "assignee": {
    "backlog": "tanaka@example.test",
    "cis": "user@example.test",
    "jira": "account-id"
  },
  "assignee_meta": {
    "cis": {
      "jira_account_id": "account-id"
    },
    "jira": {
      "account_id": "account-id",
      "email": "user@example.test"
    }
  },
  "reporter": {
    "jira": "account-id"
  },
  "due_date": {
    "backlog": null,
    "cis": "2026-07-31",
    "jira": null
  }
}
```

## API `field_meta` đề xuất

```json
{
  "profile": "jira_inspired",
  "editable_fields": [
    "summary",
    "description",
    "issue_type",
    "priority",
    "status",
    "assignee",
    "due_date"
  ],
  "readonly_fields": [
    "reporter"
  ],
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
}
```

Catalog source priority:

1. Project config pulled from Jira.
2. CIS catalog synced from target.
3. Existing values seen in `fields_json`.
4. Lite fallback defaults.

## Chốt implement trước

1. Core editable: `summary`, `description`.
2. Select editable: `issue_type`, `priority`, `status`.
3. User editable: `assignee` + `assignee_meta`.
4. Date editable: `due_date`.
5. Read-only context: `reporter`.
6. Collection read-only: `worklogs`.
7. Bỏ qua `labels`, `components`, `fix_versions`, custom fields cho tới khi có yêu cầu cụ thể.
