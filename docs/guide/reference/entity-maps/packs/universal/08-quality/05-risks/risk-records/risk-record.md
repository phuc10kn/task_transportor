# RiskRecord

| Field | Value |
|-------|-------|
| **name** | RiskRecord |
| **layer** | `08-quality` |
| **concern** | `05-risks` |
| **folder** | `risk-records/` |
| **ID pattern** | `RISK-{NNN}-{slug}` |

## meaning

Rủi ro chất lượng hoặc delivery có thể xảy ra nhưng chưa chắc đã trở thành defect.

## instance criteria

Khi app có threat, coupling hoặc uncertainty đủ lớn để cần mitigation và owner.

## required fields

id, slug, entity_type, layer, concern, status

Body: description, impact, likelihood

## optional fields

cause, owner, mitigation, affected_entities, acceptance_status

## lifecycle

open -> monitored -> closed

## relation templates

```text
RiskRecord -> AssuranceGate (mitigated_by)
RiskRecord -> DefectRecord (materialized_as)
RiskRecord -> ReliabilityControl (reduced_by)
```

## validation

- Risk != defect đã xảy ra
