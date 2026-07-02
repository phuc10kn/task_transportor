# Cập nhật UI - Issue Editor là màn chính

- Issue Editor là màn chính khi admin mở một issue từ Issue list.
- Dry-run Jira, Sync Jira và Force approve nằm trong Issue Editor.
- Jira sync trên màn chính chỉ còn nút `Jira sync`; modal tự chạy dry-run, hiển thị payload sắp update lên Jira, cho admin sửa payload và bấm `Sync Jira`.
- Payload chỉnh trong Jira sync modal được dùng cho sync job; các draft field có giá trị được lưu vào `fields_json.<field>.jira` trước khi enqueue sync.
- Translation review nằm trong Issue Editor qua nút `Translations` duy nhất trên màn chính; mọi tác vụ xem nội dung dịch, sửa nội dung dịch, approve/save, reject và retranslate đều thực hiện trong modal.
- Không còn modal/view status riêng cho translation trong Issue Editor.
- Riêng action translate trong Issue Editor gọi provider trực tiếp trong request hiện tại để tạo `ai_draft`, không enqueue `sync_jobs` và không cần chờ worker; `translation_queue` vẫn là nơi lưu draft/review/audit.
- Khi direct translate đang chạy, modal hiển thị trạng thái `Translating...`, disable các action dịch/review liên quan và giữ modal mở cho tới khi có kết quả hoặc lỗi.
- Translation item của issue lưu/nhận diện `target_field` (`summary` hoặc `description`); label UI là `Summary translation` hoặc `Description translation`.
- Source text của issue translation lấy từ Backlog branch hiện tại (`fields_json.<target_field>.backlog`), không fallback sang CIS/revision/queue cũ.
- Nếu source trong queue đã cũ so với Backlog source hiện tại thì modal hiển thị source Backlog mới, không dùng translated text cũ và yêu cầu translate lại trước khi approve/save.
- Khi translation còn `pending` và chưa có `ai_draft`, ô `Translated text` phải để trống và yêu cầu bấm `Translate` để tạo draft ngay, không fallback sang source text.
- Translation vẫn phải đi qua `translation_queue` và các trạng thái review hiện có; Issue Editor chỉ gọi lại API approve/manual-edit/reject/retranslate hiện tại, không auto-approve và không bypass audit.
- `Approve + save` là một nút duy nhất: lưu reviewed text và apply vào `fields_json.<target_field>.cis`.
- Backlog sync có nút `Resync from Backlog` trong Issue Editor. `Pull whole project` ở Project Config đang bị disable ở FE.
- Issue Detail nếu còn tồn tại chỉ là màn phụ/legacy, không phải entry chính.
# Lite - Implement Issue Editor

Folder này là plan triển khai capability `CIS Issue Editor` cho Lite, dựa trên proposal `../workflow/issueEditor.md` và các quyết định mới trong quá trình review/implement.

Issue Editor không thay thế `../implement_plans`. Đây là plan bổ sung để admin vận hành một CIS issue như entity canonical riêng, vẫn giữ nguyên mô hình:

```text
System -> CIS -> System
```

## Context đã chốt

- CIS field/meta lấy cảm hứng từ Jira để tiết kiệm thời gian thiết kế.
- CIS vẫn là trung tâm, không trở thành bản copy phụ thuộc Jira.
- Source branch `fields_json.*.backlog` và `fields_json.*.jira` là bất biến với manual edit.
- Admin edit chỉ ghi vào `fields_json.*.cis`.
- Lifecycle state của issue dùng `issues.sync_status`, không dùng `issues.status`.
- Business status của ticket nằm ở `fields_json.status.*`.
- Jira ADF phải convert sang `plain_text` trước khi vào canonical/editor.
- Không dùng các meta phụ vô dụng như `status_meta`, `priority_meta`, `issue_type_meta`.
- Riêng `assignee_meta` được giữ tối thiểu vì Jira cần `accountId` để assign.
- Bỏ khỏi Issue Editor v1: `labels`, `components`, `fix_versions`.
- Thêm `worklogs` như collection riêng, không phải field canonical trong `fields_json`.
- UI v1 lấy `Issue Editor` làm màn chính của issue; `Issue Detail` nếu còn tồn tại chỉ là legacy/read-only view. History/Worklogs là panel/subview trong editor.

## Quyết định sync Jira sau IE-02

- Dry-run/sync Jira dùng canonical effective value mới nhất từ CIS.
- Translation queue/review không còn là gate chặn issue sync Jira trong Issue Editor flow.
- Mapping, anomaly, Jira config và stale dry-run vẫn là các gate bắt buộc.
- Payload issue Jira không đưa `labels`, `components`, `fix_versions` hoặc `worklogs`.
- Sync thật chỉ được enqueue sau dry-run thành công có `canonical_hash` khớp hiện tại; nếu không trả `DRY_RUN_STALE`.
- Attachment outbound chưa nối vào Issue Editor dry-run/sync, nên issue dry-run không check hoặc warning attachment.

## Thứ tự phase

1. [00-review-scope.md](00-review-scope.md) - chốt scope, field model, state rule.
2. [01-canonical-api.md](01-canonical-api.md) - API editor, PATCH canonical issue, history tối thiểu, worklog read model.
3. [02-dryrun-sync-integration.md](02-dryrun-sync-integration.md) - dry-run/sync dùng canonical value và stale detection.
4. [03-admin-ui-editor.md](03-admin-ui-editor.md) - màn Issue Editor trong Admin UI.
5. [04-history-acceptance.md](04-history-acceptance.md) - audit/history, docs contract và nghiệm thu.
6. [05-verification-matrix.md](05-verification-matrix.md) - matrix kiểm chứng.

Reference:

- [cis-main-fields-analysis.md](cis-main-fields-analysis.md) - field chính của CIS từ Jira Task sample.
- `jira-task-response-sample.json` - Jira Task sample rút gọn.
- `jira-task-response-raw-sample.json` - Jira Task raw sample có `names`, `schema`, `renderedFields`.

## Tài liệu phải đọc trước khi code

1. `../workflow/issueEditor.md`
2. File phase trong folder này.
3. `../implement_context.md`
4. `../../architecture/README.md`
5. `../../architecture/02-module-structure.md`
6. `../implement_plans/README.md`

Nếu mâu thuẫn, ưu tiên quyết định trong folder này, sau đó đến proposal workflow, plan Lite mới, architecture guide, rồi spec nền cũ.

## Verify

```text
npm run verify:issue-editor:phase01
npm run verify:issue-editor:phase02
npm run verify:issue-editor
```

Các phase UI/history sau này sẽ bổ sung script riêng nếu tách khỏi verify hiện tại.

Không tick `Manual check (Người review)` cho tới khi user xác nhận manual pass.
