# Evolution

Custom modular monolith phải giúp Lite, Medium và Full kế thừa cùng một kiến trúc thay vì rewrite.

## Lite

Lite là bản pull-first:

```text
Backlog manual/scheduled pull -> CIS -> Review -> Jira
```

Lite bật tối thiểu:

- Manual pull.
- Scheduled pull optional.
- Translation review.
- Mapping approval.
- Dry-run Jira.
- Jira push.
- Job/journal/audit.

Lite được cắt scope nhưng không được cắt nền móng: schema, state, module boundary, normalizer, job/journal phải đủ để Medium kế thừa.

## Medium

Medium thêm event-driven inbound:

- Backlog webhook.
- Jira webhook.
- Jira manual pull.
- Attachment file thật.
- Full anomaly MVP.
- AI mapping proposal.

Medium phải reuse:

- Same CIS schema/core.
- Same normalizer pattern.
- Same job/journal pattern.
- Same mapping/anomaly pre-check.

Webhook không được tạo đường tắt bỏ qua worker/job.

## Full

Full thêm sync hai chiều và vận hành dài hạn:

- CIS -> Backlog.
- Việt -> Nhật review/publish.
- Replay/rollback tooling.
- Learning từ review/mapping/anomaly.
- Notification ngoài UI.
- Backup/retention automation.
- Optional worker split.
- Optional DB upgrade.

## Khi nào tách worker

Chỉ cân nhắc khi:

- AI/Jira/Backlog API latency làm API admin chậm.
- Job backlog tăng liên tục.
- Cần restart worker độc lập.
- Cần rate-limit riêng per integration.

Nếu tách worker, contract không đổi:

- `sync_jobs` là source of truth cho job state.
- `sync_journal` là audit.
- API không gọi external sync trực tiếp.

## Khi nào đổi database

SQLite vẫn phù hợp Lite/Medium nội bộ. Cân nhắc PostgreSQL khi:

- Nhiều writer concurrent hơn dự kiến.
- Dữ liệu/journal lớn.
- Cần backup/replication online.
- Cần query/report phức tạp hơn.

Đổi DB không được đổi product model:

```text
System -> CIS -> System
```

Đổi DB cũng không được xóa ownership module: shared database engine không đồng nghĩa shared write ownership.

