# Entity - Project

## Vai trò

Project là đơn vị cấu hình vận hành cao nhất mà đội admin làm việc cùng trong repo hiện tại.

Một project gom toàn bộ ngữ cảnh cần thiết để CIS biết:

- lấy dữ liệu từ đâu;
- chuẩn hóa theo rule nào;
- review và approve theo cổng nào;
- sync ra Jira như thế nào.

## Business quan tâm điều gì ở Project

- Project đã được kết nối nguồn Backlog hợp lệ chưa.
- Project đã có cấu hình Jira đích chưa.
- Project có bật hay tắt từng kiểu ingest và sync hay không.
- Project dùng rule translation, mapping và review nào.
- Project đang ở trạng thái sẵn sàng vận hành hay chỉ mới cấu hình dở.

## Dữ liệu business tối thiểu nên có

- định danh project nội bộ trong CIS;
- tên hiển thị để đội vận hành nhận diện;
- thông tin nguồn Backlog đang gắn;
- thông tin đích Jira đang gắn;
- các cờ bật tắt cho manual pull, project pull, scheduled pull, dry-run và publish thật;
- policy review hoặc approval liên quan.

## Tình huống thường gặp

- Tạo project mới để onboard một nhóm backlog mới.
- Tạm dừng sync outbound vì mapping chưa ổn.
- Bật scheduled pull sau khi manual pull đã ổn định.
- Chỉnh rule translation cho một project có ngôn ngữ đầu vào đặc thù.

## Liên kết liên quan

- Use case: [../usecases/access-and-project-admin.md](../usecases/access-and-project-admin.md)
- Workflow: [../workflows/project-configuration.md](../workflows/project-configuration.md)
- Workflow: [../workflows/project-sync-control.md](../workflows/project-sync-control.md)
- Integration: [../integrations/backlog.md](../integrations/backlog.md)
- Integration: [../integrations/jira.md](../integrations/jira.md)
