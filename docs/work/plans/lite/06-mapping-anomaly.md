# Lite - Mapping và anomaly

## Mapping qua CIS canonical

Lite vẫn phải dùng mapping qua CIS canonical:

```text
Backlog -> CIS -> Jira
```

Không dùng mapping trực tiếp Backlog -> Jira làm nguồn chính.

## Mapping bắt buộc

Mapping bắt buộc cho sync Jira:

- `issue_type`
- `status`
- `priority`
- `user`/`assignee` nếu Jira project yêu cầu trong outbound payload.

Mapping nên chuẩn bị thêm:

- `component`
- category/label/milestone/version nếu dữ liệu Backlog/Jira đã có sẵn.

## Nguồn mapping Lite

- `manual`
- `config_initial`
- `ai_auto` đơn giản nếu dễ làm; nếu chưa làm AI propose thì phải cho admin tạo mapping thủ công.

## Luật dùng mapping

- Chỉ mapping `approval_status = 'approved'` mới được dùng cho sync thật.
- Mapping mới chưa approved phải block sync thật.
- Missing mapping tạo anomaly `mapping_gap`.
- Force approve không được bypass missing required mapping.

Khi thiếu mapping:

1. Tạo hoặc hiển thị mapping proposal/manual mapping form.
2. Tạo anomaly `mapping_gap`.
3. Dry-run trả `can_sync = false`.
4. Sync thật trả lỗi domain rõ, ví dụ `422 MAPPING_REQUIRED`, không gọi Jira API.

## Anomaly tối thiểu

Lite chưa cần toàn bộ AI anomaly nâng cao, nhưng phải có bảng `anomaly_log` và các loại tối thiểu sau.

### `routing_mismatch`

- Pull payload hoặc webhook payload sau này không map được project.
- Không ingest vào `issues`.
- Lưu raw payload.

### `mapping_gap`

- Thiếu mapping required.
- Block sync thật cho issue.

### `translation_low_conf`

- AI confidence thấp.
- Không block sau khi human review.
- Ưu tiên hiển thị trong review queue.

### `unusual_field_change`

- Content thay đổi quá lớn sau khi đã có revision cũ.
- Lite có thể cảnh báo trước; nếu severity critical thì worker outbound phải block cho tới khi admin resolve/ignore.

### `sync_failure_chain`

- Tối thiểu phát hiện nhiều job fail liên tiếp cùng issue hoặc project.
- Hiển thị dashboard/admin.

## Action anomaly

Lite cần:

- `ignore`
- `resolve`

Critical anomaly không đổi trực tiếp `issues.status`, nhưng outbound worker phải check anomaly còn open/investigating trước khi sync thật.
