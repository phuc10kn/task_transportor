# Valid Triple Rule Schema

Schema này áp dụng cho file `docs/meta/03-rules/**/valid-triples.md`.

Valid triple quyết định relation nào được phép giữa hai entity type cụ thể.

Entity instance vẫn chỉ được ghi relation nếu entity type của source có slot tương ứng trong `relations_template`.

Unit template: [valid-triple](../../guide/unit-structure/valid-triple/README.md).

## Required Shape

```md
# Valid Triples - <scope>

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality | Required? | Notes |
| --- | --- | --- | --- | --- | --- |
| Process | `governed_by` | BusinessRule | 0..n | no | Rule chi phối process. |
```

## Required Columns

| Column | Rule |
| --- | --- |
| `Source` | Entity type canonical. |
| `Relation` | Relation type canonical. |
| `Target` | Entity type canonical. |
| `Cardinality` | `0..n`, `1..n`, `0..1`, `1..1`. |

## Optional Columns

| Column | Rule |
| --- | --- |
| `Required?` | `yes` nếu mọi source instance phải có relation này. |
| `Notes` | Constraint ngắn, không thay app rule. |

## Validation

- `Source` và `Target` phải tồn tại trong `01-entity-types/`.
- `Relation` phải tồn tại trong `02-relation-types/`.
- Direction phải khớp canonical direction.
- Cardinality mặc định là `0..n` nếu column chưa có.
- Source entity type phải có relation slot tương ứng trong `relations_template` trước khi instance được ghi relation.
- Required relation phải có lý do rõ; không dùng để ép graph thành pipeline.

## Forbidden

- Không thêm relation trực tiếp giữa hai type xa nhau nếu chưa có semantic rõ.
- Không ghi app instance ID trong valid triple.
- Không dùng valid triple để định nghĩa meaning của relation.
