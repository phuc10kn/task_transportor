# MaintainabilityItem

| Field | Value |
|-------|-------|
| **name** | MaintainabilityItem |
| **layer** | `08-quality` |
| **concern** | `07-maintainability` |
| **folder** | `maintainability-items/` |
| **ID pattern** | `MAIN-{NNN}-{slug}` |

## meaning

Điểm nợ hoặc concern ảnh hưởng khả năng thay đổi an toàn của hệ thống về dài hạn.

## instance criteria

Khi complexity, duplication, legacy dependency hoặc doc debt có tác động kỹ thuật rõ.

## required fields

id, slug, entity_type, layer, concern, status

Body: problem, impact, scope

## optional fields

urgency, remediation, affected_entities, owner, trend

## lifecycle

open -> accepted -> remediated

## relation templates

```text
MaintainabilityItem -> RiskRecord (increases)
```

## validation

- Không ghi mọi refactor mong muốn vào đây
