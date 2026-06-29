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

## Jira trace format

Lite phải ghi trace ổn định lên Jira để CIS có thể search/link lại issue đã tồn tại.

Trace bắt buộc:

- Backlog issue key, ví dụ `WEC-123`.
- CIS issue id.
- Source system: `backlog`.

Nơi ghi trace trong Jira:

- Summary prefix: `[WEC-123] <summary tiếng Việt đã review>`.
- Description block cố định:

```text
CIS Sync Trace
- CIS Issue ID: <cis_issue_id>
- Backlog Issue Key: <backlog_issue_key>
- Source: backlog
```

- Label nếu Jira cho phép:
  - `cis-sync`
  - `backlog-<lowercase-backlog-issue-key>`, ví dụ `backlog-wec-123`

Search rule:

1. Nếu đã có `issues.jira_issue_key`, dùng key đó.
2. Nếu chưa có, search Jira theo Backlog issue key trong summary/description/label.
3. Nếu match đúng một issue, link lại vào CIS bằng `jira_issue_key`.
4. Nếu match nhiều issue, tạo anomaly/conflict và không create issue mới.
5. Nếu không match, create Jira issue mới.

## Deliverables

- Jira API client.
- Jira search-by-trace helper.
- Jira trace formatter cho summary, description và labels.
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
- `issues.status`, `jira_issue_key`, `last_synced_at` không cập nhật đúng sau success.
- Retry không phân biệt `429`, `5xx`, `4xx`.
- Sync lại cùng CIS issue tạo Jira issue trùng.
- CIS không lưu được quan hệ issue nội bộ với Jira issue tương ứng.
- Không có trace block ổn định trong Jira summary/description/labels.
- Search trace match nhiều issue nhưng worker vẫn create issue mới.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động của phase 06 pass với fake Jira client, ví dụ `npm run verify:phase06`.
- [ ] Test issue đủ điều kiện sync tạo job `cis -> jira`.
- [ ] Test worker tạo Jira issue thành công và lưu `jira_issue_key`.
- [ ] Test chạy sync lại update issue theo `jira_issue_key`, không tạo trùng.
- [ ] Test nếu chưa có `jira_issue_key` nhưng Jira đã có issue theo trace, worker link lại vào CIS rồi update.
- [ ] Test nếu search trace match nhiều Jira issue, worker tạo anomaly/conflict và không create mới.
- [ ] Test comment đã review sync lên Jira.
- [ ] Test Jira credential thiếu làm job fail có error rõ.
- [ ] Test `429` retry theo `Retry-After` nếu có.
- [ ] Test `5xx`/timeout retry theo backoff.
- [ ] Test `4xx` không retry mặc định, trừ `429`.
- [ ] Test admin retry failed job đưa job về `pending`.
- [ ] Test admin cancel được job `pending`, không cancel `running`.

### Manual check (Người review)

- [ ] Sync một issue đủ điều kiện với Jira sandbox hoặc môi trường test.
- [ ] Kiểm tra Jira issue được tạo/update và có trace block ổn định.
- [ ] Sync lại cùng issue và xác nhận không tạo trùng.
- [ ] Sync comment đã review và xác nhận comment xuất hiện trên Jira.
- [ ] Tạo lỗi credential/sandbox có kiểm soát và xác nhận journal/error hiển thị rõ.

## Ghi chú thiết kế

- Jira description phải có Backlog key/url, bản dịch Việt đã review, original Nhật và attachment pending note nếu có.
- Attachment upload thật sang Jira có thể để Medium; Lite vẫn phải hiển thị status.
