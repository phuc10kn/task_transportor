# Product Scope

## Hệ thống này giải quyết gì

`task_transportor` là Central Sync Hub giúp đội vận hành đưa dữ liệu issue từ hệ thống nguồn vào CIS, chuẩn hóa chúng, rồi đẩy dữ liệu đã được kiểm soát sang hệ thống đích.

## Bài toán vận hành đang tồn tại

Trước khi có CIS làm trung tâm, dữ liệu giữa source và target thường gặp các vấn đề:

- phải copy hoặc chỉnh tay nhiều lần;
- khó biết dữ liệu nào mới là dữ liệu nên dùng để publish;
- thiếu lớp review trước khi ghi sang hệ đích;
- khi lỗi xảy ra khó truy được ai đã làm gì và cần retry ở đâu;
- translation, mapping và exception handling bị phân tán theo từng thao tác nhỏ.

## Giá trị nghiệp vụ chính

- Giảm thao tác thủ công giữa Backlog và Jira.
- Tạo một chỗ trung tâm để review, chuẩn hóa và kiểm soát trước khi publish.
- Giữ lịch sử vận hành để debug, retry và audit.
- Cho phép AI hỗ trợ translation và mapping nhưng không thay người ra quyết định cuối cùng.

## Kết quả mà business mong muốn

- Một issue từ source có thể đi vào CIS theo cách lặp lại được.
- Đội vận hành có thể nhìn rõ dữ liệu gốc, dữ liệu canonical và dữ liệu sắp publish.
- Những điểm mơ hồ như translation, mapping hay anomaly được giải quyết trước khi sync thật.
- Khi sync fail, hệ thống vẫn giữ đủ dấu vết để retry hoặc ra quyết định tiếp theo.

## Scope hiện tại

- Backlog -> CIS là inbound chính.
- CIS -> Jira là outbound chính.
- Translation, mapping, anomaly và dry-run là các lớp kiểm soát nằm giữa.

## Đối tượng business hiện đang xử lý

- `Project`
- `Issue`
- `Comment`
- `Attachment`
- `Translation`
- `Mapping`
- `Anomaly`
- `Sync job`
- `Sync journal`

## Ngoài scope hiện tại

- Webhook inbound đầy đủ cho mọi hướng.
- CIS -> Backlog.
- Hai chiều hoàn chỉnh cho mọi loại object.
- Fully automated publish không cần review.

## Ranh giới quan trọng

- Hệ thống hiện chưa coi AI là người quyết định cuối cùng.
- Hệ thống hiện chưa bỏ qua CIS để sync trực tiếp từ source sang target.
- Hệ thống hiện chưa xem mọi lỗi attachment là lý do phải fail toàn bộ issue ingest.
