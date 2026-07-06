# Use Case - Monitor And Recover

## Mục tiêu

Cho phép đội vận hành theo dõi sức khỏe hệ thống, retry lỗi và truy vết lịch sử xử lý.

## Bao gồm

- Theo dõi dashboard.
- Retry job lỗi.
- Retry tải attachment.
- Xem audit và sync journal.

## Actor chính

- `Admin vận hành`

## Đầu vào nghiệp vụ

- Dashboard, job state, attachment state, anomaly state và audit history hiện tại.

## Kết quả thành công

- Hệ thống được theo dõi chủ động.
- Lỗi có thể được retry hoặc phân tích mà không mất ngữ cảnh.

## Điều kiện hoàn tất

- Admin biết cần ưu tiên xử lý gì.
- Các lỗi retryable có thể được thử lại một cách có chủ đích.
- Lịch sử vận hành đủ rõ để hỗ trợ quyết định.

## Điểm cần lưu ý

- Monitoring là use case chủ động, không chỉ là “xem cho có”.
- Retry chỉ nên xảy ra sau khi hiểu hoặc xử lý nguyên nhân.
- Audit và journal là công cụ ra quyết định, không chỉ để lưu trữ.

## Workflow liên quan

- [../workflows/dashboard-monitoring.md](../workflows/dashboard-monitoring.md)
- [../workflows/failed-job-retry.md](../workflows/failed-job-retry.md)
- [../workflows/attachment-download-retry.md](../workflows/attachment-download-retry.md)
- [../workflows/audit-and-journal-review.md](../workflows/audit-and-journal-review.md)
