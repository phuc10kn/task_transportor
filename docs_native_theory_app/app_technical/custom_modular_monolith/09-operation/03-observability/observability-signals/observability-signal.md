# ObservabilitySignal

| Field | Value |
|-------|-------|
| **name** | ObservabilitySignal |
| **layer** | `09-operation` |
| **concern** | `03-observability` |
| **folder** | `observability-signals/` |
| **ID pattern** | `OPS-OBS-{NNN}-{slug}` |

## meaning

Signal vận hành có thể được theo dõi như metric, log view, trace, dashboard hoặc alert.

## instance criteria

Khi signal phục vụ phát hiện failure, capacity issue hoặc production health quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: signal, source, operational_use

## optional fields

threshold, consumers, retention, action, related_quality_targets

## lifecycle

planned -> active -> deprecated

## allowed relations (candidate)

```text
ObservabilitySignal -> RuntimeEnvironment (monitors)
ObservabilitySignal -> ReliabilityControl (supports)
ObservabilitySignal -> IncidentRecord (detects)
```

## validation

- Signal quan trọng phải dẫn đến action rõ
