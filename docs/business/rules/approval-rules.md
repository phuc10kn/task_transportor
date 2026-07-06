# Approval Rules

## Mục đích

Các rule này trả lời câu hỏi: khi nào một quyết định review được xem là đủ để cho phép workflow tiếp theo diễn ra.

## Translation

- Draft translation không tự trở thành canonical outcome.
- Chỉ approve hoặc manual edit mới đủ để dùng bản dịch như reviewed input.

## Mapping

- Mapping mới không nên được dùng cho outbound nếu chưa có quyết định rõ.
- Mapping thiếu hoặc mơ hồ là lý do hợp lệ để chặn dry-run hoặc sync.
- Mapping đã approve mới nên trở thành rule business dùng cho target payload.

## Anomaly

- Anomaly open không nên bị bỏ qua theo mặc định.
- Ignore và resolve phải là hành động có chủ đích của người vận hành.

## Canonical edit

- Chỉnh canonical là quyết định nghiệp vụ của đội vận hành.
- Canonical change có thể làm preview cũ không còn hợp lệ.

## Nguyên tắc chung

- Những gì còn ở trạng thái draft hoặc pending không nên tự được xem là approved.
- Quyết định approval phải tạo ra outcome đủ rõ cho workflow kế tiếp.
