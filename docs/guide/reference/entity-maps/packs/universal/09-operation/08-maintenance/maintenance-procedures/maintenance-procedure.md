# MaintenanceProcedure

| Field | Value |
|-------|-------|
| **name** | MaintenanceProcedure |
| **layer** | `09-operation` |
| **concern** | `08-maintenance` |
| **folder** | `maintenance-procedures/` |
| **ID pattern** | `OPS-MAIN-{NNN}-{slug}` |

## meaning

Procedure bảo trì định kỳ hoặc theo trigger để hệ thống tiếp tục khỏe về dài hạn.

## instance criteria

Khi app cần upgrade, rotation, cleanup hoặc scheduled maintenance có owner và verification.

## required fields

id, slug, entity_type, layer, concern, status

Body: scope, trigger_or_schedule, procedure

## optional fields

owner, impact, verification, rollback, dependencies

## lifecycle

project-defined lifecycle (see local docs/meta)

## relation templates

```text
MaintenanceProcedure -> RuntimeEnvironment (maintains)
MaintenanceProcedure -> SecurityMechanism (rotates)
MaintenanceProcedure -> Platform (upgrades)
```

## validation

- Procedure phải có owner hoặc schedule rõ
