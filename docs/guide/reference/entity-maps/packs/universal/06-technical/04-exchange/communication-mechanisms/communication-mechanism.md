# CommunicationMechanism

| Field | Value |
|-------|-------|
| **name** | CommunicationMechanism |
| **layer** | `06-technical` |
| **concern** | `04-exchange` |
| **folder** | `communication-mechanisms/` |
| **ID pattern** | `TECH-COM-{NNN}-{slug}` |

## meaning

Cơ chế kỹ thuật cho runtime component giao tiếp như HTTP, queue, polling hoặc event transport.

## instance criteria

Khi cách giao tiếp ảnh hưởng retry, timeout, delivery semantics hoặc coupling của app.

## required fields

id, slug, entity_type, layer, concern, status

Body: mechanism, delivery_mode, rationale

## optional fields

timeouts, retry_policy, ordering, idempotency, decision_basis

## lifecycle

draft -> active -> superseded

## relation templates

```text
CommunicationMechanism -> Interface (transports)
CommunicationMechanism -> ExecutionMechanism (used_by)
CommunicationMechanism -> ReliabilityControl (observed_by)
```

## validation

- Không trộn mechanism với business workflow
