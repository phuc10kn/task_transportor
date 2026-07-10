# CapacityPlan

| Field | Value |
|-------|-------|
| **name** | CapacityPlan |
| **layer** | `09-operation` |
| **concern** | `07-resources` |
| **folder** | `capacity-plans/` |
| **ID pattern** | `OPS-CAP-{NNN}-{slug}` |

## meaning

Knowledge về limit, growth, threshold và scaling plan của runtime hoặc dependency quan trọng.

## instance criteria

Khi resource có nguy cơ thành bottleneck hoặc có chi phí đáng kể khi scale.

## required fields

id, slug, entity_type, layer, concern, status

Body: resource, current_limit, scaling_strategy

## optional fields

trend, threshold, cost_impact, time_to_exhaustion, related_signals

## lifecycle

draft -> active -> revised

## relation templates

```text
CapacityPlan -> RuntimeEnvironment (plans_capacity_for)
CapacityPlan -> PerformanceStrategy (informed_by)
CapacityPlan -> ObservabilitySignal (tracked_by)
```

## validation

- Không chỉ ghi snapshot usage hiện tại
