# Phiên bản Full

## Mục tiêu

Full mở rộng Medium thành hub đồng bộ hai chiều đầy đủ. Full kế thừa cơ chế pull của Lite, webhook/Jira inbound của Medium, rồi bổ sung CIS -> Backlog, learning, vận hành production và khả năng tích hợp thêm hệ thống ngoài Backlog/Jira.

## Kế thừa từ Medium

Full giữ nguyên:

- Manual/scheduled pull từ Lite.
- Webhook Backlog/Jira từ Medium.
- CIS schema, state machine, mapping/anomaly, sync jobs và sync journal.
- Translation review và dry-run trước outbound sync.
- Attachment file thật Backlog -> CIS -> Jira.

Full chỉ thêm khả năng publish/sync ngược và năng lực vận hành dài hạn.

## Chức năng cần thêm

### 1. CIS -> Backlog

- Sync ngược status/comment từ Jira/CIS về Backlog theo rule.
- Dev comment tiếng Việt được dịch Việt -> Nhật.
- Human review hoặc auto-approve theo confidence/config.
- Attachment Jira -> Backlog nếu project cần.
- Rule theo project: status nào được báo khách hàng, comment nào được publish.

### 2. Translation learning nâng cao

- Học từ lịch sử user edit.
- Project glossary/vocabulary tự cập nhật có review.
- Prompt versioning.
- Quality metrics theo project.
- Re-translate có context từ các bản dịch đã approved.

### 3. Mapping learning nâng cao

- Stale mapping detection.
- Mapping conflict health.
- Confidence decay khi mapping gây conflict.
- Project override sâu hơn trên global mapping.
- Gợi ý mapping theo batch import/project mới.

### 4. Anomaly và safety nâng cao

- AI analysis sâu hơn cho anomaly.
- Tuning threshold theo project.
- Project pause/resume khi sync failure chain vượt ngưỡng.
- Replay raw webhook có kiểm soát.
- Rollback/compensation workflow cho lỗi outbound.

### 5. Vận hành production

- Backup SQLite tự động hoặc migrate sang PostgreSQL nếu volume tăng.
- Tách API/worker nếu cần scale.
- Structured logging tốt hơn.
- Health check endpoint.
- Admin audit report/export.
- Retention cleanup job.

### 6. UI/permission

- Role ngoài admin nếu cần: reviewer, operator, read-only.
- Notification email/Slack/Teams.
- Batch action an toàn hơn.
- Report mapping/translation/sync quality.

### 7. Mở rộng hệ thống

- Thiết kế adapter để thêm Slack, email hoặc hệ thống ticket khác.
- Mapping vẫn qua CIS canonical, không map trực tiếp system-to-system.

## Definition of Done

Full hoàn thành khi:

1. Hệ thống đồng bộ hai chiều có kiểm soát giữa Backlog và Jira.
2. Các publish về Backlog đều qua review/rule rõ ràng.
3. AI hỗ trợ học mapping/translation/anomaly nhưng admin vẫn có quyền quyết định cuối cùng.
4. Có vận hành dài hạn: backup, retention, audit, notification, health và report.
5. Có kiến trúc adapter đủ sạch để thêm hệ thống mới mà không phá CIS.
