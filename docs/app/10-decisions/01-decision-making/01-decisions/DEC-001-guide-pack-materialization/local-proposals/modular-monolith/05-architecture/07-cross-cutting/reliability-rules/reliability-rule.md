# ReliabilityRule

| Field | Value |
|-------|-------|
| **name** | ReliabilityRule |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `reliability-rules/` |
| **ID pattern** | `RR-{NNN}-{slug}` |

## meaning

Rule cắt ngang về retry, stale recovery, fail-safe path hoặc durability của execution.

## use when

Khi worker hoặc external integration có lỗi lặp lại và cần rule nhất quán toàn app.
