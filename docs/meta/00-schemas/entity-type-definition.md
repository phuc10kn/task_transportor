# Entity Type Definition Schema

Schema này áp dụng cho file trong `docs/meta/01-entity-types/` và layer-local entity type definition trong `docs/app/05+`.

Entity type definition là kiểu knowledge có thể tồn tại. Nó không chứa app instance.

`docs/meta/01-entity-types/` là registry canonical cho các type đã promote. Với type đã promote, `relations_template` canonical phải nằm trong `docs/meta`. Type `05+` chưa promote có thể nằm layer-local trong `docs/app` khi có quyết định promote/migrate riêng.

Instance usage của một repo chỉ được dùng làm evidence để verify contract; không được dùng làm nguồn để derive canonical contract.

Unit template: [entity-type](../../guide/unit-structure/entity-type/README.md).

## Header Table

Mỗi file phải bắt đầu bằng title và bảng field:

```md
# Process

| Field | Value |
| --- | --- |
| **name** | Process |
| **layer** | `01-business` |
| **concern** | `04-behavior` |
| **folder** | `processes/` |
| **ID pattern** | `PROC-{NNN}` |
| **Instance folder pattern** | `PROC-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |
```

`ID pattern` là giá trị frontmatter `id`. `Instance folder pattern` là tên folder instance (`id` + `-` + `slug`). Xem [id-conventions.md](../04-conventions/id-conventions.md).

`schema` bắt buộc cho file mới hoặc file được sửa sau khi contract này có hiệu lực. File legacy không có field này được hiểu là kế thừa base schema.

## Required Sections

```md
## meaning

## instance criteria

## required fields

## optional fields

## lifecycle

## structure extends

## relations_template

## validation
```

`structure extends` bắt buộc cho file mới hoặc file được sửa. File legacy chưa có section này được hiểu là dùng base schema và các body section đã ghi trong `required fields`.

## Type Contract Gate

Một entity type phải có cả header field `schema` và section `## structure extends` khi:

- tạo entity type mới;
- sửa entity type hiện có;
- chuẩn bị tạo instance mới của type đó.

Type legacy chưa có instance có thể giữ nguyên như technical debt. Không rewrite hàng loạt chỉ để đồng nhất hình thức.

Kiểm tra target trước khi sửa type hoặc tạo instance:

```text
npm run verify:entity-type-contract -- --type <canonical-entity-type-path>
```

Sau khi tạo instance, có thể kiểm tra mapping type-instance:

```text
npm run verify:entity-type-contract -- --instance <docs/app-instance-readme-path>
```

Lệnh không có tham số chỉ audit toàn cục: legacy type đã có instance là lỗi, legacy type chưa có instance là warning.

## Section Rules

| Section | Rule |
| --- | --- |
| `meaning` | Mô tả semantic của entity type, không mô tả instance. |
| `instance criteria` | Khi nào được tạo instance mới. |
| `required fields` | Metadata và body sections bắt buộc. |
| `optional fields` | Metadata và body sections được phép thêm. |
| `lifecycle` | Status flow riêng nếu khác status vocabulary chung. |
| `structure extends` | Per-type schema extension cho `entity-instance/v1`; đây là source of truth cho section riêng của entity type. |
| `relations_template` | Slot relation mà instance của type này được phép điền; không có slot thì instance không được ghi relation đó. |
| `validation` | Validate semantic và boundary của type. |

`folder` là registry folder của entity type trong `docs/meta/01-entity-types/`, ví dụ `processes/`. Không đưa numbered parent path như `01-processes/` vào field này. App placement path vẫn lấy từ `docs/guide/reference/folder-structure.md`.

## Relations Template

`relations_template` trong entity type định nghĩa relation slots cho instance.

Mỗi slot phải nêu:

- slot name;
- relation type;
- target entity type canonical;
- requirement_mode;
- cardinality.

`requirement_mode` cho phép chỉ hai giá trị:

- `allowed_when_known`;
- `required_at_creation`.

Relation của entity instance chỉ được ghi canonical khi:

1. slot tồn tại trong `relations_template` của entity type;
2. relation type của slot tồn tại trong `docs/meta/02-relation-types/`;
3. valid triple tương ứng tồn tại trong `docs/meta/03-rules/`;
4. target entity type khớp slot;
5. direction đúng canonical;
6. target instance tồn tại khi slot đang được điền theo `requirement_mode`.

Nếu `requirement_mode = required_at_creation` và target chưa tồn tại thì source chưa là identity canonical và không được tạo.

Nếu chưa có slot cho relation thì relation sẽ bị reject.

Target entity type trong `relations_template` phải là entity type thật. Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.

Entity type ở scope rộng như Assumption/ContextConstraint không tự tạo outbound relation tới mọi entity. Khi một entity bị ảnh hưởng, entity type của nguồn phải có slot hợp lệ tới Assumption/ContextConstraint bằng valid triple phù hợp.

## Forbidden

- Không đưa app instance như `PROC-001 Backlog Pull` trong entity type definition.
- Không dùng `relations_template` để thay thế `02-relation-types/` hoặc `03-rules/`.
- Không tạo `structure extends` trái với required field của `entity-instance/v1`.
- Không dùng `folder` để ghi parent path hoặc app placement path.
- Không dùng selector hoặc wildcard target trong `relations_template`.
