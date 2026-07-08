# Unit Structure - Entity Type

Template này dùng cho entity type definition trong `docs/meta/01-entity-types/` hoặc layer-local type definition ở `docs/app/05+`.

Schema canonical: [entity-type-definition.md](../../../meta/00-schemas/entity-type-definition.md).

Per-type extension thật phải được ghi trong file entity type definition ở `docs/meta/01-entity-types/**/<entity-type>.md`. Template này chỉ là skeleton để viết nhanh.

## YAML Structure

```yaml
entity_type_definition:
  name: Process
  layer: 01-business
  concern: 04-behavior
  folder: processes/
  id_pattern: PROC-{NNN}-{slug}
  base_schema: entity-instance/v1
  meaning: Đơn vị hành vi nghiệp vụ có trigger, participants, steps, outcomes.
  instance_criteria:
    - Business operation có flow ổn định cần document.
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
      - Trigger
      - Participants
      - Steps
      - Outcomes
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
      - Inputs
      - Decisions
      - Exceptions
  lifecycle:
    - draft
    - active
    - deprecated
  structure_extends:
    base: entity-instance/v1
    required_sections:
      - Trigger
      - Participants
      - Steps
      - Outcomes
    optional_sections:
      - Inputs
      - Decisions
      - Exceptions
  relations_template:
    governed_by:
      relation_type: governed_by
      target_entity_type: BusinessRule
      required: false
      cardinality: 0..n
  validation:
    - Không mô tả API, database, technical implementation.
```

## Markdown Definition Skeleton

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

## meaning

## instance criteria

## required fields

## optional fields

## lifecycle

## structure extends

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| governed_by | `governed_by` | BusinessRule | false | 0..n |

## validation
```

`folder` chỉ ghi registry folder của entity type trong `docs/meta/01-entity-types/`, ví dụ `processes/`. App placement path vẫn lấy từ `docs/guide/reference/folder-structure.md`, ví dụ `docs/app/01-business/04-behavior/01-processes/`.

`relations_template` định nghĩa slot relation mà entity instance của type này được phép điền. Không có slot thì instance không được ghi relation đó.

Canonical representation trong file Markdown là table dưới `## relations_template`. YAML ở trên chỉ là review shape để giải thích field; không thay thế table canonical.

Slot name ưu tiên là role ngắn, thường trùng với relation type, ví dụ `governed_by`, `informs`, `part_of`. Chỉ mở rộng tên slot khi cùng một relation type cần phân biệt nhiều role hoặc nhiều target trong cùng entity type.
