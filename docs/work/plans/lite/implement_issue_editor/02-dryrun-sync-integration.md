# Phase IE-02 - Dry-run và sync integration

## Mục tiêu

Đảm bảo dry-run Jira và sync Jira thật dùng cùng canonical effective value mới nhất từ Issue Editor, đồng thời block sync nếu dry-run đã stale.

Sau phase này, Issue Editor flow coi canonical CIS là nguồn dữ liệu nghiệp vụ outbound sang Jira. Translation queue/review là workflow riêng và không còn là gate riêng chặn issue sync Jira; sync state vẫn là gate và `pending_translate` chưa syncable trong code Lite hiện tại.

## Outbound fields

Dry-run/sync Jira dùng các field canonical:

- `summary`
- `description`
- `issue_type`
- `priority`
- `status`
- `assignee`
- `due_date`

Không dùng trong issue payload v1:

- `labels`
- `components`
- `fix_versions`
- `worklogs`

`worklogs` là collection/flow riêng. Nếu sau này sync worklog sang Jira, cần dry-run/sync riêng cho worklogs, không trộn vào issue create/update payload.

## Payload Jira v1

Dry-run trả payload dạng preview gần với Jira request:

```json
{
  "operation": "create",
  "jira_issue_key": null,
  "fields": {
    "project": { "key": "DMP" },
    "issuetype": { "name": "Task" },
    "summary": "Canonical summary",
    "description": "Canonical plain text",
    "priority": { "name": "Medium" },
    "assignee": { "accountId": "jira-account-id" },
    "duedate": "2026-07-31"
  },
  "transition_preview": {
    "status": "Done"
  }
}
```

Rule:

- `summary` lấy trực tiếp từ canonical effective summary, không tự thêm prefix `[BACKLOG-KEY]`.
- `description` là canonical plain text, không ghép block `Reviewed Vietnamese`, `Original`, comments, attachments hoặc trace.
- `labels` không xuất hiện trong payload v1.
- Attachment không nằm trong issue payload v1 và không được check trong issue dry-run cho tới khi attachment outbound flow được nối.
- Trace/link existing Jira vẫn là logic adapter riêng, không phải field canonical editor v1.

## Mapping rule

- Nếu `fields_json.<field>.cis` có override, dùng value đó làm input cho mapping `cis -> jira`.
- Nếu chưa có override và value effective đến từ `backlog`/`jira`, đi qua boundary source -> `cis` rồi `cis -> jira`.
- Không đi đường tắt `backlog -> jira`.
- Missing mapping vẫn block bằng `MAPPING_REQUIRED` và có thể tạo anomaly `mapping_gap`.
- Vì profile `jira_inspired`, nhiều mapping có thể là identity nhưng vẫn phải đi qua boundary mapping khi field là required mapping.

Các field required mapping trong v1:

- `issue_type`
- `status`
- `priority`

## Assignee outbound

Khi build Jira payload:

1. Ưu tiên `assignee_meta.cis.jira_account_id`.
2. Nếu chưa có account id, dùng canonical effective `assignee` để resolve qua mapping `user`.
3. Nếu không resolve được, dry-run vẫn có thể pass khi assignee không bắt buộc, nhưng phải có warning `ASSIGNEE_MAPPING_NOT_READY` và payload bỏ assignee.

## Description outbound

- Canonical description là `plain_text`.
- Dry-run preview hiển thị plain text.
- Jira adapter có thể convert plain text sang ADF ở boundary outbound nếu Jira API thật yêu cầu ADF.
- Không lưu `description_meta` trong Issue Editor contract v1.

## Translation review gate

Issue Editor flow không dùng translation queue làm điều kiện trực tiếp để sync Jira.

Rule hiện tại:

- Không trả `TRANSLATION_REVIEW_REQUIRED` trong dry-run/sync issue canonical.
- Translation Review vẫn là workflow riêng để admin review bản dịch.
- Reviewed translation có thể được admin copy/chọn làm canonical summary/description, nhưng không tự động chặn hoặc mở sync.
- Mapping, anomaly, Jira config, sync state và stale dry-run vẫn là gate chính; `pending_translate` bị chặn bởi sync state.

## Dry-run response bổ sung

```json
{
  "data": {
    "canonical_hash": "sha256:...",
    "field_sources": {
      "summary": "cis",
      "description": "backlog",
      "issue_type": "cis",
      "priority": "cis",
      "status": "cis",
      "assignee": "cis",
      "due_date": "cis"
    },
    "excluded_collections": ["worklogs"],
    "stale": false
  }
}
```

`canonical_hash` tính từ outbound fields và identity liên quan như `issue_id`, `backlog_issue_key`, `jira_issue_key`.

Không đưa `worklogs` vào hash v1.

## Stale rule

Sync Jira thật phải tìm dry-run thành công gần nhất cho issue và target `jira`.

Dry-run stale nếu:

- Chưa từng dry-run thành công.
- `canonical_hash` đã lưu khác hash hiện tại.

Khi stale:

- Không gọi Jira API.
- Trả error domain `DRY_RUN_STALE`.
- Ghi journal action `jira_sync_rejected_stale_dry_run`.
- UI yêu cầu admin dry-run lại.

## State rule

Issue canonical có thể dry-run/sync khi `issues.sync_status` thuộc nhóm vận hành được:

- `ingested`
- `pending_review`
- `approved`
- `update_pending`
- `synced`

Không sync khi:

- `archived`
- `pending_translate`
- `syncing`
- `conflict`

`conflict` cần action xử lý riêng trước khi sync lại.

## Deliverables đã implement

- Jira dry-run builder dùng helper canonical từ CIS.
- Dry-run response có `canonical_hash`, `field_sources`, `excluded_collections`.
- Dry-run journal lưu canonical hash.
- Sync pre-check reject stale dry-run.
- Error code `DRY_RUN_STALE`.
- Test cho assignee account id, due date, description plain text, no labels, no direct translation-queue gate.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] `npm run verify:issue-editor:phase02` pass.
- [x] Dry-run dùng `fields_json.summary.cis` khi có override.
- [x] Dry-run dùng `issue_type/status/priority` canonical làm input `cis -> jira`.
- [x] Dry-run ưu tiên `assignee_meta.cis.jira_account_id`.
- [x] Dry-run validate/preview `due_date`.
- [x] Dry-run không đưa `labels/components/fix_versions/worklogs` vào issue payload.
- [x] Dry-run/sync không block bởi translation queue/review.
- [x] Manual edit sau dry-run làm sync trả `DRY_RUN_STALE`.
- [x] Dry-run lại sau edit cho phép sync pre-check đi tiếp nếu điều kiện khác pass.

### Manual check (Người review)

- [ ] Sửa canonical issue type hoặc assignee.
- [ ] Dry-run thấy payload đổi theo canonical value.
- [ ] Xác nhận payload không có `labels`.
- [ ] Xác nhận translation queue chưa review không còn chặn issue sync.
- [ ] Sửa tiếp canonical summary sau dry-run.
- [ ] Sync Jira bị block vì dry-run stale.
- [ ] Dry-run lại rồi sync thử trong sandbox.
