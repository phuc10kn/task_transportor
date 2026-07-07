# DataStore

| Field | Value |
|-------|-------|
| **name** | DataStore |
| **layer** | `06-technical` |
| **concern** | `03-persistence` |
| **folder** | `data-stores/` |
| **ID pattern** | `TECH-DS-{NNN}-{slug}` |

## meaning

Persistence mechanism hoặc storage unit dùng để lưu state hoặc artifact của app.

## instance criteria

Khi store có role riêng như canonical DB, queue persistence, blob store hoặc cache.

## required fields

id, slug, entity_type, layer, concern, status

Body: role, storage_model, owner_scope

## optional fields

retention, backup_notes, transaction_notes, sensitivity, decision_basis

## lifecycle

planned -> active -> retired

## allowed relations (candidate)

```text
DataStore -> StateOwner (stores)
DataStore -> RecoveryRunbook (recovered_by)
DataStore -> DataAccessComponent (used_by)
```

## validation

- DataStore != table document
