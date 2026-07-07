# ExecutionState

| Field | Value |
|-------|-------|
| **name** | ExecutionState |
| **layer** | `05-architecture` |
| **concern** | `04-state` |
| **folder** | `execution-states/` |
| **ID pattern** | `ES-{NNN}-{slug}` |

## meaning

State của job queue, worker progress, retry, cancel hoặc stale recovery.

## use when

Khi hệ thống tách business state khỏi execution mechanics.
