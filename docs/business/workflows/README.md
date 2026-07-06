# Business Workflows

Folder này gom các workflow nghiệp vụ hiện tại của `task_transportor`.

Mỗi file mô tả một workflow theo góc nhìn:

- use case nghiệp vụ tương ứng là gì;
- ai là người hoặc hệ thống tham gia;
- mục tiêu nghiệp vụ là gì;
- đầu vào và đầu ra nghiệp vụ là gì;
- khi nào workflow được coi là hoàn tất;
- các tình huống cần chặn hoặc review.

## Danh sách workflow

### Foundation

1. [usecase-map.md](usecase-map.md) - bản đồ use case nghiệp vụ tổng hợp.
2. [admin-login.md](admin-login.md) - đăng nhập quản trị vào hệ thống.
3. [project-configuration.md](project-configuration.md) - tạo hoặc chỉnh project config.
4. [project-sync-control.md](project-sync-control.md) - bật hoặc tắt sync cho project.

### Ingestion

5. [backlog-one-issue-ingest.md](backlog-one-issue-ingest.md) - kéo một issue từ Backlog vào CIS.
6. [backlog-project-ingest.md](backlog-project-ingest.md) - kéo theo phạm vi project từ Backlog vào CIS.
7. [scheduled-backlog-monitoring.md](scheduled-backlog-monitoring.md) - hệ thống tự quét Backlog theo lịch.
8. [issue-review-entry.md](issue-review-entry.md) - mở và tra cứu một issue trong CIS để bắt đầu xử lý.

### Review And Preparation

9. [translation-review.md](translation-review.md) - tạo và review bản dịch trước khi dùng cho vận hành.
10. [issue-preparation-for-jira.md](issue-preparation-for-jira.md) - chuẩn hóa issue trong CIS trước khi sync Jira.
11. [mapping-approval.md](mapping-approval.md) - review và approve mapping trước sync.
12. [anomaly-handling.md](anomaly-handling.md) - xem, ignore hoặc resolve anomaly.

### Operations And Delivery

13. [jira-sync-preview.md](jira-sync-preview.md) - xem trước payload Jira và kiểm tra điều kiện sync.
14. [jira-sync-publish.md](jira-sync-publish.md) - sync issue từ CIS sang Jira.
15. [dashboard-monitoring.md](dashboard-monitoring.md) - theo dõi trạng thái vận hành từ dashboard.
16. [failed-job-retry.md](failed-job-retry.md) - retry job lỗi sau khi xác định nguyên nhân.
17. [attachment-download-retry.md](attachment-download-retry.md) - retry tải attachment bị fail hoặc pending.
18. [audit-and-journal-review.md](audit-and-journal-review.md) - xem audit hoặc sync journal để tra cứu lịch sử xử lý.

## Ghi chú

- Các workflow ở đây đang phản ánh trạng thái hiện tại của dự án.
- Webhook inbound chưa được ghi thành business workflow chính vì vẫn là scope phase sau.
