# Business Decisions

## Các quyết định nền

### 1. CIS là trung tâm vận hành

- Hệ thống không coi `Backlog -> Jira` là đường sync thẳng.
- Mọi issue cần đi qua CIS để lưu snapshot, chuẩn hóa dữ liệu, review và audit.
- Quyết định này giúp sau này mở rộng thêm nguồn hoặc đích mà không phải đổi ngôn ngữ vận hành.

### 2. Người vận hành vẫn là người quyết định cuối

- AI chỉ hỗ trợ translation, gợi ý và tăng tốc review.
- Quyền approve dữ liệu canonical, mapping và publish thật vẫn thuộc đội vận hành.
- Điều này đặc biệt quan trọng khi dữ liệu nguồn mơ hồ hoặc có rủi ro nghiệp vụ.

### 3. Dry-run là cổng an toàn mặc định trước khi publish thật

- Trước khi sync Jira thật, hệ thống cần có bước preview payload và kiểm tra điều kiện.
- Dry-run giúp phát hiện thiếu mapping, lỗi field và rule Jira sớm hơn.
- Mọi workflow outbound nên giữ khái niệm preview như một cổng kiểm soát chuẩn.

### 4. Mapping và anomaly là hai lớp chặn độc lập

- Mapping trả lời câu hỏi dữ liệu đã đổi sang ngôn ngữ target đủ chưa.
- Anomaly trả lời câu hỏi có dấu hiệu rủi ro nào cần con người xem lại không.
- Một issue chỉ nên được xem là ready khi cả hai lớp này không còn chặn.

### 5. Attachment có vòng đời riêng

- Attachment quan trọng nhưng không phải lúc nào cũng nên làm fail toàn bộ ingest của issue.
- Hệ thống cần cho phép metadata issue tiếp tục đi vào CIS trong khi attachment được retry riêng.
- Quyết định này giúp không đánh mất tiến độ review chỉ vì lỗi tải file tạm thời.

## Hệ quả lên tài liệu business

- Use case phải xoay quanh CIS thay vì mô tả sync trực tiếp giữa hai hệ thống ngoài.
- Workflow phải thể hiện các cổng review, dry-run, anomaly và retry như một phần chuẩn của vận hành.
- Rules và states phải đủ rõ để giải thích vì sao issue được đi tiếp hoặc bị chặn.
