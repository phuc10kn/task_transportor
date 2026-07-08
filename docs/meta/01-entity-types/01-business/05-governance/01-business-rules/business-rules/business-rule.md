# BusinessRule

| Field | Value |
|-------|-------|
| **name** | BusinessRule |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-rules/` |
| **ID pattern** | `BRULE-{NNN}-{slug}` |
| **schema** | `entity-instance/v1` |

## meaning

Rule business có thể đánh giá đúng/sai.

## instance criteria

Khi business có rule rõ ràng ảnh hưởng process hoặc decision.

## required fields

schema, id, slug, title, entity_type, layer, concern, status, summary

Body: Summary, Meaning, Statement, Condition, Outcome, Scope, Relations, Validation Notes

## optional fields

scope, owner, exceptions, affected_processes, theory_basis

## lifecycle

draft → active → superseded → retired

## structure extends

Base: `entity-instance/v1`

Required sections:

- `Statement`
- `Condition`
- `Outcome`
- `Scope`

Optional sections:

- `Owner`
- `Exceptions`
- `Affected Processes`

Additional validation:

- BusinessRule phải đánh giá được đúng/sai trong business context.
- Không dùng BusinessRule để ghi domain invariant hoặc database constraint.

## allowed relations (candidate)

```text
BusinessRule → Process (applies_to)
BusinessRule → Invariant (may_refine_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Business Rule vs Domain Invariant
