# Exception Handling

## Các ngoại lệ business thường gặp

- Thiếu config project.
- Thiếu credential.
- Missing mapping.
- Anomaly đang block.
- Dry-run stale.
- Sync fail do hệ đích từ chối.
- Attachment tải không thành công.

## Cách phản ứng ở mức business

- `Thiếu config` -> quay lại project administration.
- `Missing mapping` -> chuyển sang workflow mapping approval.
- `Anomaly block` -> chuyển sang workflow anomaly handling.
- `Dry-run stale` -> chạy preview lại trước khi publish.
- `Sync fail` -> xem dashboard hoặc journal rồi mới retry.
- `Attachment fail` -> retry attachment riêng nếu không cần re-ingest toàn bộ issue.

## Nguyên tắc

- Không giả vờ workflow hoàn tất nếu còn block quan trọng.
- Ưu tiên trả về tín hiệu rõ cho người vận hành thay vì che lỗi.
- Retry chỉ nên dùng khi đã hiểu hoặc xử lý được nguyên nhân.
