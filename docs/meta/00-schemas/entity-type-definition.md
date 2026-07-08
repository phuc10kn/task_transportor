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

## allowed relations

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
| `allowed relations` | Candidate relation để tham khảo, không thay valid triple. |
| `validation` | Rule validate semantic và boundary của type. |

`folder` là registry folder của entity type trong `docs/meta/01-entity-types/`, ví dụ `processes/`. Không đặt numbered parent path như `01-processes/` vào field này. App path vẫn lấy từ `docs/guide/reference/folder-structure.md`.

## Allowed Relations Are Not Canonical

`allowed relations` trong entity type chỉ là candidate/gợi ý đọc.

Relation chỉ được dùng canonical khi:

1. relation type tồn tại trong `docs/meta/02-relation-types/`;
2. valid triple tồn tại trong `docs/meta/03-rules/`;
3. direction đúng canonical.

## Forbidden

- Không đặt app instance như `PROC-001 Backlog Pull` trong entity type definition.
- Không dùng `allowed relations` để bỏ qua `03-rules/`.
- Không tạo `structure extends` phá base required field của `entity-instance/v1`.
- Không dùng `folder` để ghi parent path hoặc app placement path.
