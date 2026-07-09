# Review — Entity Map, Variant Và Relation

Ngày cập nhật: 2026-07-10

## Mục Đích

File này là snapshot review **hiện tại** cho việc tổ chức entity map, taxonomy và relation. Nó không phải source of truth; source of truth nằm ở `docs/meta/`, `docs/app/`, `docs/app_variants/` và guide tương ứng.

Các evidence/path của audit trước đã được thay bằng trạng thái working tree hiện tại để tránh trộn finding lịch sử với blocker đang mở.

## Snapshot Hiện Tại

- `docs/app_variants/raw_app_original/` là universal origin model: concern tree cho mọi layer; generic entity-type taxonomy hiện có ở `06-technical`, `08-quality`, `09-operation`.
- `docs/app_variants/custom_modular_monolith/` chỉ giữ template phụ thuộc methodology cho `05-architecture` và `07-implementation`.
- `docs/app/` là application truth và home của entity instance.
- `docs/meta/` là canonical registry của entity type, relation type, relation slot và valid triple đã promote.
- `06/08/09` đã chuyển khỏi custom modular monolith sang raw origin; không còn path `docs/candidates/` hoặc path cũ dưới custom modular monolith.
- `07-implementation` đã tạm bỏ khỏi entity-map variant index; raw origin chỉ giữ concern tree, còn template type vẫn ở custom modular monolith.
- `raw_app_original` đã materialize concern tree cho `00–10`; `00–04` có thêm sub-concern universal có prefix số. Không materialize entity-type folder plural hoặc entity instance.

### Kiểm Tra Gần Nhất

- Local Markdown links: không có link hỏng.
- Index hiện có 207 thay đổi staged (`A 95`, `D 45`, `M 43`, `R 24`). Bản snapshot review này là thay đổi mới unstaged và cần stage lại trước commit.
- `git diff --cached --check`: còn 6 Markdown hard-break. Đây là P2-03 đã được quyết định không xử lý, không phải blocker semantic.

## Việc Còn Mở

### P0-04 — Scope semantic của `implements`

Direction hiện được ghi là concrete → abstract cho các triple đã có như `Feature --implements--> Capability` và `UserFlow --implements--> UseCase`.

Cần chốt rõ relation này chỉ áp dụng cho product/UI realization hay còn áp dụng cho technical/implementation conformance. Sau khi chốt mới quyết định giữ, chỉnh hoặc hoàn nguyên các relation/type change liên quan.

### P0-05 — Relation/type semantics sau khi xóa instance

42 application instance đã được xóa khỏi custom template. Chỉ còn phần semantic relation/type cần review sau khi P0-04 được chốt.

### P1-01 — Ownership của type `04-domain` và `05-architecture`

Hiện `docs/meta/` canonical hóa type, trong khi entity-map variant dùng DDD/modular-monolith làm lens đọc. Cần chốt một hướng:

- **Meta canonical + variant là reading pack/view:** giữ type trong meta; variant không sở hữu type.
- **Variant-bound:** tách/namespace type methodology-specific khỏi canonical registry.

Cho đến khi chốt, không đổi home hoặc promotion của `04/05`.

### Taxonomy `07-implementation`

Hiện `07` không có entity-map variant. Raw origin giữ concern tree; custom modular monolith giữ template type. Cần review riêng từng type nếu muốn promote generic taxonomy hoặc dựng variant pack + interaction graph sau này.

## Checklist Còn Lại

- [ ] Stage lại snapshot review hiện tại để index phản ánh đúng nội dung này.
- [ ] Làm sạch 6 Markdown hard-break nếu muốn `git diff --cached --check` pass hoàn toàn.
- [ ] Chốt P0-04 trước khi review relation/type semantics còn lại.
- [ ] Chốt P1-01 trước khi đổi home hoặc promotion của type `04/05`.
- [ ] Review taxonomy `07` trước khi promote generic type hoặc dựng variant pack.

## Điều Kiện Trước Khi Commit

1. Chốt P0-04 và P1-01, hoặc tách các thay đổi liên quan khỏi thay đổi sẽ commit.
2. Stage lại snapshot review này và review cuối `git diff --cached`.
3. Nếu cần check sạch tuyệt đối, bỏ 6 Markdown hard-break trong cached diff.