# ConfigurationSet

| Field | Value |
|-------|-------|
| **name** | ConfigurationSet |
| **layer** | `06-technical` |
| **concern** | `07-configuration` |
| **folder** | `configuration-sets/` |
| **ID pattern** | `TECH-CONF-{NNN}-{slug}` |

## meaning

Nhóm cấu hình runtime điều khiển một capability hoặc một integration area của app.

## instance criteria

Khi nhiều config cùng phục vụ một concern như auth, AI, queue hoặc storage path.

## required fields

id, slug, entity_type, layer, concern, status

Body: scope, source, precedence

## optional fields

reload_behavior, sensitive_fields, validation, related_platforms

## lifecycle

draft -> active -> deprecated

## allowed relations (candidate)

```text
ConfigurationSet -> Platform (configures)
ConfigurationSet -> RuntimeEnvironment (applied_in)
ConfigurationSet -> MaintenanceProcedure (rotated_by)
```

## validation

- Không copy toàn bộ `.env` vào entity này
