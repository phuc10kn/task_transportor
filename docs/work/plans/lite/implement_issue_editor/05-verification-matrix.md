# Phase IE-05 - Verification matrix

File này mô tả kiểm chứng cho Issue Editor. Unit test check do Agent chạy bằng script/fixture/fake adapter; manual check do người review xác nhận trên API/UI.

## Capability verify hiện có

```text
npm run verify:issue-editor-api
npm run verify:issue-editor-dryrun-sync
npm run verify:issue-editor
```

Alias phase:

```text
npm run verify:issue-editor:phase01 -> npm run verify:issue-editor-api
npm run verify:issue-editor:phase02 -> npm run verify:issue-editor-dryrun-sync
npm run verify:issue-editor -> phase01 + phase02
```

Các phase UI/history có thể bổ sung script riêng nếu tách scope sau này.

## Matrix

| Phase | Unit test check (Agent) | Manual check (Người review) | Fixture/fake cần có |
| --- | --- | --- | --- |
| IE-00 Review | Không bắt buộc script | Xác nhận field/scope/state rule | Không cần |
| IE-01 Canonical API | PATCH allowlist, source không đổi, revision, journal, worklogs contract | Gọi API editor/PATCH/history/worklogs tối thiểu | Issue fixture có Backlog/Jira field |
| IE-02 Dry-run/sync | Canonical override, mapping `cis -> jira`, no labels, no direct translation-queue gate, sync-state gate, stale dry-run block sync | Sửa field, dry-run, sửa tiếp, sync bị block | Fake Jira client, mapping fixture |
| IE-03 Admin UI | Render editor, dirty state, save, source label, worklogs read-only | Sửa issue từ UI | Demo seed issue |
| IE-04 History/Acceptance | History revision/journal, docs contract check nếu có | Truy vết edit từ UI đến journal/revision | Issue đã manual edit |

## Test case tối thiểu

- `GET /editor` trả field source đúng cho `cis`, `backlog`, `jira`.
- `GET /editor` trả `field_meta.profile = "jira_inspired"`.
- `GET /editor` không expose `labels`, `components`, `fix_versions`.
- `GET /editor` trả `description` từ Jira dưới dạng `plain_text`, không trả raw ADF làm value.
- `GET /editor` không trả meta vô dụng như `status_meta`, `priority_meta`, `issue_type_meta`.
- `GET /editor` cho phép `assignee_meta` nếu chỉ giữ Jira account id/email tối thiểu.
- `GET /editor` trả `worklog_summary` hoặc contract rỗng có chủ đích.
- `GET /worklogs` trả danh sách read-only nếu worklog storage đã có.
- `PATCH` với field ngoài allowlist bị reject.
- `PATCH` reject `labels`, `components`, `fix_versions`.
- `PATCH` chỉ ghi vào `fields_json.*.cis`.
- `PATCH` không ghi đè source Backlog/Jira.
- `PATCH` tạo journal manual edit có diff.
- `PATCH` tạo revision manual cho field chính khi schema hỗ trợ.
- `PATCH due_date` validate `YYYY-MM-DD`.
- `PATCH assignee` giữ được `assignee_meta.cis.jira_account_id` nếu gửi lên.
- `PATCH approved/synced` chuyển `update_pending`.
- `PATCH pending_review` không auto approve.
- Dry-run dùng canonical override.
- Dry-run dùng `assignee_meta.cis.jira_account_id` khi build Jira payload.
- Dry-run preview `duedate`.
- Dry-run không đưa `labels`, `components`, `fix_versions`, `worklogs` vào issue payload.
- Dry-run không block bởi translation queue/review.
- Missing mapping cho canonical override block dry-run bằng `MAPPING_REQUIRED`.
- Sync thật block nếu dry-run stale bằng `DRY_RUN_STALE`.
- UI không cho sync khi form dirty.
- UI hiển thị worklogs như collection read-only.
- History trả được revision và journal liên quan.

## Manual acceptance flow

```text
Login
  -> mở Issue Editor từ Issue list
  -> sửa canonical summary/priority/due_date
  -> chọn assignee nếu có catalog hoặc nhập Jira account id
  -> save
  -> xem journal/history
  -> xem worklog read-only nếu có dữ liệu
  -> mở modal Jira sync để dry-run
  -> xác nhận payload dùng canonical value, không có labels
  -> sửa canonical thêm lần nữa
  -> thử sync Jira và thấy DRY_RUN_STALE
  -> dry-run lại trong modal
  -> sync Jira trong môi trường test/sandbox
```

Pass khi:

- Không cần thao tác DB thủ công.
- UI phân biệt rõ source Backlog/Jira với canonical CIS.
- Sync payload dùng canonical value.
- Translation queue không chặn issue sync trong Issue Editor flow.
- Worklogs không bị hiểu nhầm là field canonical editable.
- Audit đủ actor, field, before/after, reason, correlation id.
- Source field gốc không đổi sau toàn bộ flow.
