# Anomaly Rules

## Ý nghĩa business

Anomaly không chỉ là log kỹ thuật. Nó là tín hiệu để đội vận hành dừng lại và đánh giá rủi ro trước khi tiếp tục.

## Các nhóm anomaly business hay gặp

- `mapping gap`
- `translation low confidence`
- `unusual field change`
- `sync failure chain`
- `routing mismatch`

## Quy tắc xử lý

- `open`: chưa được giải quyết, có thể đang block.
- `investigating`: đang được xem xét.
- `ignore`: chấp nhận rủi ro và cho phép đi tiếp nếu hệ thống cho phép.
- `resolve`: đã xử lý hoặc đã xác nhận không còn là vấn đề.

## Nguyên tắc vận hành

- Không nên ignore anomaly chỉ để đẩy nhanh sync.
- Resolve nên dựa trên một thay đổi hoặc xác nhận cụ thể.
- Nếu anomaly lặp lại nhiều lần, cần xem lại rule, mapping hoặc workflow liên quan.
