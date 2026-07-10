# DataOwnershipBoundary

| Field | Value |
|-------|-------|
| **name** | DataOwnershipBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `data-ownership-boundaries/` |
| **ID pattern** | `DOB-{NNN}-{slug}` |

## meaning

Boundary xác định owner write thật của aggregate hoặc state business.

## use when

Khi cần chốt rõ ai được ghi, ai chỉ được đọc, và cross-module write đi qua đâu.
