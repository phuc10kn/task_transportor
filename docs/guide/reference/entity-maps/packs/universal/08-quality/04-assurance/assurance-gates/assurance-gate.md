# AssuranceGate

| Field | Value |
|-------|-------|
| **name** | AssuranceGate |
| **layer** | `08-quality` |
| **concern** | `04-assurance` |
| **folder** | `assurance-gates/` |
| **ID pattern** | `AG-{NNN}-{slug}` |

## meaning

Điểm kiểm soát yêu cầu review, approval hoặc independent checking trước khi thay đổi được chấp nhận.

## instance criteria

Khi project cần human review hoặc specialized review cho change có impact đáng kể.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, required_review, pass_condition

## optional fields

approver, exceptions, escalation, related_risks

## lifecycle

draft -> active -> superseded

## relation templates

```text
AssuranceGate -> RiskRecord (mitigates)
AssuranceGate -> ReleaseGate (feeds)
AssuranceGate -> ModuleBoundary (protects)
```

## validation

- Gate phải có pass condition rõ
