# Phase 06 - Jira outbound

## Mục tiêu

Đẩy dữ liệu đã duyệt từ CIS sang Jira thật bằng job async, có retry, journal và state update đầy đủ.

## Làm trong phase này

- Hoàn thiện Jira API client.
- Tạo endpoint `POST /api/v1/issues/:issueId/sync/jira`.
- Endpoint sync chỉ enqueue job nếu pre-check pass.
- Endpoint sync và worker đều pre-check lại theo trạng thái mới nhất.
- Worker xử lý `push_issue`.
- Tạo/update Jira issue theo idempotency rule.
- Lưu `jira_issue_key`, `last_synced_at`, fields phía Jira nếu có.
- CIS phải biết issue tương ứng đã có trên Jira chưa qua `issues.jira_issue_key`.
- Nếu chưa có `jira_issue_key`, worker tìm Jira theo trace Backlog key/CIS id trước khi create để giảm rủi ro duplicate.
- Worker xử lý `push_comment`.
- Comment fail không rollback issue.
- Retry/backoff theo policy chung.
- Admin retry/cancel job.
- Ghi journal mỗi attempt.

## Idempotency rule

Lite dùng kết hợp:

- A. Strict idempotency theo CIS issue.
- B. Luôn pre-check/dry-run theo trạng thái mới nhất trước khi sync.

Quy tắc:

1. Nếu `issues.jira_issue_key` đã có, worker update Jira issue đó.
2. Nếu chưa có `jira_issue_key`, worker search Jira theo trace Backlog key/CIS issue id.
3. Nếu search thấy Jira issue tương ứng, lưu `jira_issue_key` vào CIS rồi update issue đó.
4. Nếu search không thấy, worker create Jira issue mới.
5. Sau create/update thành công, CIS cập nhật `jira_issue_key`, `last_synced_at`, `fields_json` phía Jira nếu có và ghi journal.
6. Sync lại cùng CIS issue không được tạo Jira issue trùng.

## Jira trace/search hiện tại

Code hiện tại không tự thêm trace prefix/label/block vào payload issue Jira v1. Payload lấy từ canonical effective values hoặc override trong Jira sync modal.

Search/link vẫn có helper tìm Jira issue đã tồn tại theo dấu vết nếu dữ liệu Jira cũ có chứa:

- Backlog issue key trong summary/description.
- CIS issue id trong description.
- Label dạng `backlog-<lowercase-backlog-issue-key>` nếu issue Jira cũ đã có label đó.

Payload v1 hiện không gửi `labels`, `components`, `fix_versions` hoặc `worklogs`.

Search rule:

1. Nếu đã có `issues.jira_issue_key`, dùng key đó.
2. Nếu chưa có, search Jira theo Backlog issue key/CIS issue id/trace label nếu có trong Jira.
3. Nếu match đúng một issue, link lại vào CIS bằng `jira_issue_key`.
4. Nếu match nhiều issue, tạo anomaly/conflict và không create issue mới.
5. Nếu không match, create Jira issue mới.

## Deliverables

- Jira API client.
- Jira search-by-trace helper cho dữ liệu Jira đã có trace.
- Handler `push_issue` đăng ký vào worker phase 02.
- Handler `push_comment` đăng ký vào worker phase 02.
- Sync endpoint chỉ enqueue khi pre-check pass.
- Worker pre-check lại trước khi gọi Jira API.
- Idempotency theo `jira_issue_key` và search trace.
- Anomaly/conflict khi search trace match nhiều Jira issue.
- Retry/backoff theo `429`, `5xx`, timeout, `4xx`.
- Test script tự động bằng fake Jira client cho create/update/search/retry.

## Chốt chặn

Phase này đạt khi issue/comment đã review có thể sync sang Jira thật, lỗi được retry đúng, pre-check fail thì không gọi Jira API, và sync lại cùng CIS issue không tạo Jira issue trùng.

Không đi phase 07 nếu:

- Sync endpoint gọi Jira API khi dry-run/pre-check fail.
- Job fail không có journal.
- Comment fail rollback cả issue.
- `issues.sync_status`, `jira_issue_key`, `last_synced_at` không cập nhật đúng sau success.
- Retry không phân biệt `429`, `5xx`, `4xx`.
- Sync lại cùng CIS issue tạo Jira issue trùng.
- CIS không lưu được quan hệ issue nội bộ với Jira issue tương ứng.
- Search trace match nhiều issue nhưng worker vẫn create issue mới.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 06 pass với fake Jira client, ví dụ `npm run verify:phase06`.
- [x] Test issue đủ điều kiện sync tạo job `cis -> jira`.
- [x] Test worker tạo Jira issue thành công và lưu `jira_issue_key`.
- [x] Test chạy sync lại update issue theo `jira_issue_key`, không tạo trùng.
- [x] Test nếu chưa có `jira_issue_key` nhưng Jira đã có issue theo trace, worker link lại vào CIS rồi update.
- [x] Test nếu search trace match nhiều Jira issue, worker tạo anomaly/conflict và không create mới.
- [x] Test comment đã review sync lên Jira.
- [x] Test Jira credential thiếu làm job fail có error rõ.
- [x] Test `429` retry theo `Retry-After` nếu có.
- [x] Test `5xx`/timeout retry theo backoff.
- [x] Test `4xx` không retry mặc định, trừ `429`.
- [x] Test admin retry failed job đưa job về `pending`.
- [x] Test admin cancel được job `pending`, không cancel `running`.

### Manual check (Người review)

- [x] Sync một issue đủ điều kiện với Jira sandbox hoặc môi trường test.
- [x] Kiểm tra Jira issue được tạo/update bằng canonical payload hiện tại.
- [x] Sync lại cùng issue và xác nhận không tạo trùng.
- [x] Sync comment đã review và xác nhận comment xuất hiện trên Jira.
- [x] Tạo lỗi credential/sandbox có kiểm soát và xác nhận journal/error hiển thị rõ.

## Ghi chú thiết kế

- Jira payload issue v1 dùng canonical effective values hoặc override từ Jira sync modal. Code hiện tại không tự ghép Backlog key/url, original Nhật, reviewed translation, attachment pending note hoặc labels vào description/summary.
- CIS giữ description/comment ở dạng text/Markdown-lite trung lập; khi gọi Jira REST API v3, outbound client convert Markdown-lite sang Atlassian Document Format (ADF) để Jira render heading, list, quote, link và inline marks.
- Markdown-lite hỗ trợ tối thiểu cho Jira outbound: `#`/`##`/`###`, `- item`, `1. item`, `**bold**`, `*italic*`, `` `code` ``, `[text](url)`, `> quote` và `---`.
- Phase 03 đã tải attachment thật từ Backlog về CIS storage khi có thể.
- `download_status = downloaded` chỉ nghĩa là file đã nằm trong CIS.
- Phase 06 hoặc Medium mới được cập nhật `sync_status = synced` sau khi upload attachment sang Jira thành công.
- Attachment upload thật sang Jira có thể để Medium; Lite vẫn phải hiển thị rõ `download_status` và `sync_status`.
- Sync endpoint `POST /api/v1/issues/:issueId/sync/jira` hiện pre-check trước khi enqueue; nếu issue đang có `push_issue` job `pending` hoặc `running` thì trả lại job đang active thay vì enqueue thêm.
- Worker `push_issue` dùng lại readiness check của dry-run, sau đó create/update Jira issue và tự enqueue `push_comment` cho các comment backlog đã review nhưng chưa sync.
- Search trace match nhiều Jira issue sẽ đưa `issues.sync_status` về `conflict` và ghi anomaly `unusual_field_change` với `details_json.reason = "jira_trace_conflict"` để admin xử lý.
- Assignee trong payload Jira dùng `accountId` nếu rule `cis -> jira` cho field `user` đã được map; nếu chưa có rule thì dry-run vẫn chỉ warning, không block.
