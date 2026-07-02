## Cập nhật IE-02 - Issue canonical sync pre-check

Rule mới cho Issue Editor -> Jira issue sync:

1. Issue ở trạng thái syncable hiện tại: `ingested`, `pending_review`, `approved`, `update_pending` hoặc `synced`.
2. Required mapping đã approved.
3. Không còn critical blocking anomaly.
4. Project `sync_enabled = 1`.
5. Jira credential/config tồn tại.
6. Dry-run thành công gần nhất có `canonical_hash` khớp canonical value hiện tại.
7. Dry-run validation không còn lỗi block.

Translation queue/review không còn được check trực tiếp bằng rule `TRANSLATION_REVIEW_REQUIRED` trong Issue Editor flow. Tuy nhiên `issues.sync_status` vẫn là gate: code Lite hiện tại không cho sync khi issue còn `pending_translate`, `syncing`, `conflict` hoặc `archived`. Comment sync vẫn giữ rule translation/review riêng.

Attachment outbound chưa nối vào Issue Editor dry-run/sync, nên issue canonical pre-check hiện tại không check hoặc warning attachment. Attachment sync sẽ có flow/pre-check riêng khi được implement.

Nếu check fail, không gọi Jira API. Nếu hash dry-run stale, trả `DRY_RUN_STALE`.

# State Machine — Trạng thái và transition MVP

## Mục tiêu

File này chốt cách các trạng thái chính chuyển đổi trong MVP để API, worker và Admin UI dùng cùng một contract.

Nguyên tắc chung:

- `issues.sync_status` là trạng thái sync/vòng đời chính của issue trong CIS, khác với business field `fields_json.status.*`.
- Translation, sync job, comment và attachment có trạng thái riêng trong bảng riêng.
- Worker outbound phải kiểm tra mapping/anomaly/config/sync state/dry-run freshness trước khi sync issue canonical. Translation review không còn là gate trực tiếp, nhưng state `pending_translate` vẫn chặn issue sync theo code Lite hiện tại.
- Mọi transition quan trọng cần ghi journal hoặc audit tương đương.

## Issue sync status

Các trạng thái trong `issues.sync_status`:

| Status | Ý nghĩa |
| --- | --- |
| `ingested` | Issue vừa vào CIS, chưa xử lý sâu. |
| `pending_translate` | Issue có current-source translation item còn `pending`; trạng thái này chưa thuộc nhóm syncable sang Jira trong code Lite hiện tại. |
| `pending_review` | Đã có draft dịch, chờ admin review. |
| `approved` | Đã được duyệt, đủ điều kiện tạo outbound sync job nếu không bị block. |
| `syncing` | Đang có outbound sync job chạy. |
| `synced` | Sync sang hệ thống đích thành công. |
| `update_pending` | Có thay đổi mới từ Backlog/Jira, cần xử lý lại. |
| `conflict` | Có conflict field-level cần review. |
| `archived` | Không còn sync nữa. |

## Flow Backlog issue mới

```text
webhook/manual pull
  -> ingested
```

Nếu project/issue bật translation option:

```text
ingested
  -> pending_translate
  -> pending_review
  -> approved
  -> syncing
  -> synced
```

Chi tiết:

1. Webhook hoặc manual pull tạo inbound `sync_jobs`.
2. Worker normalize và upsert issue vào CIS với `sync_status = 'ingested'`.
3. Inbound không tự tạo translation queue trong Lite hiện tại; admin yêu cầu dịch từ Issue Editor hoặc global translation workflow sau ingest.
4. Khi Issue Editor tạo/dịch queue item current-source, issue có thể chuyển `pending_translate` hoặc `pending_review` theo trạng thái queue hiện tại.
5. Khi toàn bộ current-source issue translations (`summary`, `description` nếu có Backlog source) đã `approved`/`edited`, issue có thể chuyển `approved`.
6. Nếu `Approve + save` apply reviewed text vào canonical và field thật sự thay đổi, cùng rule manual edit có thể đưa issue từ `approved`/`synced` sang `update_pending`.
7. Khi outbound job CIS -> Jira bắt đầu, chuyển issue sang `syncing`.
8. Khi Jira sync thành công, chuyển issue sang `synced`.

## Flow update từ Backlog/Jira

Khi issue đã tồn tại và có update:

```text
synced/update_pending/approved
  -> update_pending
  -> pending_translate hoặc pending_review nếu bật translation/review
  -> approved
  -> syncing
  -> synced
```

Rule:

- Content thay đổi từ Backlog: không tự động ghi đè bản dịch đã duyệt; tạo revision mới và đưa về `update_pending`.
- Nếu cần dịch lại và translation option được bật, tạo translation queue mới và chuyển sang `pending_translate`.
- Metadata thay đổi không cần dịch thì giữ `update_pending` cho tới khi mapping/conflict được xử lý.
- Nếu cả Backlog và Jira cùng đổi field giữa hai lần sync, chuyển `issues.sync_status = 'conflict'`.

## Translation queue

Các trạng thái trong `translation_queue.review_status`:

| Status | Ý nghĩa |
| --- | --- |
| `pending` | Queue mới, chưa có AI draft. |
| `ai_draft` | AI đã tạo draft, chờ review. |
| `approved` | Admin đã duyệt. |
| `rejected` | Admin reject draft. |
| `edited` | Admin sửa draft và duyệt bản sửa. |

Transition:

```text
pending -> ai_draft -> approved
pending -> ai_draft -> edited
pending -> ai_draft -> rejected -> ai_draft
pending -> ai_draft -> rejected -> manual/edited
```

Quyết định:

- Với issue-level translation, code chỉ tính các queue item current-source có `target_type = 'issue'`, `comment_id IS NULL`, `target_field` là `summary` hoặc `description`, và `source_text` khớp Backlog source hiện tại trong `fields_json.<target_field>.backlog`.
- Queue issue-level thiếu `target_field` là legacy invalid data: job translate liên quan bị xóa và queue item bị xóa khi refresh translation status.
- Queue item stale không được dùng để fill translated text và không được tính là approved cho trạng thái dịch hiện tại của issue.
- Reject giữ trạng thái `rejected` và lưu note/review_notes.
- Admin có action `retranslate` để tạo AI draft mới.
- Admin có thể chuyển sang manual bằng cách nhập `reviewed_text`; khi duyệt bản manual thì dùng `edited` hoặc `approved` tùy UI, nhưng phải lưu được nguồn manual trong journal/audit.
- Comment ngắn vẫn cần human review trước khi sync Jira trong MVP.

## Sync jobs

Các trạng thái trong `sync_jobs.status`:

| Status | Ý nghĩa |
| --- | --- |
| `pending` | Chờ worker xử lý, `run_after` đã tới hạn. |
| `running` | Worker đang xử lý. |
| `success` | Job hoàn thành thành công. |
| `failed` | Job lỗi và hết retry hoặc lỗi không retry. |
| `cancelled` | Admin hủy job trước khi chạy. |

Transition:

```text
pending -> running -> success
pending -> running -> pending   -- retryable failure
pending -> running -> failed    -- exhausted/non-retryable failure
pending -> cancelled
```

Retry:

- Retry failed job bằng cách set job `failed` về `pending`.
- Mỗi attempt ghi `sync_journal`.
- Retry tự động dùng `retry_count` và `run_after` trong `sync_jobs`.
- MVP chỉ cancel job `pending`, không cancel job `running`.

## Comment sync status

Các trạng thái trong `issue_comments.sync_status`:

| Status | Ý nghĩa |
| --- | --- |
| `pending` | Comment chưa sync sang hệ thống đích. |
| `synced` | Comment đã sync thành công. |
| `skipped` | Comment được bỏ qua có chủ đích. |
| `failed` | Sync comment thất bại. |

Rule:

- Comment từ Backlog cần translation + review trước khi sync Jira.
- Comment từ Jira được ingest vào CIS trong MVP; sync ngược về Backlog để sau MVP.
- Nếu comment sync fail, issue không nhất thiết bị rollback; job/comment được retry riêng.

## Attachment sync status

Các trạng thái chính:

- `download_status`: `pending`, `downloaded`, `failed`, `skipped`
- `sync_status`: `pending`, `synced`, `skipped`, `failed`

Quyết định:

- `download_status` là trạng thái tải file từ hệ thống nguồn về CIS storage.
- `sync_status` là trạng thái đẩy file từ CIS sang hệ thống đích như Jira.
- Sau Backlog -> CIS ingest, trạng thái đúng thường là `download_status = downloaded` và `sync_status = pending`.
- Attachment failure không block issue sync trong MVP.
- Issue Editor issue sync hiện không đưa attachment pending note vào payload. Attachment outbound sẽ có flow/pre-check riêng khi được implement.
- Retry download về CIS dùng action/API retry attachment trực tiếp.
- Retry upload/sync sang Jira sẽ dùng job `push_attachment` khi bật CIS -> Jira attachment sync ở phase sau; code Lite hiện tại chưa có default handler cho job này.
- Nếu project sau này đánh dấu attachment là required, có thể block theo config project.

## Mapping gap

Mapping gap block toàn bộ issue cho đến khi mapping được approve.

Blocking fields mặc định:

- `issue_type`
- `status`
- `priority`
- required user/assignee mapping nếu outbound payload bắt buộc

Khi thiếu mapping:

1. Tạo mapping proposal với `approval_status = 'pending'`.
2. Tạo anomaly `mapping_gap`.
3. Không tạo/sync Jira thật cho issue đó.
4. Sau khi mapping được approve, issue có thể quay lại `approved` hoặc tiếp tục dry-run/sync.

## Critical anomaly

Critical anomaly không đổi trực tiếp `issues.sync_status`.

Worker outbound phải check:

```text
anomaly_log.status IN ('open', 'investigating')
AND severity = 'critical'
AND issue_id = current issue
```

Nếu còn blocking anomaly:

- Không sync thật.
- Ghi job failure hoặc validation result.
- Admin cần resolve/ignore anomaly trước.

## Force approve

Force approve được phép trong MVP nhưng:

- Không bypass missing required mapping.
- Không bypass hard credential/config lỗi.
- Phải ghi journal/audit.
- `reason` là optional theo API contract, nhưng endpoint nên nhận nếu UI/Codex gửi lên.

## Outbound sync pre-check

Trước khi `CIS -> Jira` sync thật, worker phải kiểm tra:

1. Issue không archived.
2. Required mapping đã approved.
3. Không còn critical blocking anomaly.
4. Project `sync_enabled = 1`.
5. Jira credential/config tồn tại.
6. Dry-run thành công gần nhất khớp `canonical_hash` hiện tại.
7. Dry-run validation không còn lỗi block.

Nếu check fail, không gọi Jira API.
