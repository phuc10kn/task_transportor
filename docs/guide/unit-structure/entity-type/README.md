# Unit Structure - Entity Type

Template này dùng cho entity type definition trong `docs/meta/01-entity-types/` hoặc layer-local type definition ở `docs/app/05+`. Reusable guide pack chỉ là stable source template; `folder` vẫn là registry local của project.

Schema canonical: [entity-type-definition.md](../../../meta/00-schemas/entity-type-definition.md).

Per-type extension thật phải được ghi trong file entity type definition ở `docs/meta/01-entity-types/**/<entity-type>.md`. Template này chỉ là skeleton để viết nhanh.

## YAML Structure

```yaml
entity_type_definition:
  name: BusinessRule
  layer: 01-business
  concern: 05-governance
  folder: business-rules/
  id_pattern: BRULE-{NNN}-{slug}
  base_schema: entity-instance/v1
  meaning: Rule business có thể đánh giá đúng/sai.
  instance_criteria:
    - Business có rule rõ ràng ảnh hưởng process hoặc decision.
  required_fields:
    frontmatter:
      - schema
      - id
      - slug
      - title
      - entity_type
      - layer
      - concern
      - status
      - summary
    body_sections:
      - Summary
      - Meaning
      - Statement
      - Condition
      - Outcome
      - Scope
      - Relations
      - Validation Notes
  optional_fields:
    frontmatter:
      - theory_basis
      - decision_basis
      - relations
      - tags
      - owner
    body_sections:
      - Exceptions
      - Owner
  lifecycle:
    - <project-defined-status>
  structure_extends:
    base: entity-instance/v1
    required_sections:
      - Statement
      - Condition
      - Outcome
      - Scope
    optional_sections:
      - Exceptions
      - Owner
  relations_template:
    governs:
      relation_type: governs
      target_entity_type: Process
      requirement_mode: allowed_when_known
      cardinality: 0..n
  validation:
    - BusinessRule phải đánh giá được đúng/sai trong business context.
```

## Markdown Definition Skeleton

```md
# BusinessRule

| Field | Value |
| --- | --- |
| **name** | BusinessRule |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-rules/` |
| **ID pattern** | `BRULE-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

## instance criteria

## required fields

## optional fields

## lifecycle

## structure extends

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| governs | `governs` | Process | allowed_when_known | 0..n |

## validation
```

`folder` chỉ ghi registry folder của entity type trong `docs/meta/01-entity-types/`, ví dụ `business-rules/`. App placement kết hợp layer/concern universal từ `docs/guide/reference/folder-structure.md` với entity type folder đã được project chốt trong meta; ví dụ `docs/app/01-business/05-governance/01-business-rules/business-rules/` chỉ hợp lệ khi local registry quy định như vậy.

`relations_template` định nghĩa slot relation mà entity instance của type này được phép điền. Không có slot thì instance không được ghi relation đó.

Canonical representation trong file Markdown là table dưới `## relations_template`. YAML ở trên chỉ là review shape để giải thích field; không thay thế table canonical.

Slot name ưu tiên là role ngắn, thường trùng với relation type, ví dụ `governs`, `implements`, `part_of`. Chỉ mở rộng tên slot khi cùng một relation type cần phân biệt nhiều role hoặc nhiều target trong cùng entity type.

