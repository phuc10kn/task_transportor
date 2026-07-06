# Entity - Comment

## Vai trò

Comment là lớp trao đổi đi kèm issue. Về business, comment giúp giữ ngữ cảnh thảo luận chứ không chỉ là dữ liệu phụ.

## Business quan tâm điều gì ở Comment

- Comment nào cần mang vào CIS để người review hiểu ngữ cảnh issue.
- Comment nào cần translation trước khi dùng tiếp.
- Comment nào nên được sync outbound và comment nào nên bỏ qua.
- Comment có chứa nội dung nhạy cảm, nhiễu hoặc không còn phù hợp để publish hay không.

## Tình huống thường gặp

- Comment tiếng Nhật cần dịch sang ngôn ngữ vận hành chung.
- Comment nội bộ chỉ có giá trị tham khảo nên không publish ra Jira.
- Comment mới phát sinh sau lần ingest trước cần được đồng bộ vào issue hiện có.

## Liên kết liên quan

- Use case: [../usecases/issue-preparation.md](../usecases/issue-preparation.md)
- Workflow: [../workflows/issue-review-entry.md](../workflows/issue-review-entry.md)
- Workflow: [../workflows/translation-review.md](../workflows/translation-review.md)
