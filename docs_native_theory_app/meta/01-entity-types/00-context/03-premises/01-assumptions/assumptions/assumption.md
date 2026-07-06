# Assumption

| Field | Value |
|-------|-------|
| **name** | Assumption |
| **layer** | `00-context` |
| **concern** | `03-premises` |
| **folder** | `assumptions/` |
| **ID pattern** | `ASM-{NNN}-{slug}` |

## meaning

Điều project đang tạm coi là đúng nhưng chưa được xác minh như fact.

## instance criteria

Khi premise sai có thể ảnh hưởng nhiều layer hoặc decision.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, reason, confidence

## optional fields

affected_entities, validation_method, review_trigger, theory_basis

## lifecycle

active → validated | invalidated | retired

## allowed relations (candidate)

```text
Assumption → entities (affects)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phải ghi rõ là assumption, không viết như fact
