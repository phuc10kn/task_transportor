# Phase IE-00 - Review và chốt scope

## Mục tiêu

Chốt contract trước khi code Issue Editor để tránh nhập nhằng giữa canonical issue, translation review, Jira source data và sync lifecycle.

## Scope v1

Issue Editor v1 cho phép admin sửa dữ liệu canonical của CIS issue trong `fields_json.*.cis`.

Editable fields:

- `summary`
- `description`
- `issue_type`
- `priority`
- `status` business field
- `assignee`
- `due_date`

Read-only context:

- `reporter`
- source values từ Backlog/Jira/CIS
- sync/anomaly/dry-run summary
- worklog summary/list nếu đã ingest được

Không expose trong Issue Editor v1:

- `labels`
- `components`
- `fix_versions`
- `status_meta`
- `priority_meta`
- `issue_type_meta`
- raw Jira ADF
- raw custom fields

## Quyết định field/meta

- Field model lấy cảm hứng từ Jira vì MVP đang ưu tiên `CIS -> Jira`.
- Giá trị canonical vẫn là CIS value, nằm ở `fields_json.<field>.cis`.
- Source value giữ nguyên ở `fields_json.<field>.backlog` và `fields_json.<field>.jira`.
- `description` trong editor luôn là `plain_text`; Jira adapter chịu trách nhiệm convert outbound sang ADF.
- `assignee_meta` là ngoại lệ hợp lệ, chỉ giữ metadata kỹ thuật tối thiểu:
  - `assignee_meta.jira.account_id`
  - `assignee_meta.jira.email`
  - `assignee_meta.cis.jira_account_id`
- Không lưu display name, avatar hoặc self URL như contract canonical.

## Worklogs

`worklogs` cần có trong kế hoạch, nhưng không phải canonical field.

Quyết định v1:

- Worklogs là collection riêng của CIS, cùng nhóm với comment/attachment.
- Issue Editor có thể hiển thị summary hoặc danh sách worklog read-only.
- Không PATCH worklogs qua `PATCH /api/v1/issues/:issueId`.
- Nếu sau này cần tạo/sửa worklog, dùng endpoint/action riêng và audit riêng.
- Worklogs không tham gia `canonical_hash` của issue payload Jira, trừ khi làm flow sync worklog riêng.

Shape tham khảo:

```json
{
  "worklog_summary": {
    "count": 2,
    "total_spent_seconds": 5400,
    "sources": ["jira"]
  }
}
```

## `issues.sync_status`

Lifecycle state dùng `issues.sync_status`, không dùng `issues.status`.

Business issue status nằm trong:

```text
fields_json.status.backlog
fields_json.status.cis
fields_json.status.jira
```

Khi implement trên code/schema còn dùng `issues.status`, cần migration rename sang `issues.sync_status` và update repository/API/filter/verify liên quan.

## State transition sau manual edit

| Current `sync_status` | Sau edit canonical |
| --- | --- |
| `ingested` | giữ `ingested` |
| `pending_translate` | giữ `pending_translate` |
| `pending_review` | giữ `pending_review` |
| `approved` | chuyển `update_pending` |
| `synced` | chuyển `update_pending` |
| `update_pending` | giữ `update_pending` |
| `conflict` | giữ `conflict` |
| `syncing` | block edit |
| `archived` | block edit |

Không auto approve sau manual edit.

## Revision và journal

- Tạo revision manual khi sửa `summary`, `description`, `issue_type`, `priority`, `assignee`.
- `status` business field và `due_date` có thể chỉ audit bằng journal nếu `issue_revisions` chưa có cột tương ứng.
- Journal action đề xuất: `issue_manual_edit_saved`.
- `details_json` phải có `changed_fields`, `before`, `after`, `reason`, `actor`, `canonical_hash_before`, `canonical_hash_after`.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Chưa áp dụng cho phase review tài liệu.

### Manual check (Người review)

- [ ] Xác nhận field editable v1.
- [ ] Xác nhận bỏ `labels`, `components`, `fix_versions`.
- [ ] Xác nhận giữ `assignee_meta` tối thiểu.
- [ ] Xác nhận `worklogs` là collection read-only/riêng, không phải canonical field.
- [ ] Xác nhận state transition sau manual edit.
