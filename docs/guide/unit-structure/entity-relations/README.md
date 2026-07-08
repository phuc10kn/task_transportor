# Unit Structure - Entity Relations

Template này dùng khi ghi relation cho một entity instance.

Schema liên quan:

- [entity-instance.md](../../../meta/00-schemas/entity-instance.md)
- [relation-type-definition.md](../../../meta/00-schemas/relation-type-definition.md)
- [valid-triple-rule.md](../../../meta/00-schemas/valid-triple-rule.md)

## YAML Frontmatter Block

```yaml
relations:
  - type: governed_by
    target: BRULE-001
  - type: informs
    target: UC-001
```

## YAML Review Shape

Dùng shape này khi review relation trước khi ghi canonical:

```yaml
relation_review:
  source:
    id: PROC-001
    entity_type: Process
  edges:
    - relation: governed_by
      target:
        id: BRULE-001
        entity_type: BusinessRule
      valid_triple: Process --governed_by--> BusinessRule
      status: valid
    - relation: custom_relation
      target:
        id: QG-001
        entity_type: QualityGate
      valid_triple: null
      status: open
      note: NOTE-CANDIDATE relation chưa có trong meta.
```

## Markdown Body

```md
## Relations

- `BRULE-001` - rule chi phối process này.
- `UC-001` - use case được process này inform.

## Open Relation Question

> NOTE-CANDIDATE: cần relation giữa `Process` và `QualityGate`.
```

## Rule

- Relation canonical phải có relation type trong `02-relation-types/`.
- Relation canonical phải có valid triple trong `03-rules/`.
- Không mirror inverse nếu inverse chưa được định nghĩa.
- Relation chưa đủ chuẩn chỉ ghi ở `Open Relation Question`.
