# Actors And Roles

## Actor chính

### Admin vận hành

- Đăng nhập hệ thống.
- Quản lý project config.
- Pull dữ liệu vào CIS.
- Review translation, mapping, anomaly.
- Chạy dry-run và sync Jira.
- Theo dõi dashboard, retry job và xem audit.

Admin vận hành là actor business quan trọng nhất ở trạng thái hiện tại. Đây là người chịu trách nhiệm quyết định:

- khi nào pull dữ liệu;
- khi nào dữ liệu đã đủ tốt để publish;
- khi nào nên retry, ignore hay resolve một bất thường.

### Scheduler nội bộ

- Tự động quét Backlog theo cấu hình project.
- Tạo candidate ingest định kỳ.

Scheduler không ra quyết định business mới. Nó chỉ kích hoạt các luồng đã được cấu hình sẵn.

### Backlog

- Nguồn dữ liệu inbound chính ở giai đoạn hiện tại.

Business xem Backlog là nơi phát sinh issue nguồn và là hệ thống cần được đọc một cách nhất quán.

### Jira

- Hệ thống đích chính cho outbound ở giai đoạn hiện tại.

Business xem Jira là nơi nhận dữ liệu đã được CIS chuẩn bị và kiểm soát.

## Actor phụ theo kỹ thuật

- AI transport: hỗ trợ tạo draft translation.
- Worker nội bộ: thực thi các bước nặng hoặc bất đồng bộ.

## Vai trò chưa phải actor chính

- `AI transport` không phải actor ra quyết định.
- `Worker nội bộ` không phải actor business, mà là cơ chế thực thi.
- `Project config` không phải actor, mà là thực thể điều khiển hành vi của hệ thống.
