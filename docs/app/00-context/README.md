# 00 - Context

`00-context/` là điểm đọc đầu tiên để hiểu bối cảnh sản phẩm hiện tại. File này chỉ giữ app-specific truth, scope nền, premise và routing. Giải thích generic về layer, concern, entity type và cách đọc docs nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Cách dùng docs: `docs/guide/getting-started/introduction.md`
- Mô hình layer: `docs/guide/concepts/layer-model.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#00-context`
- Cách slim layer README: `docs/guide/workflows/slim-layer-readme.md`
- Template README layer: `docs/guide/reference/layer-readme-template.md`

## Context Truth Hiện Tại

`task_transportor` là Central Sync Hub/CIS cho luồng đồng bộ có kiểm soát giữa hệ thống nguồn và hệ thống đích.

Mô hình bắt buộc:

```text
System -> CIS -> System
```

Trong Lite hiện tại:

- Backlog là hệ thống nguồn ưu tiên.
- CIS là Central Issue Store, giữ raw snapshot/payload, canonical data, mapping, translation review state, anomaly và audit trail.
- Jira là hệ thống đích ưu tiên.
- Manual pull và project pull là đường inbound chính từ Backlog vào CIS.
- Scheduled pull là optional sau khi manual/project pull ổn định.
- Webhook Backlog/Jira và Jira -> CIS đầy đủ chưa là đường vận hành chính của Lite.
- CIS -> Jira phải đi qua dry-run/pre-check trước khi ghi thật.
- Backlog không được gọi Jira trực tiếp; mọi dữ liệu phải vào CIS trước.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#00-context`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ context truth, rule và routing riêng của Central Sync Hub.

Chỉ mục nhanh:

- `01-overview/`
- `02-scope/`
- `03-premises/`
- `04-language/`
- `05-ecosystem/`
- `06-environment/`

## Theory Routing

- `TH-HUBFLOW`: dùng cho `System -> Core Hub -> System`, inbound-to-core-first và lý do không sync point-to-point.
- `TH-CANON`: dùng cho canonical vocabulary, source snapshot, source of truth và operational truth.

Context chỉ reference theory bằng ID và ý nghĩa trong app. Không copy reasoning dài từ theory vào layer này.

## Rule Riêng Hiện Tại

- Context giữ invariant `System -> CIS -> System`, vai trò Backlog/CIS/Jira và scope nền của Lite.
- Context không là nơi gom knowledge chưa biết đặt ở đâu; nếu chưa hấp thụ được vào canonical docs, dùng `NOTE-OPEN` hoặc giữ ngoài docs cho tới khi đủ promote.

## Cách Đọc Nhanh

1. Đọc `Context Truth Hiện Tại`.
2. Mở concern liên quan tới task.
3. Khi cần hiểu cách docs hoạt động, đọc `docs/guide/`.
4. Khi cần relation/rule canonical của documentation system, đọc `docs/meta/02-relation-types/` và `docs/meta/03-rules/`.
