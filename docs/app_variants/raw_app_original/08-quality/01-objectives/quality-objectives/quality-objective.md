# QualityObjective

| Field | Value |
|-------|-------|
| **name** | QualityObjective |
| **layer** | `08-quality` |
| **concern** | `01-objectives` |
| **folder** | `quality-objectives/` |
| **ID pattern** | `QO-{NNN}-{slug}` |

## meaning

Mục tiêu chất lượng có thể đo hoặc kiểm chứng cho app.

## instance criteria

Khi project cần target rõ về correctness, reliability, performance, security hoặc maintainability.

## required fields

id, slug, entity_type, layer, concern, status

Body: target, measurement, scope

## optional fields

priority, tolerance, owner, evidence, related_requirements

## lifecycle

planned -> active -> retired

## allowed relations (candidate)

```text
QualityObjective -> VerificationCheck (measured_by)
QualityObjective -> ReliabilityControl (supported_by)
```

## validation

- Objective nên đo được khi có thể
