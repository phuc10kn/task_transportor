# Scenario

| Field | Value |
|-------|-------|
| **name** | Scenario |
| **layer** | `01-business` |
| **concern** | `04-behavior` |
| **folder** | `scenarios/` |
| **ID pattern** | `SCN-{NNN}-{slug}` |

## meaning

Luồng end-to-end kết hợp nhiều Process.

## instance criteria

Khi cần mô tả journey business qua nhiều process.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, description, composed_processes

## optional fields

trigger, outcomes, stakeholders

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
Scenario → Process (composes)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Flow diagram chỉ là view, không phải Entity Type
