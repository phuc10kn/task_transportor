# ReleaseGate

| Field | Value |
|-------|-------|
| **name** | ReleaseGate |
| **layer** | `08-quality` |
| **concern** | `08-release-readiness` |
| **folder** | `release-gates/` |
| **ID pattern** | `RG-{NNN}-{slug}` |

## meaning

Điều kiện quality bắt buộc để một release hoặc rollout được phép tiếp tục.

## instance criteria

Khi release cần evidence rõ như test pass, defect threshold, approval hoặc rollback readiness.

## required fields

id, slug, entity_type, layer, concern, status

Body: scope, pass_conditions, blocking_conditions

## optional fields

approver, evidence, exceptions, related_runbooks

## lifecycle

draft -> active -> retired

## allowed relations (candidate)

```text
ReleaseGate -> VerificationCheck (requires)
ReleaseGate -> DeploymentRunbook (controls)
```

## validation

- Gate phải dựa trên evidence, không dựa trên cảm giác
