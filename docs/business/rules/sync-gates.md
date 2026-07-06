# Sync Gates

## Mục đích

File này chốt các điều kiện business để một issue được phép đi sang bước sync thật.

## Một issue chỉ nên sync thật khi

- project cho phép sync;
- dữ liệu canonical đã sẵn sàng;
- mapping cần thiết đã có;
- anomaly block đã được xử lý;
- dry-run còn mới;
- credential và config đích hợp lệ.

## Một issue có thể được preview nhưng chưa được sync thật khi

- canonical data đã đủ để build payload;
- nhưng vẫn còn missing mapping;
- hoặc còn anomaly cần quyết định;
- hoặc sync state chưa phù hợp để publish.

## Một issue nên bị chặn khi

- còn missing mapping;
- còn anomaly critical hoặc open chưa có quyết định;
- dry-run đã stale;
- trạng thái sync hoặc trạng thái nghiệp vụ chưa phù hợp.

## Ví dụ các block business điển hình

- Dữ liệu đã vào CIS nhưng chưa được chuẩn hóa đủ.
- Bản translation quan trọng chưa được chốt.
- Mapping issue type hoặc status chưa có quyết định.
- Dry-run được tạo trước khi canonical issue bị sửa lại.

## Nguyên tắc

- Chặn sync là cơ chế an toàn, không phải dấu hiệu hệ thống “làm khó”.
- Mục tiêu của sync gate là ngăn publish sai, không phải tối đa hóa số lượng sync bằng mọi giá.
