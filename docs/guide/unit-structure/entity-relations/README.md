# Unit Structure - Entity Relations

Template này dùng khi ghi relation cho một entity instance.

Schema liên quan:

- [entity-instance.md](../../../meta/00-schemas/entity-instance.md)
- [relation-type-definition.md](../../../meta/00-schemas/relation-type-definition.md)
- [valid-triple-rule.md](../../../meta/00-schemas/valid-triple-rule.md)

## YAML Frontmatter Block

```yaml
relations:
  <relation-slot>:
    - <TARGET-ID>
```

## YAML Review Shape

Dùng shape này khi review relation trước khi ghi canonical:

```yaml
relation_review:
  source:
    id: <SOURCE-ID>
    entity_type: <SourceType>
  slots:
    - slot: <relation-slot>
      relation: <relation-name>
      target:
        id: <TARGET-ID>
        entity_type: <TargetType>
      valid_triple: <SourceType> --<relation-name>--> <TargetType>
      slot_defined: true
      status: valid
    - slot: unknown_slot
      relation: custom_relation
      target:
        id: QG-001
        entity_type: QualityGate
      valid_triple: null
      slot_defined: false
      status: rejected
      reason: Relation không có slot trong relations_template của entity type.
```

## Markdown Body

```md
## Relations

- `<TARGET-ID>` - <Relation context.>
```

## Rule

- Relation canonical phải dùng slot đã có trong `relations_template` của entity type.
- Relation canonical phải có relation type trong `docs/meta/02-relation-types/`.
- Relation canonical phải có valid triple trong `docs/meta/03-rules/`.
- Không mirror inverse nếu inverse chưa được định nghĩa.
- Relation không có slot hoặc thiếu meta rule bị reject; không ghi vào entity instance.
