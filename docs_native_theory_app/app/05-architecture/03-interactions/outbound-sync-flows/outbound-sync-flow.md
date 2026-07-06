# OutboundSyncFlow

| Field | Value |
|-------|-------|
| **name** | OutboundSyncFlow |
| **layer** | `05-architecture` |
| **concern** | `03-interactions` |
| **folder** | `outbound-sync-flows/` |
| **ID pattern** | `OSF-{NNN}-{slug}` |

## meaning

Luồng ghi thật từ canonical core sang external target.

## use when

Khi flow cần validate freshness, external client call và write back result qua owner API hoặc journal.
