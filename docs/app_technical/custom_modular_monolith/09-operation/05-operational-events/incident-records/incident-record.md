# IncidentRecord

| Field | Value |
|-------|-------|
| **name** | IncidentRecord |
| **layer** | `09-operation` |
| **concern** | `05-operational-events` |
| **folder** | `incident-records/` |
| **ID pattern** | `INC-{NNN}-{slug}` |

## meaning

Sự cố vận hành đã xảy ra và cần giữ như operational knowledge.

## instance criteria

Khi incident có impact thật, timeline hoặc follow-up action đáng giữ.

## required fields

id, slug, entity_type, layer, concern, status

Body: impact, severity, timeline

## optional fields

root_cause, affected_entities, resolution, follow_up, related_defects

## lifecycle

open -> mitigated -> resolved -> reviewed

## allowed relations (candidate)

```text
IncidentRecord -> RuntimeEnvironment (occurs_in)
IncidentRecord -> DefectRecord (raises)
IncidentRecord -> RecoveryRunbook (handled_by)
```

## validation

- Incident != generic bug report
