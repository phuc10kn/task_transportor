# ReviewState

| Field | Value |
|-------|-------|
| **name** | ReviewState |
| **layer** | `05-architecture` |
| **concern** | `04-state` |
| **folder** | `review-states/` |
| **ID pattern** | `RS-{NNN}-{slug}` |

## meaning

State của shared draft, approve hoặc reject trước khi apply vào canonical state; Save Draft không phải canonical outcome.

## use when

Khi hệ thống có human-in-the-loop hoặc staged approval.
