# Example - Blocked Sync

## Bối cảnh

Issue đã vào CIS nhưng chưa đủ điều kiện sync thật.

## Dòng chảy

1. Issue đã vào CIS.
2. Admin chạy dry-run.
3. Hệ thống báo missing mapping hoặc anomaly block.
4. Admin chuyển sang workflow mapping approval hoặc anomaly handling.
5. Sau khi block được xử lý, admin chạy dry-run lại.
6. Chỉ sync thật khi preview mới đã pass và không còn block quan trọng.

## Ý nghĩa

Ví dụ này cho thấy dry-run không chỉ là preview, mà còn là cổng kiểm soát trước outbound.
