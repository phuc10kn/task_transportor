# TH-OPS-TRACE - Agent Notes

## Short rules

- Side effect phải để lại dấu vết đủ để giải thích.
- Retry phải có nghĩa vận hành, không được là vòng lặp mù.
- Audit/journal phải giúp quyết định retry, recover hoặc dừng.
- Failure không nên bị nuốt mất context.
- Job state không được giả làm business state.

## Common violations

- Chỉ log text tự do mà không có trace phục vụ quyết định.
- Retry vô điều kiện mà không để lại lý do hay ngữ cảnh.
- Dùng job status để suy ra business outcome.
- Nhét schema và backoff detail vào pure theory.

## Review checklist

- Operation này có side effect nào cần trace?
- Có đủ evidence để biết chuyện gì đã xảy ra chưa?
- Retry ở đây có ý nghĩa hay chỉ là lặp lại mù?
- Failure có thể recover hay tối thiểu có thể chẩn đoán không?
- Nội dung đang là recoverability theory hay thực ra là sync-safety gate?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận về retry policy, audit value, hoặc diagnosability.
- Đọc `governance.md` khi theory bắt đầu sa vào schema job/journal cụ thể.
