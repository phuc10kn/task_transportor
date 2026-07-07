# TH-CANON - Agent Notes

## Short rules

- Canonical state là nơi hệ thống tin để vận hành.
- Snapshot nguồn phải giữ riêng khỏi branch canonical.
- Queue, review, journal, job status chỉ là state phụ trợ.
- Chỉ owner canonical mới có quyền mutate operational truth.
- Read model phục vụ tiêu thụ, không được tự nâng thành truth.

## Common violations

- Dùng state từ hệ ngoài như truth cuối cùng mà không materialize vào canonical branch.
- Ghi reviewed result vào queue rồi xem như đã cập nhật canonical.
- Dùng job status hoặc sync status để thay nghĩa business state.
- Viết read model rồi dùng nó như nơi update thật.

## Review checklist

- State này là source snapshot, canonical state, reviewed state hay workflow state?
- Ai là owner được quyền mutate state đó?
- Consumer đang đọc read model hay truth model?
- Có đang dùng state kỹ thuật để thay business meaning không?
- Nếu source thay đổi, hệ thống còn giữ được dấu vết tách biệt không?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận về source-of-truth, fallback order, hay projection.
- Đọc `governance.md` khi nội dung bắt đầu phụ thuộc quá mạnh vào schema cụ thể.
