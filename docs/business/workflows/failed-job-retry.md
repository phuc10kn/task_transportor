# Business Workflow - Retry Job Lỗi

## Mục tiêu nghiệp vụ

Cho phép người vận hành retry một job lỗi sau khi đã hiểu nguyên nhân và xác nhận có thể chạy lại an toàn.

## Use case

- Tên use case: `Retry job lỗi`
- Mục tiêu: khôi phục tiến trình xử lý thay vì bỏ dở khi lỗi tạm thời hoặc đã được sửa
- Actor khởi tạo: `Admin vận hành`
- Kết quả thành công: job quay lại hàng chờ và có cơ hội hoàn tất thành công

## Actor

- Chính: `Admin vận hành`

## Khi nào dùng

- Job fail do credential, timeout hoặc lỗi tạm thời đã được xử lý.
- Cần chạy lại một bước sync hoặc ingest mà không tạo workflow mới bằng tay.

## Đầu vào nghiệp vụ

- Một job ở trạng thái failed hoặc cần retry thủ công.
- Hiểu biết tối thiểu về nguyên nhân thất bại.

## Kết quả nghiệp vụ

- Job được đưa về trạng thái retryable hoặc pending.
- Hệ thống tiếp tục xử lý lại job đó.

## Điều kiện hoàn tất

- Retry được ghi nhận và job quay lại vòng xử lý hợp lệ.

## Ngoại lệ nghiệp vụ

- Retry khi nguyên nhân gốc chưa được xử lý.
- Retry job sai ngữ cảnh làm lặp lỗi không cần thiết.

## Biểu đồ business workflow

```mermaid
flowchart LR
  A[Admin vận hành] --> B[Xem job lỗi]
  B --> C[Xác định nguyên nhân]
  C --> D[Chọn retry]
  D --> E[Job quay lại hàng chờ xử lý]
```
