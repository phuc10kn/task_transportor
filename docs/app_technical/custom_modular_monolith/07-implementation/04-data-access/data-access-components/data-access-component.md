# DataAccessComponent

| Field | Value |
|-------|-------|
| **name** | DataAccessComponent |
| **layer** | `07-implementation` |
| **concern** | `04-data-access` |
| **folder** | `data-access-components/` |
| **ID pattern** | `IMPL-DATA-{NNN}-{slug}` |

## meaning

Source component chịu trách nhiệm đọc, ghi hoặc map dữ liệu như repository, query gateway hoặc mapper.

## instance criteria

Khi component data access phản ánh một boundary hoặc transaction pattern quan trọng.

## required fields

id, slug, entity_type, layer, concern, status

Body: role, owner_module, accessed_store

## optional fields

queries, writes, transaction_scope, related_state, performance_notes

## lifecycle

planned -> active -> replaced

## allowed relations (candidate)

```text
DataAccessComponent -> DataStore (uses)
DataAccessComponent -> StateOwner (reads_or_writes)
DataAccessComponent -> VerificationCheck (verified_by)
```

## validation

- Không dùng entity này cho query trivial không có knowledge value
