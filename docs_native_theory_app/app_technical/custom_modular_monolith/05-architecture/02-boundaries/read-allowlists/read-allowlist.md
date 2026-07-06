# ReadAllowlist

| Field | Value |
|-------|-------|
| **name** | ReadAllowlist |
| **layer** | `05-architecture` |
| **concern** | `02-boundaries` |
| **folder** | `read-allowlists/` |
| **ID pattern** | `RAL-{NNN}-{slug}` |

## meaning

Danh sách read exception hợp lệ giữa các module, có tier và lý do rõ ràng.

## use when

Khi module cần orchestration read, reporting read, outbound snapshot read hoặc presentation composition.
