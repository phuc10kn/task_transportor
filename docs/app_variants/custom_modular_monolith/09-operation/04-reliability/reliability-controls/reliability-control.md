# ReliabilityControl

| Field | Value |
|-------|-------|
| **name** | ReliabilityControl |
| **layer** | `09-operation` |
| **concern** | `04-reliability` |
| **folder** | `reliability-controls/` |
| **ID pattern** | `OPS-REL-{NNN}-{slug}` |

## meaning

Control vận hành giúp duy trì service continuity như health check, failover, fallback hoặc degradation rule.

## instance criteria

Khi control có failure mode, trigger và response quan trọng với production.

## required fields

id, slug, entity_type, layer, concern, status

Body: protected_scope, failure_mode, response

## optional fields

detection, fallback, owner, related_signals, quality_objective

## lifecycle

draft -> active -> evolved

## allowed relations (candidate)

```text
ReliabilityControl -> RuntimeEnvironment (protects)
ReliabilityControl -> ObservabilitySignal (observed_by)
ReliabilityControl -> RecoveryRunbook (backed_by)
```

## validation

- Control phải mô tả failure được xử lý thế nào
