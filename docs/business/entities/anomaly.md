# Entity - Anomaly

## Vai trò

Anomaly là tín hiệu bất thường được ghi lại để đội vận hành đánh giá. Nó là lớp cảnh báo giúp CIS không đẩy dữ liệu thiếu tin cậy đi quá xa trong pipeline.

## Business quan tâm điều gì ở Anomaly

- Anomaly này chỉ để cảnh báo hay đang chặn issue.
- Đã có quyết định ignore, accept risk hay resolve tận gốc chưa.
- Anomaly bắt nguồn từ dữ liệu nguồn, translation, mapping hay outbound target.
- Sau khi xử lý anomaly thì có cần retry bước nào không.

## Tình huống thường gặp

- Title hoặc description trống sau normalize.
- Mapping chưa tìm được giá trị target hợp lệ.
- Jira trả lỗi rule nghiệp vụ mà CIS chưa dự đoán trước.
- Attachment quan trọng bị thiếu nên đội vận hành chưa dám publish.

## Liên kết liên quan

- Use case: [../usecases/monitor-and-recover.md](../usecases/monitor-and-recover.md)
- Workflow: [../workflows/anomaly-handling.md](../workflows/anomaly-handling.md)
- Rule: [../rules/anomaly-rules.md](../rules/anomaly-rules.md)
- State: [../states/anomaly-lifecycle.md](../states/anomaly-lifecycle.md)
