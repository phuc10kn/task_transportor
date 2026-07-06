# IntegrationAdapter

| Field | Value |
|-------|-------|
| **name** | IntegrationAdapter |
| **layer** | `07-implementation` |
| **concern** | `05-integration` |
| **folder** | `integration-adapters/` |
| **ID pattern** | `IMPL-INT-{NNN}-{slug}` |

## meaning

Source component che giấu external dependency hoặc external protocol khỏi business code.

## instance criteria

Khi adapter mapping model ngoài vào model trong, hoặc encapsulate auth/protocol/retry.

## required fields

id, slug, entity_type, layer, concern, status

Body: external_dependency, purpose, owner

## optional fields

input_model, output_model, failure_behavior, configuration_set, related_interface

## lifecycle

draft -> active -> retired

## allowed relations (candidate)

```text
IntegrationAdapter -> Interface (implements)
IntegrationAdapter -> ExecutionMechanism (used_by)
IntegrationAdapter -> SecurityMechanism (uses)
```

## validation

- Adapter không được sở hữu business state
