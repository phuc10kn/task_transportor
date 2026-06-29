# Bản đồ tài liệu work

File này liệt kê các tài liệu chính trong `docs/work` và scope của từng file.

## Thiết kế nền

| File | Scope |
| --- | --- |
| [01-architecture.md](01-architecture.md) | Kiến trúc Central Sync Hub, nguyên tắc thiết kế và 4 luồng đồng bộ chính. |
| [02-central-issue-store.md](02-central-issue-store.md) | Schema CIS: projects, issues, revisions, comments, translation queue, sync journal, mapping rules, anomaly log và webhook events. |
| [10-state-machine.md](10-state-machine.md) | State machine cho issue, translation, sync job, comment, attachment, mapping gap và anomaly block. |

## Inbound và outbound

| File | Scope |
| --- | --- |
| [03-backlog-ingestion.md](03-backlog-ingestion.md) | Cách Backlog được ingest vào CIS, mapping field và các trường hợp đặc biệt. |
| [04-jira-ingestion.md](04-jira-ingestion.md) | Cách Jira update vào CIS, cách issue đã duyệt được push từ CIS lên Jira và hướng mở rộng sync ngược về Backlog. |
| [06-sync-engine.md](06-sync-engine.md) | Worker xử lý job inbound/outbound, conflict detection, API gateway, retry, sync comment và sync journal. |
| [12-webhook-verification.md](12-webhook-verification.md) | Webhook verification cho Backlog/Jira: raw body, token, response code, dedupe và security logging. |

## AI, review và safety

| File | Scope |
| --- | --- |
| [05-translation-pipeline.md](05-translation-pipeline.md) | Pipeline dịch bằng AI, review bản dịch, học từ lịch sử review và quality metrics. |
| [07-mapping-learning.md](07-mapping-learning.md) | Cơ chế học mapping giữa Backlog, CIS và Jira cho issue type, status và các field cần chuẩn hóa. |
| [08-anomaly-detection.md](08-anomaly-detection.md) | Phát hiện batch update, duplicate, field change bất thường, routing mismatch, low confidence, mapping gap và sync failure chain. |

## Runtime, API và kế hoạch triển khai

| File | Scope |
| --- | --- |
| [09-runtime-config.md](09-runtime-config.md) | Cấu hình runtime MVP: PM2, env vars, SQLite/storage path, credential policy, admin bootstrap và migration. |
| [11-api-contract.md](11-api-contract.md) | API contract cho Admin UI và Codex operation: envelope, error, auth, pagination, endpoint groups và dry-run response. |
| [implement-interview.md](implement-interview.md) | Quyết định triển khai đã chốt từ interview với người dùng. |
| [plans/README.md](plans/README.md) | Kế hoạch phát triển kế thừa theo 3 phiên bản Lite, Medium và Full. |
