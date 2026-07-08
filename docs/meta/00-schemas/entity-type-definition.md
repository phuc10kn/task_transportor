# Entity Type Definition Schema

Schema này áp dụng cho file trong `docs/meta/01-entity-types/` và các layer-local entity type definition còn nằm trong `docs/app/05+`.

Entity type definition mô tả loại knowledge được phép tồn tại. Nó không chứa app instance cụ thể.

`docs/meta/01-entity-types/` là registry canonical cho các type đã promote. Các type 05+ hiện còn có thể nằm layer-local trong `docs/app` cho tới khi có quyết định promote/migrate riêng.

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
| **ID pattern** | `PROC-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |
```

`schema` bắt buộc cho file mới hoặc file được sửa sau khi contract này có hiệu lực. File legacy không có field này được infer từ schema base.

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

## Section Rules

| Section | Rule |
| --- | --- |
| `meaning` | Nêu semantic của entity type, không nêu instance cụ thể. |
| `instance criteria` | Khi nào được tạo instance mới. |
| `required fields` | Metadata và body sections bắt buộc. |
| `optional fields` | Metadata và body sections được phép thêm. |
| `lifecycle` | Status flow riêng nếu khác status vocabulary chung. |
| `structure extends` | Per-type schema extension so với `entity-instance/v1`; đây là source of truth cho section riêng của entity type. |
| `relations_template` | Slot relation mà instance của entity type này được phép điền; không có slot thì instance không được ghi relation đó. |
| `validation` | Rule validate semantic và boundary của type. |

`folder` là registry folder của entity type trong `docs/meta/01-entity-types/`, ví dụ `processes/`. Không đặt numbered parent path như `01-processes/` vào field này. App path vẫn lấy từ `docs/guide/reference/folder-structure.md`.

## Relations Template

`relations_template` trong entity type định nghĩa relation slots cho instance.

Mỗi slot phải nêu:

- slot name;
- relation type;
- target entity type;
- required;
- cardinality.

Relation của entity instance chỉ được ghi canonical khi:

1. slot tồn tại trong `relations_template` của entity type;
2. relation type của slot tồn tại trong `docs/meta/02-relation-types/`;
3. valid triple tương ứng tồn tại trong `docs/meta/03-rules/`;
4. target entity type khớp slot;
5. direction đúng canonical;
6. target instance tồn tại khi slot được điền.

Nếu một relation chưa có slot trong entity type, relation đó bị reject khỏi entity instance.

## Forbidden

- Không đặt app instance như `PROC-001 Backlog Pull` trong entity type definition.
- Không dùng `relations_template` để bỏ qua `02-relation-types/` hoặc `03-rules/`.
- Không tạo `structure extends` phá base required field của `entity-instance/v1`.
- Không dùng `folder` để ghi parent path hoặc app placement path.
