# Problem

| Field | Value |
|-------|-------|
| **name** | Problem |
| **layer** | `01-business` |
| **concern** | `01-discovery` |
| **folder** | `problems/` |
| **ID pattern** | `PROB-{NNN}-{slug}` |

## meaning

Vấn đề business cần hiểu trước khi xác định solution.

## instance criteria

Khi business pain đã được xác định hoặc cần validate.

## required fields

id, slug, entity_type, layer, concern, status

Body: statement, affected_stakeholders, current_impact

## optional fields

evidence, known_causes, frequency, severity, related_processes, theory_basis

## lifecycle

identified → validated → addressed → closed

## allowed relations (candidate)

```text
Problem → Goal (motivates)
Problem → Stakeholder (affects)
Problem → BusinessRequirement (leads_to)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Mô tả business pain, không viết 'hệ thống chưa có X'
- Cần evidence hoặc NOTE-EVIDENCE nếu chưa có
