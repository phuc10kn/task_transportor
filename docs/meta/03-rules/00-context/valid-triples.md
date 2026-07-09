# Valid Triples — 00-context

Combination hợp lệ: `Source --relation--> Target`

| Source | Relation | Target | Cardinality |
|--------|----------|--------|-------------|
| Application | `has_scope` | Scope | 0..n |
| Environment | `hosts` | Application | 0..n |

## validation

- Relation Type phải tồn tại trong `02-relation-types/`
- Direction phải đúng canonical
- Entity instance chỉ ghi relation trong YAML frontmatter `relations:` theo slot đã có trong entity type `relations_template`
- Không dùng pseudo target như `entities`, `layers/entities`, `_any Entity_` hoặc `_layer / entity_` trong valid triple.
