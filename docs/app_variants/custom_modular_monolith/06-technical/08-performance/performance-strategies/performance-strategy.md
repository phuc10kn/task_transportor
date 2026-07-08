# PerformanceStrategy

| Field | Value |
|-------|-------|
| **name** | PerformanceStrategy |
| **layer** | `06-technical` |
| **concern** | `08-performance` |
| **folder** | `performance-strategies/` |
| **ID pattern** | `TECH-PERF-{NNN}-{slug}` |

## meaning

Cơ chế kỹ thuật được chọn để đáp ứng hoặc bảo vệ mục tiêu hiệu năng.

## instance criteria

Khi app dùng caching, batching, pagination, pooling hoặc rate limiting như chiến lược có chủ đích.

## required fields

id, slug, entity_type, layer, concern, status

Body: strategy, target_workload, expected_benefit

## optional fields

tradeoffs, risks, observability, invalidation_rules, quality_basis

## lifecycle

proposed -> active -> retired

## allowed relations (candidate)

```text
PerformanceStrategy -> QualityObjective (supports)
PerformanceStrategy -> CapacityPlan (affects)
PerformanceStrategy -> DataStore (optimizes)
```

## validation

- Strategy phải có workload hoặc target rõ
