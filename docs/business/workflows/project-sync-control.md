# Business Workflow - Bật Hoặc Tắt Sync Cho Project

## Mục tiêu nghiệp vụ

Cho phép người vận hành quyết định một project có được phép tiếp tục pull hoặc sync trong thời điểm hiện tại hay không.

## Use case

- Tên use case: `Bật hoặc tắt sync cho project`
- Mục tiêu: kiểm soát vận hành theo project mà không cần xóa cấu hình
- Actor khởi tạo: `Admin vận hành`
- Kết quả thành công: project chuyển sang trạng thái sync-enabled hoặc disabled đúng chủ ý

## Actor

- Chính: `Admin vận hành`

## Khi nào dùng

- Tạm dừng project đang lỗi hoặc đang kiểm tra.
- Bật lại project sau khi đã xử lý xong sự cố.

## Đầu vào nghiệp vụ

- Một project đã tồn tại.
- Quyết định bật hoặc tắt sync.

## Kết quả nghiệp vụ

- Trạng thái vận hành của project được cập nhật.
- Các workflow downstream tôn trọng trạng thái mới.

## Điều kiện hoàn tất

- Trạng thái project được lưu và phản ánh đúng khi đọc lại.

## Ngoại lệ nghiệp vụ

- Project không tồn tại.
- Thay đổi trạng thái nhưng còn job cũ cần xử lý thủ công.

## Biểu đồ business workflow

```mermaid
flowchart LR
  A[Admin vận hành] --> B[Chọn project]
  B --> C[Bật hoặc tắt sync]
  C --> D[Hệ thống cập nhật trạng thái project]
  D --> E[Project vận hành theo trạng thái mới]
```
