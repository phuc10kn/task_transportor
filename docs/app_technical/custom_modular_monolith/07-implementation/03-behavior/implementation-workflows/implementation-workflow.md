# ImplementationWorkflow

| Field | Value |
|-------|-------|
| **name** | ImplementationWorkflow |
| **layer** | `07-implementation` |
| **concern** | `03-behavior` |
| **folder** | `implementation-workflows/` |
| **ID pattern** | `IMPL-BEH-{NNN}-{slug}` |

## meaning

Mô tả cách source code tổ chức việc thực thi một use case hoặc orchestration quan trọng.

## instance criteria

Khi behavior đủ quan trọng để cần knowledge về owner, side effect hoặc sequencing.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, owner, implementation_path

## optional fields

side_effects, transaction_notes, retry_notes, related_use_cases

## lifecycle

draft -> active -> changed

## allowed relations (candidate)

```text
ImplementationWorkflow -> InteractionFlow (implements)
ImplementationWorkflow -> DataAccessComponent (uses)
ImplementationWorkflow -> IntegrationAdapter (uses)
```

## validation

- Không lẫn với business process ở layer business
