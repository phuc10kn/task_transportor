# TH-SYNC-SAFE - Agent Notes

## Short rules

- External write có rủi ro cao, không được coi là bước thường.
- Dry-run phải có giá trị ra quyết định thật.
- Pre-check có quyền chặn publish.
- Preview cũ là bằng chứng hết hạn, không phải bằng chứng hợp lệ.
- Publish thật phải khó hơn preview, không dễ hơn.

## Common violations

- Cho sync thật chạy dù dry-run chưa mới.
- Xem preview chỉ như màn hình xem trước đẹp mắt.
- Bỏ qua mapping gap, anomaly hay readiness vì “đã từng sync được”.
- Nhét payload chi tiết hoặc route cụ thể vào pure theory.

## Review checklist

- Action này có phải outbound external write không?
- Có dry-run hoặc gate tương đương không?
- Preconditions nào có quyền block?
- Preview còn tươi hay đã stale?
- Logic đang nói về safety gate hay thực ra là retry/operation trace?

## Read-more triggers

- Đọc `theory.md` khi có tranh luận “sync luôn cho nhanh”.
- Đọc `governance.md` khi theory bị kéo sang implementation của payload hay retry job.
