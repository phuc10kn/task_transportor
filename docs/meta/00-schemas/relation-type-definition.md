# Relation Type Definition Schema

Schema này áp dụng cho file trong `docs/meta/02-relation-types/`.

Relation type definition định nghĩa vocabulary và direction. Nó không tự quyết định source/target entity type nào hợp lệ và không tự cho phép entity instance ghi relation.

Unit template: [relation-type](../../guide/unit-structure/relation-type/README.md).

## Header Table

```md
# governed_by

| Field | Value |
| --- | --- |
| **name** | `governed_by` |
| **canonical direction** | Source --governed_by--> Target |
| **inverse** | `governs` |
| **inverse kind** | paired |
```

`inverse kind` bắt buộc cho file mới hoặc file được sửa. File legacy chưa có field này được infer: có `inverse` thì coi là `paired`, không có `inverse` thì coi là `none`.

## Required Sections

```md
## meaning

## allowed semantic

## examples

## non-examples

## anti-patterns

## valid usage
```

## Section Rules

| Section | Rule |
| --- | --- |
| `meaning` | Nêu semantic của relation bằng ngôn ngữ domain-neutral. |
| `allowed semantic` | Điều kiện meaning để dùng relation. |
| `examples` | Ví dụ đúng direction. |
| `non-examples` | Ví dụ sai direction hoặc sai semantic. |
| `anti-patterns` | Cách dùng bị cấm. |
| `valid usage` | Trích valid triples đã chốt, không thay thế `03-rules/` hoặc relation slot trong entity type. |

## Inverse Kind

| Value | Meaning |
| --- | --- |
| `derived` | Không lưu inverse relation; trace ngược bằng search/tooling. |
| `paired` | Có relation inverse khác tên và được định nghĩa riêng. |
| `none` | Không có inverse canonical. |

## Forbidden

- Không tạo passive relation chỉ để đảo chiều.
- Không dùng relation nếu chưa có valid triple và relation slot trong entity type `relations_template`.
- Không đặt rule source/target chi tiết trong relation type thay cho `03-rules/`.
