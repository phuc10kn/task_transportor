# BusinessRule

| Field | Value |
|-------|-------|
| **name** | BusinessRule |
| **layer** | `01-business` |
| **concern** | `05-governance` |
| **folder** | `business-rules/` |
| **ID pattern** | `BRULE-{NNN}` |
| **Instance folder pattern** | `BRULE-{NNN}-{slug}` |
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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| governs | `governs` | Process | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Business Rule vs Domain Invariant

