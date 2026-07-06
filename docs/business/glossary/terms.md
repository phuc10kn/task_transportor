# Terms

## Thuật ngữ chính

- `CIS`: Central Issue Store hoặc Central Sync Hub core, nơi giữ dữ liệu issue theo ngữ cảnh vận hành.
- `Canonical data`: dữ liệu đã được CIS xác nhận làm giá trị vận hành hiện tại.
- `Source snapshot`: dữ liệu giữ nguyên theo hệ thống nguồn.
- `Dry-run`: bước xem trước payload và kiểm tra điều kiện trước khi sync thật.
- `Translation review`: bước tạo và duyệt bản dịch trước khi dùng cho vận hành.
- `Mapping`: rule chuyển giá trị giữa source, canonical CIS và target.
- `Anomaly`: tín hiệu bất thường cần người vận hành xem xét.
- `Sync journal`: lịch sử các lần xử lý inbound hoặc outbound.
- `Retry`: chạy lại một bước đã fail sau khi xử lý nguyên nhân.

## Các cặp khái niệm dễ nhầm

- `Issue` khác `source snapshot`:
  Issue là đối tượng vận hành tổng hợp trong CIS, còn source snapshot chỉ là ảnh chụp dữ liệu gốc.
- `Canonical data` khác `payload preview`:
  Canonical data là dữ liệu CIS đang tin dùng, còn payload preview là cách dữ liệu đó sẽ được trình bày cho Jira.
- `Anomaly` khác `error`:
  Error thường là lỗi thực thi cụ thể, còn anomaly là tín hiệu business hoặc chất lượng dữ liệu cần được đánh giá.
- `Retry` khác `re-ingest`:
  Retry là chạy lại một bước hoặc job, còn re-ingest thường kéo lại dữ liệu từ nguồn để làm mới trạng thái.

## Thuật ngữ nên tránh dùng lẫn

- Tránh gọi `source data` là `canonical`.
- Tránh gọi `draft translation` là `approved translation`.
- Tránh gọi mọi lỗi là `anomaly` nếu đó chỉ là lỗi hạ tầng tạm thời chưa cần đánh giá business.
