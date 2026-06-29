# Tổng quan Central Sync Hub

Thư mục `docs/work` mô tả thiết kế mới cho `task_transportor`: một hub trung gian đồng bộ Backlog và Jira thông qua **Central Issue Store (CIS)**.

CIS đóng vai trò single source of truth, giữ nội dung gốc, bản dịch, mapping, trạng thái sync, audit trail và các cảnh báo bất thường.

## Mục tiêu

- Thay thế cách đồng bộ thủ công/CLI bằng luồng webhook/manual pull + queue + sync engine.
- Tách Backlog và Jira, không để hai hệ thống gọi trực tiếp qua nhau.
- Giữ Backlog là nguồn yêu cầu từ khách hàng, Jira là nơi dev làm việc chính.
- Cho AI tham gia dịch, gợi ý mapping và phát hiện bất thường, nhưng quyết định cuối cùng vẫn qua review/approval của người dùng.
- Tạo lịch sử đồng bộ đầy đủ để debug, retry, rollback và audit.

## Mô hình chuẩn

Mô hình chuẩn của toàn bộ tài liệu là:

```text
System -> CIS -> System
```

- Inbound: Backlog/Jira gửi webhook hoặc admin chủ động pull dữ liệu về CIS.
- Processing: CIS lưu raw event/pull snapshot, chuẩn hóa dữ liệu, dịch, review, học mapping và phát hiện bất thường.
- Outbound: CIS đẩy dữ liệu đã được duyệt sang hệ thống đích.

## Luồng tổng quan

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
