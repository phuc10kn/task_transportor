# Tổng quan tài liệu work

Thư mục này mô tả thiết kế mới cho `task_transportor`: một hub trung gian đồng bộ Backlog và Jira thông qua **Central Issue Store (CIS)**. CIS đóng vai trò single source of truth, giữ nội dung gốc, bản dịch, mapping, trạng thái sync, audit trail và các cảnh báo bất thường.

## Mục tiêu

- Thay thế cách đồng bộ thủ công/CLI bằng luồng webhook + queue + sync engine.
- Tách Backlog và Jira, không để hai hệ thống gọi trực tiếp qua nhau.
- Giữ Backlog là nguồn yêu cầu từ khách hàng, Jira là nơi dev làm việc chính.
- Cho AI tham gia dịch, gợi ý mapping và phát hiện bất thường, nhưng quyết định cuối cùng vẫn qua review/approval của người dùng.
- Tạo lịch sử đồng bộ đầy đủ để debug, retry, rollback và audit.

## Kiến trúc tổng quan

Luồng chính của hệ thống:

```text
Backlog / Jira
      |
      | webhook hoặc manual pull
      v
Central Issue Store
      |
      +--> Translation Pipeline
      +--> Mapping Learning
      +--> Anomaly Detection
      +--> Review / Approval
      |
      | push / dry-run / retry
      v
Jira / Backlog
```

CIS là lớp trung tâm. Mỗi issue, comment, revision, mapping rule, queue item và sync result đều đi qua CIS trước khi được đẩy sang hệ thống khác.

Mô hình chuẩn của toàn bộ tài liệu là **System -> CIS -> System**:

- Inbound: Backlog/Jira gửi webhook hoặc admin chủ động pull dữ liệu về CIS.
- Processing: CIS lưu raw event, chuẩn hóa dữ liệu, dịch, review, học mapping và phát hiện bất thường.
- Outbound: CIS đẩy dữ liệu đã được duyệt sang hệ thống đích, trước mắt là Jira trong MVP.

## Tài liệu trong thư mục

| File | Nội dung |
| --- | --- |
| [01-architecture.md](01-architecture.md) | Kiến trúc Central Sync Hub, nguyên tắc thiết kế và 4 luồng đồng bộ chính. |
| [02-central-issue-store.md](02-central-issue-store.md) | Schema cho CIS: projects, issues, revisions, comments, translation queue, sync journal, mapping rules, anomaly log và webhook events. |
| [03-backlog-ingestion.md](03-backlog-ingestion.md) | Cách Backlog webhook được ingest vào CIS, mapping field và các trường hợp đặc biệt. |
| [04-jira-ingestion.md](04-jira-ingestion.md) | Cách Jira update vào CIS, cách issue đã duyệt được push từ CIS lên Jira và hướng mở rộng sync ngược về Backlog. |
| [05-translation-pipeline.md](05-translation-pipeline.md) | Pipeline dịch bằng AI, review bản dịch, học từ lịch sử review và quality metrics. |
| [06-sync-engine.md](06-sync-engine.md) | Worker xử lý job inbound/outbound, conflict detection, API gateway, retry, sync comment và sync journal. |
| [07-mapping-learning.md](07-mapping-learning.md) | Cơ chế học mapping giữa Backlog, CIS và Jira cho issue type, status và các field cần chuẩn hóa. |
| [08-anomaly-detection.md](08-anomaly-detection.md) | Lớp bảo vệ phát hiện batch update, duplicate, field change bất thường, routing mismatch, low confidence, mapping gap và sync failure chain. |
| [09-runtime-config.md](09-runtime-config.md) | Cấu hình runtime MVP: PM2, env vars, SQLite/storage path, credential policy, admin bootstrap và migration. |
| [10-state-machine.md](10-state-machine.md) | State machine cho issue, translation, sync job, comment, attachment, mapping gap và anomaly block. |
| [11-api-contract.md](11-api-contract.md) | API contract cho Admin UI và Codex operation: envelope, error, auth, pagination, endpoint groups và dry-run response. |
| [12-webhook-verification.md](12-webhook-verification.md) | Webhook verification cho Backlog/Jira: raw body, token, response code, dedupe và security logging. |

## Thứ tự đọc để nắm nhanh

1. Đọc [01-architecture.md](01-architecture.md) để nắm model tổng thể.
2. Đọc [02-central-issue-store.md](02-central-issue-store.md) để hiểu data model trung tâm.
3. Đọc [03-backlog-ingestion.md](03-backlog-ingestion.md) và [04-jira-ingestion.md](04-jira-ingestion.md) để hiểu luồng System -> CIS.
4. Đọc [05-translation-pipeline.md](05-translation-pipeline.md), [07-mapping-learning.md](07-mapping-learning.md) và [08-anomaly-detection.md](08-anomaly-detection.md) để hiểu các lớp AI/review/safety.
5. Đọc [06-sync-engine.md](06-sync-engine.md) để hiểu cách job inbound/outbound được xử lý idempotent, transactional và có retry.
6. Đọc [09-runtime-config.md](09-runtime-config.md), [10-state-machine.md](10-state-machine.md), [12-webhook-verification.md](12-webhook-verification.md) và [11-api-contract.md](11-api-contract.md) trước khi implement backend/API.

## Trạng thái thiết kế

Đây là bộ tài liệu thiết kế/working notes. Các file `09` đến `12` đã bổ sung implementation spec cho runtime, state machine, webhook verification và API contract. Khi bắt đầu code, vẫn nên rà lại:

- Chi tiết payload thực tế của Backlog/Jira sau khi có webhook sample thật.
- Tên model OpenAI cụ thể và prompt/output schema production.
- UI/UX chi tiết cho review queue, mapping approval và anomaly handling.
- Backup/restore SQLite trên server nội bộ.
