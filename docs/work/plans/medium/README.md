# Phiên bản Medium

## Mục tiêu

Medium là bản MVP vận hành theo các quyết định đã chốt trong `docs/work/implement-interview.md`:

```text
Backlog -> CIS
Jira -> CIS
CIS -> Jira
```

Medium biến Lite thành hệ thống dùng được hằng ngày cho nhiều project nội bộ bằng cách thêm webhook, Jira inbound và attachment đầy đủ trên nền manual/scheduled pull đã có.

## Kế thừa từ Lite

Medium giữ nguyên:

- Runtime một service.
- SQLite + migration.
- CIS schema nền.
- Admin auth.
- Backlog normalizer.
- Backlog manual pull/scheduled pull.
- Translation review.
- Mapping approval.
- Dry-run trước sync Jira.
- Sync job + sync journal.

Medium chỉ bổ sung module và mở rộng UI/API, không viết lại luồng Lite.

## Tóm tắt cần làm trong Medium

Medium kế thừa Lite và thêm:

1. Backlog webhook -> CIS.
2. Jira webhook/manual pull -> CIS.
3. Attachment file thật Backlog -> CIS -> Jira.
4. AI propose mapping và bulk approval.
5. Bộ anomaly MVP đầy đủ.
6. Conflict policy theo field.
7. Admin UI đầy đủ hơn cho vận hành hằng ngày.
8. Search, retention, backup docs và dashboard health rõ hơn.

## Chức năng cần thêm

### 1. Backlog webhook -> CIS

- `POST /webhooks/backlog`.
- Verify `X-Webhook-Token`, cho phép tắt bằng `WEBHOOK_VERIFY=false` trong dev.
- Lưu raw payload vào `webhook_events`.
- Dedupe theo event id/header id hoặc fallback payload hash.
- Enqueue `sync_jobs` với `direction_from = 'backlog'`, `direction_to = 'cis'`, `job_type = 'webhook_ingest'`.
- Dùng lại Backlog normalizer, mapping/anomaly và state machine của Lite.

### 2. Jira -> CIS

- `POST /webhooks/jira?token=...`.
- Verify token trong URL và mask token khi log.
- Manual pull Jira project/issue.
- Normalize status, assignee, field change, comment, attachment.
- Issue tạo trực tiếp trên Jira vẫn có thể vào CIS.

### 3. Attachment đầy đủ

- Tải file thật từ Backlog về `storage/attachments`.
- Lưu metadata/hash vào `issue_attachments`.
- Upload/copy attachment sang Jira.
- Attachment fail không block issue sync; retry riêng.
- Jira description ghi rõ attachment pending nếu chưa upload được.

### 4. Mapping nâng cấp

- AI propose mapping từ dữ liệu.
- Admin approve/reject từng mapping.
- Bulk approve.
- Mapping coverage dashboard cơ bản.
- Hỗ trợ thêm component/category, labels, milestone/version và các field phát sinh cần chuẩn hóa.
- Mô hình global rule + project override.

### 5. Anomaly detection MVP

- Batch operation.
- Duplicate content.
- Unusual field change.
- Routing mismatch.
- Translation low confidence.
- Mapping gap.
- Sync failure chain.
- Admin UI filter theo status/type, chưa cần queue riêng.

### 6. Conflict policy

- `status`: Jira thắng.
- `assignee`: Jira thắng.
- `summary`, `description`, `comment`: manual review nếu cả hai phía cùng sửa.
- `priority`: manual review hoặc Backlog thắng theo project config.
- Attachment trùng tên/hash thì skip duplicate.

### 7. Sync engine hoàn chỉnh hơn

- Worker poll `sync_jobs`.
- Hỗ trợ cả `manual_pull`, scheduled pull và `webhook_ingest`.
- Retry `1m -> 5m -> 15m`.
- `429` dùng `Retry-After` nếu có.
- `4xx` không retry mặc định.
- `5xx/network timeout` retry tối đa 3 lần.
- Cancel job `pending`.
- Retry job `failed` bằng cách set lại `pending`.

### 8. Admin UI đầy đủ theo MVP

- Dashboard health/status.
- Project page có issue list/detail và filter theo project.
- Issue list/detail.
- Translation review.
- Mapping approval.
- Anomaly list/detail.
- Sync journal.
- Sync jobs.
- Project config.
- Attachment list/download/retry.
- Badge notification và dashboard alerts.

### 9. Search và vận hành

- Search issue bằng text.
- Correlation id cho request/webhook/job.
- Retention policy 3 tháng cho `webhook_events`, `sync_journal`, `anomaly_log`.
- Tài liệu backup SQLite thủ công.

## Chưa làm ở Medium

- CIS -> Backlog sync thật.
- Việt -> Nhật cho dev reply về Backlog như luồng production.
- Tách worker thành process riêng.
- Role phức tạp ngoài admin.
- Notification email/Slack/Teams.
- Backup tự động.
- Học translation/mapping nâng cao theo thời gian dài.

## Definition of Done

Medium hoàn thành khi:

1. Ba luồng Backlog -> CIS, Jira -> CIS, CIS -> Jira chạy ổn định, trong đó Backlog -> CIS hỗ trợ cả pull từ Lite và webhook mới.
2. Issue/comment/attachment đều có lifecycle, retry và journal.
3. Missing mapping, critical anomaly và dry-run validation chặn sync thật đúng cách.
4. Admin có thể xử lý review, mapping, anomaly, failed job và project config qua UI.
5. Có dashboard đủ để biết hệ thống đang khỏe hay đang kẹt.
