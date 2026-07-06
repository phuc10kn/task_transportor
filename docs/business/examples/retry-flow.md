# Example - Retry Flow

## Bối cảnh

Một job outbound hoặc inbound fail nhưng có khả năng phục hồi.

## Dòng chảy

1. Job sync hoặc ingest fail do lỗi tạm thời.
2. Admin mở dashboard hoặc journal để xem nguyên nhân.
3. Admin xử lý nguyên nhân gốc, ví dụ config, credential hoặc timing.
4. Admin retry job hoặc retry attachment phù hợp.
5. Hệ thống chạy lại bước xử lý.
6. Kết quả mới được ghi lại vào job state và journal.

## Ý nghĩa

Retry không phải hành động máy móc. Nó là một quyết định recovery có chủ đích dựa trên thông tin vận hành.
