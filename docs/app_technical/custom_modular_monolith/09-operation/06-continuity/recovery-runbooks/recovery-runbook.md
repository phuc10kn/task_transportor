# RecoveryRunbook

| Field | Value |
|-------|-------|
| **name** | RecoveryRunbook |
| **layer** | `09-operation` |
| **concern** | `06-continuity` |
| **folder** | `recovery-runbooks/` |
| **ID pattern** | `OPS-REC-{NNN}-{slug}` |

## meaning

Procedure phục hồi service hoặc data sau failure.

## instance criteria

Khi app cần backup/restore, disaster recovery hoặc partial recovery có step và evidence rõ.

## required fields

id, slug, entity_type, layer, concern, status

Body: trigger, scope, procedure

## optional fields

RPO, RTO, prerequisites, validation, test_status, owner

## lifecycle

draft -> active -> tested -> superseded

## allowed relations (candidate)

```text
RecoveryRunbook -> DataStore (recovers)
RecoveryRunbook -> RuntimeEnvironment (used_in)
RecoveryRunbook -> IncidentRecord (used_by)
```

## validation

- Runbook nên có test status hoặc last tested
