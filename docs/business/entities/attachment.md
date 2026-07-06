# Entity - Attachment

## Vai trò

Attachment là file hoặc metadata file gắn với issue, thường mang giá trị chứng cứ, log, ảnh chụp hoặc tài liệu bổ sung.

## Business quan tâm điều gì ở Attachment

- Attachment đã tải về CIS thành công hay chưa.
- Nếu tải lỗi thì đó là lỗi tạm thời hay lỗi cần can thiệp thủ công.
- Attachment nào là bắt buộc để người review quyết định chính xác.
- Attachment nào cần được upload sang Jira để giữ trọn ngữ cảnh.

## Tình huống vận hành thường gặp

- Metadata issue đã ingest xong nhưng attachment vẫn pending tải về.
- Một vài attachment lỗi mạng nhưng issue vẫn có thể tiếp tục review.
- Khi publish sang Jira, attachment cần retry riêng mà không làm fail toàn bộ logic ingest ban đầu.

## Liên kết liên quan

- Workflow: [../workflows/backlog-project-ingest.md](../workflows/backlog-project-ingest.md)
- Workflow: [../workflows/attachment-download-retry.md](../workflows/attachment-download-retry.md)
- Rule: [../rules/exception-handling.md](../rules/exception-handling.md)
