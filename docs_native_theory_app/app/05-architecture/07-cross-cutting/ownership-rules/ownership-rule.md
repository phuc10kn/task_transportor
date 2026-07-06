# OwnershipRule

| Field | Value |
|-------|-------|
| **name** | OwnershipRule |
| **layer** | `05-architecture` |
| **concern** | `07-cross-cutting` |
| **folder** | `ownership-rules/` |
| **ID pattern** | `OR-{NNN}-{slug}` |

## meaning

Rule cắt ngang giữ owner-write discipline và tránh shared ownership giả.

## use when

Khi cùng DB, cùng app runtime nhưng vẫn phải giữ business ownership rõ ràng.
