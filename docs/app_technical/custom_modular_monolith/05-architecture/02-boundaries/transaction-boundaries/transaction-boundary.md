# TransactionBoundary

| Field | Value |
|-------|-------|
| **name** | TransactionBoundary |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `transaction-boundaries/` |
| **ID pattern** | `TB-{NNN}-{slug}` |

## meaning

Boundary chốt phạm vi commit logic cho một action ghi quan trọng.

## use when

Khi cần mô tả rõ `load/lock -> run use case -> write owner state -> write journal/audit -> commit`.
