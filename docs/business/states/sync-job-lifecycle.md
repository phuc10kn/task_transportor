# Sync Job Lifecycle

## Trạng thái business điển hình

- Pending
- Running
- Success
- Retry scheduled
- Failed
- Cancelled

## Diễn giải từng trạng thái

### Pending

Job đã được tạo và đang chờ được xử lý.

### Running

Job đang được worker hoặc đường xử lý tương ứng thực thi.

### Success

Job hoàn tất thành công.

### Retry scheduled

Job chưa thành công nhưng hệ thống hoặc người vận hành dự kiến sẽ chạy lại.

### Failed

Job không hoàn tất và cần được xem xét tiếp.

### Cancelled

Job không còn nên tiếp tục xử lý trong ngữ cảnh hiện tại.

## Ghi chú

Job lifecycle dùng để trả lời câu hỏi vận hành: việc này đang chờ, đang chạy, đã xong hay cần retry.
