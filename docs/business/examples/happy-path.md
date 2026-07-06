# Example - Happy Path

## Bối cảnh

Một issue từ Backlog cần được đưa sang Jira theo đường vận hành chuẩn.

## Dòng chảy

1. Admin đăng nhập.
2. Admin pull một issue từ Backlog vào CIS.
3. Admin mở issue trong CIS để xem dữ liệu nguồn và trạng thái hiện tại.
4. Nếu issue cần translation, admin tạo draft và review bản dịch.
5. Nếu canonical data chưa ổn, admin chỉnh issue trong CIS.
6. Nếu thiếu mapping hoặc có anomaly, admin xử lý trước.
7. Admin chạy dry-run Jira để xem preview payload và điều kiện sync.
8. Khi mọi gate đã pass, admin sync issue sang Jira.
9. CIS ghi nhận trạng thái sync và lịch sử xử lý mới nhất.

## Ý nghĩa

Đây là ví dụ điển hình cho thấy CIS đóng vai trò trung tâm trước khi publish ra target.
