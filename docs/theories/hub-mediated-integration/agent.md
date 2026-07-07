# TH-HUBFLOW - Agent Notes

## Short rules

- Dữ liệu ngoài phải vào core trước.
- Core hub phải sở hữu processing trung gian, không chỉ relay payload.
- Không cho adapter ngoài tự quyết business state cuối cùng.
- Nếu một flow có thể bỏ qua core mà vẫn “đúng”, hub model đang bị thủng.
- Outbound là bước sau xử lý, không phải phản xạ trực tiếp từ inbound.

## Common violations

- Webhook vào rồi gọi thẳng hệ đích.
- Xem hub như nơi cache tạm mà không giữ state vận hành.
- Đẩy chuẩn hóa, review, mapping decision sang adapter ngoài.
- Dùng tên CIS như bản thân theory thay vì xem nó là app-specific adoption.

## Review checklist

- Inbound này đã vào core trước chưa?
- Core có giữ state/quyết định trung gian hay chỉ relay?
- External adapter có đang sở hữu business outcome không?
- Flow có tạo được audit/control point ở lõi không?
- Nếu thêm hệ mới, model này còn tái dùng được không?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận “đi thẳng cho nhanh”.
- Đọc `governance.md` khi reasoning trượt sang canonical truth hoặc sync gate.
