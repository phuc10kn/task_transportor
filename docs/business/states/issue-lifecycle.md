# Issue Lifecycle

## Trạng thái business điển hình

- Mới vào CIS
- Đang review hoặc chuẩn bị
- Sẵn sàng preview
- Sẵn sàng sync
- Đã sync
- Cần cập nhật lại
- Đang conflict hoặc bị block

## Diễn giải từng trạng thái

### Mới vào CIS

Issue vừa được ingest, dữ liệu đã có mặt trong hệ thống nhưng chưa chắc đã đủ để publish.

### Đang review hoặc chuẩn bị

Issue đang trải qua các bước như translation review, canonical edit, mapping approval hoặc anomaly handling.

### Sẵn sàng preview

Issue đủ dữ liệu để build payload preview, nhưng chưa chắc đã đủ điều kiện sync thật.

### Sẵn sàng sync

Issue đã pass các gate business cần thiết và có thể được publish sang Jira.

### Đã sync

Issue đã được publish thành công sang Jira ở trạng thái hiện tại.

### Cần cập nhật lại

Issue đã từng sync nhưng dữ liệu canonical hoặc context vận hành đã thay đổi, nên cần preview hoặc sync lại.

### Đang conflict hoặc bị block

Issue có anomaly, missing mapping, stale preview hoặc trạng thái vận hành chưa cho phép đi tiếp.

## Ghi chú

Issue lifecycle business không chỉ phản ánh source status, mà phản ánh trạng thái vận hành của issue trong CIS.
