# Schema Contracts

`00-schemas/` định nghĩa contract canonical cho Markdown knowledge files.

Mục tiêu là để người viết và AI không tự do tạo format mới khi ghi entity, entity type, relation type hoặc valid triple.

## Schema Stack

```text
Entity Instance Schema
  <- extended by Entity Type Definition
  <- constrained by Entity Type Relation Slot
  <- constrained by Relation Type Definition
  <- constrained by Valid Triple Rule
  <- formatted by Conventions
```

## Files

| File | Dùng cho |
| --- | --- |
| [entity-instance.md](entity-instance.md) | Entity instance trong `docs/app/**/<ID-slug>/README.md`. |
| [entity-type-definition.md](entity-type-definition.md) | Entity type definition trong `docs/meta/01-entity-types/` và layer-local type definition đang còn ở `docs/app/05+`. |
| [relation-type-definition.md](relation-type-definition.md) | Relation type definition trong `docs/meta/02-relation-types/`. |
| [valid-triple-rule.md](valid-triple-rule.md) | Valid triple rule trong `docs/meta/03-rules/`. |
| [structure-extends.md](structure-extends.md) | Cách entity type đặc thù extend base entity schema. |
| [decision.md](decision.md) | Decision record trong `docs/app/10-decisions/`. |
| [theory-package.md](theory-package.md) | Theory package trong `docs/theories/`. |

## Unit Templates

Template YAML/Markdown để viết nhanh nằm ở [docs/guide/unit-structure](../../guide/unit-structure/README.md).

Schema trong folder này là luật; unit template trong guide là skeleton sử dụng.

## Rule

- File mới phải chọn schema trước khi viết nội dung.
- Schema base là tối thiểu; extension chỉ được thêm hoặc siết rule, không được bỏ field/section bắt buộc của base.
- Không tạo heading, metadata field hoặc relation mới nếu schema hiện tại không cho phép.
- Nếu schema chưa đủ, mở `NOTE-OPEN` hoặc cập nhật schema trong `docs/meta/00-schemas/` trước.

## Compatibility

Một số file cũ chưa khai báo `schema` trong frontmatter. Khi đọc file cũ, infer schema từ path và entity type. Khi sửa file đó, bổ sung `schema` theo contract mới.
