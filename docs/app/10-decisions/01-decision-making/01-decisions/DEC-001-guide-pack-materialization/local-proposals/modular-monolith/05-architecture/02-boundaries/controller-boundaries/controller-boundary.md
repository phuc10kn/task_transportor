# ControllerBoundary

| Field | Value |
|-------|-------|
| **name** | ControllerBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `controller-boundaries/` |
| **ID pattern** | `CB-{NNN}-{slug}` |

## meaning

Rule chốt controller nào sở hữu route nào và route wrapper được phép mỏng đến đâu.

## use when

Khi project có compatibility route, migration route hoặc nhiều module cùng chạm HTTP surface.
