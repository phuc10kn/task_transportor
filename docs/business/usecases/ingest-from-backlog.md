# Use Case - Ingest From Backlog

## Mục tiêu

Đưa dữ liệu issue từ Backlog vào CIS theo từng issue, theo project hoặc theo lịch.

## Bao gồm

- Pull một issue.
- Pull theo project.
- Scheduled pull.
- Mở và tra cứu issue sau khi đã vào CIS.

## Actor chính

- `Admin vận hành`
- `Scheduler nội bộ`

## Đầu vào nghiệp vụ

- Project có cấu hình nguồn hợp lệ.
- Dữ liệu Backlog truy cập được.
- Có một trong các trigger: pull một issue, pull theo project hoặc scheduled pull.

## Kết quả thành công

- CIS nhận được issue cần xử lý.
- Dữ liệu có thể được review và chuẩn bị downstream.

## Điều kiện hoàn tất

- Issue hoặc candidate ingest đã được tạo đúng scope.
- Dữ liệu vào CIS đủ để đội vận hành bắt đầu review hoặc chuẩn bị tiếp.

## Điểm cần lưu ý

- Ingest thành công không đồng nghĩa issue đã sẵn sàng sync Jira.
- Attachment fail có thể là lỗi cục bộ, không nhất thiết làm fail toàn bộ issue.
- Scheduled pull là cơ chế tự động hóa của cùng use case, không phải use case business hoàn toàn mới.

## Workflow liên quan

- [../workflows/backlog-one-issue-ingest.md](../workflows/backlog-one-issue-ingest.md)
- [../workflows/backlog-project-ingest.md](../workflows/backlog-project-ingest.md)
- [../workflows/scheduled-backlog-monitoring.md](../workflows/scheduled-backlog-monitoring.md)
- [../workflows/issue-review-entry.md](../workflows/issue-review-entry.md)
