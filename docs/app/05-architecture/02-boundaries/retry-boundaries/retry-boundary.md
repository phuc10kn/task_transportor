# RetryBoundary

| Field | Value |
|-------|-------|
| **name** | RetryBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `retry-boundaries/` |
| **ID pattern** | `RB-{NNN}-{slug}` |

## meaning

Boundary chốt tầng nào được quyết định retry, backoff, fail hay journal khi có external error.

## use when

Khi project có worker, job queue hoặc outbound integration cần structured retry policy.
