# BusinessRule

| Field | Value |
|-------|-------|
| **name** | BusinessRule |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-rules/` |
| **ID pattern** | `BRULE-{NNN}-{slug}` |

## meaning

Rule business có thể đánh giá đúng/sai.

## instance criteria

Khi business có rule rõ ràng ảnh hưởng process hoặc decision.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, condition, outcome

## optional fields

scope, owner, exceptions, affected_processes, theory_basis

## lifecycle

draft → active → superseded → retired

## allowed relations (candidate)

```text
BusinessRule → Process (applies_to)
BusinessRule → Invariant (may_refine_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Business Rule vs Domain Invariant
