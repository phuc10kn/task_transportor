# State Machine — Trạng thái và transition MVP

## Mục tiêu

File này chốt cách các trạng thái chính chuyển đổi trong MVP để API, worker và Admin UI dùng cùng một contract.

Nguyên tắc chung:

- `issues.status` là trạng thái nghiệp vụ chính của issue trong CIS.
- Translation, sync job, comment và attachment có trạng thái riêng trong bảng riêng.
- Worker outbound phải kiểm tra mapping/anomaly/translation trước khi sync thật.
- Mọi transition quan trọng cần ghi journal hoặc audit tương đương.

## Issue status

Các trạng thái trong `issues.status`:

| Status | Ý nghĩa |
| --- | --- |
| `ingested` | Issue vừa vào CIS, chưa xử lý sâu. |
| `pending_translate` | Issue cần AI/manual translation. |
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
  -> pending_translate
  -> pending_review
  -> approved
  -> syncing
  -> synced
```

Chi tiết:

1. Webhook hoặc manual pull tạo inbound `sync_jobs`.
2. Worker normalize và upsert issue vào CIS với `status = 'ingested'`.
3. Nếu cần dịch, chuyển sang `pending_translate` và tạo `translation_queue`.
4. Khi AI draft xong, chuyển issue sang `pending_review`.
5. Khi admin approve translation, chuyển issue sang `approved`.
6. Khi outbound job CIS -> Jira bắt đầu, chuyển issue sang `syncing`.
7. Khi Jira sync thành công, chuyển issue sang `synced`.

## Flow update từ Backlog/Jira

Khi issue đã tồn tại và có update:

```text
synced/update_pending/approved
  -> update_pending
  -> pending_translate hoặc pending_review nếu content cần review lại
  -> approved
  -> syncing
  -> synced
```

Rule:

- Content thay đổi từ Backlog: không tự động ghi đè bản dịch đã duyệt; tạo revision mới và đưa về `update_pending`.
- Nếu cần dịch lại, tạo translation queue mới và chuyển sang `pending_translate`.
- Metadata thay đổi không cần dịch thì giữ `update_pending` cho tới khi mapping/conflict được xử lý.
- Nếu cả Backlog và Jira cùng đổi field giữa hai lần sync, chuyển `issues.status = 'conflict'`.

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

- Attachment failure không block issue sync trong MVP.
- Issue vẫn có thể sync sang Jira; Jira description/payload cần ghi attachment pending nếu có file chưa upload được.
- Attachment retry riêng bằng job `push_attachment` hoặc action retry attachment.
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

Critical anomaly không đổi trực tiếp `issues.status`.

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
2. Translation bắt buộc đã approved/edited.
3. Required mapping đã approved.
4. Không còn critical blocking anomaly.
5. Project `sync_enabled = 1`.
6. Jira credential/config tồn tại.
7. Dry-run validation không còn lỗi block.

Nếu check fail, không gọi Jira API.
