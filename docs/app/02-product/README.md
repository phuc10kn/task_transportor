# 02 - Product

`02-product/` mô tả sản phẩm phải cung cấp gì để đáp ứng business needs. File này là source of truth cho scope và behavior Lite. Giải thích generic về product concepts nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Product trong documentation architecture: `docs/guide/concepts/documentation-architecture.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#02-product`
- Canonical map: `docs/guide/reference/canonical-map.md`
- Relation cheatsheet: `docs/guide/reference/relation-cheatsheet.md`

## Product Truth Hiện Tại

Phiên bản đang triển khai là Lite. Lite nhỏ hơn MVP đầy đủ nhưng vẫn giữ nền:

```text
System -> CIS -> System
```

Lite in scope:

- Admin login và project config tối thiểu.
- Backlog manual pull một issue vào CIS.
- Backlog project pull enqueue nhiều issue vào CIS.
- Backlog Issues browser theo project + khoảng ngày tạo, loại issue đã có trong CIS và chỉ giữ kết quả trong memory của Admin UI.
- Sync từng Backlog candidate vào CIS qua shared manual-pull job; không đi thẳng Jira.
- Tạo CIS issue thủ công và link immutable Backlog/Jira identity đã verify theo project.
- Scheduled pull optional sau khi manual/project pull ổn định.
- CIS lưu raw/source snapshot, canonical issue data, comments, attachments metadata, sync job và journal.
- Translation Nhật -> Việt bằng AI adapter khi bật option.
- Human review cho translation/comment cần duyệt.
- Mapping approval cho field/status/user/project mapping cần thiết.
- Anomaly tối thiểu cho routing, mapping, translation, sync failure và content change.
- Jira dry-run bắt buộc trước sync thật.
- CIS -> Jira create/update issue/comment khi pre-check pass.
- Admin UI tối thiểu cho dashboard, project config, issue editor, translation, mapping, anomaly, jobs và journal.
- Admin UI tách CIS Issues và Backlog Issues; control Pull one/Pull project nằm ở Backlog Issues.

Lite out of scope nếu chưa có decision mới:

- Jira -> CIS đầy đủ.
- Backlog/Jira webhook là đường bắt buộc.
- CIS -> Backlog.
- Việt -> Nhật cho dev reply về Backlog.
- AI learning nâng cao.
- Notification ngoài UI.
- Multi-tenant, RBAC phức tạp, distributed worker và cloud-native scaling.
- Attachment upload/sync sang Jira như flow hoàn chỉnh.

Product behavior ưu tiên:

- Người dùng bắt đầu từ Backlog pull vào CIS, không sync trực tiếp sang Jira.
- Issue Editor là nơi review và chuẩn bị canonical issue.
- Translation trong Issue Editor là modal/action hỗ trợ, không thay thế canonical ownership.
- Jira sync chạy qua modal/action dry-run, cho sửa payload target, rồi sync bằng payload đã kiểm tra.
- Issue canonical sync không bị chặn bởi translation queue/review riêng, nhưng state `pending_translate` vẫn chưa syncable trong code Lite hiện tại.
- Medium/Full plan chỉ là future scope/provenance, không tự trở thành Lite scope.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#02-product`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ scope, behavior và product gate riêng của Lite.

Chỉ mục nhanh:

- `01-needs/`
- `02-capabilities/`
- `03-behavior/`
- `04-delivery/`
- `05-specification/`
- `06-acceptance/`

## Theory Routing

- `TH-HUBFLOW`: capability đi qua CIS và không sync point-to-point.
- `TH-CANON`: behavior phụ thuộc canonical truth, reviewed state và apply path.
- `TH-AI-GOV`: AI assistance có human review.
- `TH-SYNC-SAFE`: dry-run, readiness và outbound gate.

## Rule Riêng Hiện Tại

- `02-product/README.md` là source of truth cho scope và behavior Lite.
- Medium/Full plan không tự thành scope Lite nếu chưa có decision accepted mới.
- Product behavior phải giữ đường `Backlog -> CIS -> Jira`; không định nghĩa capability đi tắt Backlog -> Jira.
- Khi thay đổi scope/behavior Lite, cập nhật Product, Quality và Decision liên quan cùng lúc.
- Relation cụ thể phải tuân theo canonical relation types trong `docs/meta/02-relation-types/` và rule trong `docs/meta/03-rules/`.

## Routing Sang Layer Khác

- Business reason và process: `docs/app/01-business/`.
- UI flow, screen, state: `docs/app/03-interface/`.
- Domain meaning và invariant: `docs/app/04-domain/`.
- Architecture boundary và interaction: `docs/app/05-architecture/`.
- Quality acceptance và verify gate: `docs/app/08-quality/`.
- Scope/behavior trade-off đã chốt: `docs/app/10-decisions/`.
