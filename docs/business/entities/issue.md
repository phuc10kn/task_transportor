# Entity - Issue

## Vai trò

Issue là đối tượng vận hành trung tâm trong CIS. Hầu hết workflow business đều bắt đầu, đi ngang qua hoặc kết thúc ở issue.

Issue là nơi nối các lớp dữ liệu:

- source snapshot lấy từ Backlog;
- canonical data mà đội vận hành tin dùng;
- translation draft và review state;
- mapping context để chuẩn bị outbound;
- anomaly, sync job và journal liên quan.

## Business quan tâm điều gì ở Issue

- Issue đã được ingest đầy đủ chưa.
- Dữ liệu canonical đã đủ tin cậy để chỉnh sửa và review chưa.
- Có field nào còn thiếu mapping hoặc còn anomaly block hay không.
- Issue đã sẵn sàng preview Jira hay vẫn đang nằm ở bước chuẩn bị.
- Lịch sử các lần retry, publish và thất bại đang nói lên điều gì.

## Câu hỏi vận hành thường gặp

- Issue này đang kẹt ở đâu.
- Kẹt do dữ liệu nguồn, do translation, do mapping hay do Jira.
- Có thể cho issue đi preview hoặc publish thật ngay bây giờ không.
- Nếu retry thì rủi ro là gì và có cần chỉnh dữ liệu trước không.

## Dữ liệu business tối thiểu nên có

- định danh source và định danh nội bộ;
- nguồn ingest tạo ra issue này;
- canonical title, description và field quan trọng;
- trạng thái review, translation và sync;
- danh sách comment, attachment, anomaly liên quan;
- lịch sử journal để đội vận hành tra cứu.

## Liên kết liên quan

- Use case: [../usecases/ingest-from-backlog.md](../usecases/ingest-from-backlog.md)
- Use case: [../usecases/issue-preparation.md](../usecases/issue-preparation.md)
- Use case: [../usecases/publish-to-jira.md](../usecases/publish-to-jira.md)
- State: [../states/issue-lifecycle.md](../states/issue-lifecycle.md)
- Example: [../examples/happy-path.md](../examples/happy-path.md)
