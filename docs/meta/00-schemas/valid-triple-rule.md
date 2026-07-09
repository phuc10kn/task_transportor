# Valid Triple Rule Schema

Schema này áp dụng cho file `docs/meta/03-rules/**/valid-triples.md`.

Valid triple quyết định relation nào được phép đi giữa hai entity type nào đó.

Entity instance vẫn được ghi relation khi entity type của source có slot tương ứng trong `relations_template`.

Unit template: [valid-triple](../../guide/unit-structure/valid-triple/README.md).

## Required Shape

```md
# Valid Triples - <scope>

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality | Notes |
| --- | --- | --- | --- | --- |
| BusinessRule | `governs` | Process | 0..n | Rule chi phối process. |
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
| `Notes` | Constraint ngắn, không thay app rule. |

## Validation

- `Source` và `Target` phải tồn tại trong `01-entity-types/`.
- `Relation` phải tồn tại trong `02-relation-types/`.
- Direction phải khớp canonical.
- Nếu thiếu cardinality thì mặc định là `0..n`.
- Source entity type phải có relation slot tương ứng trong `relations_template` trước khi instance ghi relation.
- Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_`.
- Không dùng valid triple để định nghĩa meaning của relation; nó chỉ định nghĩa tính cho phép giữa source/target.

## Forbidden

- Không thêm relation trực tiếp giữa hai type xa nhau khi chưa có semantic rõ ràng.
- Không ghi app instance ID trong valid triple.
- Không dùng valid triple để quy ước selector hoặc wildcard target.
