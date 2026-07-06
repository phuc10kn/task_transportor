# Use Case - Access And Project Administration

## Mục tiêu

Cho phép admin vào hệ thống và duy trì project config ở trạng thái vận hành được.

## Bao gồm

- Đăng nhập quản trị.
- Tạo hoặc chỉnh project config.
- Bật hoặc tắt sync cho project.

## Actor chính

- `Admin vận hành`

## Đầu vào nghiệp vụ

- Tài khoản admin hợp lệ.
- Thông tin cấu hình project.
- Quyết định bật hoặc tắt sync theo bối cảnh vận hành.

## Kết quả thành công

- Admin có thể truy cập hệ thống.
- Project có cấu hình đủ để pull, review và sync.
- Trạng thái vận hành của project được kiểm soát rõ ràng.

## Điều kiện hoàn tất

- Admin đăng nhập được.
- Project config lưu thành công và đọc lại đúng.
- Trạng thái sync của project phản ánh đúng quyết định vận hành.

## Điểm cần lưu ý

- Dừng sync không đồng nghĩa xóa project.
- Project config là nền cho nhiều use case khác; nếu cấu hình sai, các workflow downstream sẽ fail hoặc block.

## Workflow liên quan

- [../workflows/admin-login.md](../workflows/admin-login.md)
- [../workflows/project-configuration.md](../workflows/project-configuration.md)
- [../workflows/project-sync-control.md](../workflows/project-sync-control.md)
