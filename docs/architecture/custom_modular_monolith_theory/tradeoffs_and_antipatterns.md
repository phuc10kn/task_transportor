# Trade-offs And Antipatterns

## Trade-off chấp nhận được

- Một application database nhưng ownership vẫn rõ.
- Một số read-only snapshot có allowlist.
- Compatibility wrapper mỏng trong giai đoạn migration.

## Anti-pattern cần tránh

### Proxy API mờ ownership

Module A thêm method chỉ để gọi hộ module B.

### Shared database thành shared ownership

Consumer tự `UPDATE` hoặc `DELETE` state của owner khác.

### Read exception mở rộng vô tội vạ

Allowlist không rõ tier, không rõ lý do, không có review.

### `shared/` thành bãi chứa business logic

Đưa rule domain vào utility chung để né boundary.

### External adapter tự quyết định business state

Client, repository hoặc transport tự set trạng thái nghiệp vụ.

## Câu hỏi review nhanh

1. Owner thật của state này là ai?
2. Tại sao read exception này cần tồn tại?
3. Có đang biến compatibility wrapper thành owner giả không?
4. Có đang lấy lý do "cùng database" để bỏ qua ownership không?
