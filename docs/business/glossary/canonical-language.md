# Canonical Language

## Nguyên tắc gọi tên

- Dùng `source` khi nói về dữ liệu gốc từ hệ thống bên ngoài.
- Dùng `canonical` khi nói về dữ liệu vận hành hiện tại trong CIS.
- Dùng `target` khi nói về dữ liệu sẽ được publish ra hệ thống đích.

## Phân biệt các lớp dữ liệu

- `Backlog data`: dữ liệu lấy trực tiếp từ Backlog.
- `CIS canonical data`: dữ liệu đội vận hành đang dùng để quyết định.
- `Jira payload preview`: bản xem trước dữ liệu sẽ đẩy sang Jira.

## Quy tắc diễn đạt

- Use case business nên nói theo outcome, không nói theo module code.
- Workflow business nên nói theo hành vi của actor và kết quả, không nói theo repository hoặc API ownership.
- Rule business nên nói theo điều kiện và quyết định, không nói theo chi tiết implementation.
- State business nên nói theo ý nghĩa vận hành của trạng thái, không chỉ lặp lại tên field.

## Quy ước ngôn ngữ nên giữ nhất quán

- Dùng `ingest` khi dữ liệu đi từ nguồn vào CIS.
- Dùng `prepare` khi đội vận hành đang làm issue sẵn sàng cho outbound.
- Dùng `preview` hoặc `dry-run` khi chưa publish thật sang Jira.
- Dùng `publish` hoặc `sync outbound` khi ghi thật sang hệ đích.
- Dùng `block` khi một issue chưa được phép đi tiếp vì lý do rõ ràng.
- Dùng `resolve` khi nguyên nhân chặn đã được xử lý.

## Ví dụ diễn đạt tốt hơn

- Thay vì viết `job lỗi`, nên viết `job outbound fail ở bước publish Jira`.
- Thay vì viết `thiếu dữ liệu`, nên viết `thiếu mapping cho priority nên issue chưa qua cổng sync`.
- Thay vì viết `AI xử lý xong`, nên viết `translation draft đã tạo, chờ reviewer duyệt`.
