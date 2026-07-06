# ExternalSystem

| Field | Value |
|-------|-------|
| **name** | ExternalSystem |
| **layer** | `00-context` |
| **concern** | `05-ecosystem` |
| **folder** | `external-systems/` |
| **ID pattern** | `EXT-{NNN}-{slug}` |

## meaning

Hệ thống bên ngoài ở mức context — không phải technical integration.

## instance criteria

Khi external dependency có ý nghĩa với scope hoặc ecosystem.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, purpose, relationship

## optional fields

owner, data_exchanged, criticality, dependency_level, known_limitations

## lifecycle

active → deprecated | replaced

## allowed relations (candidate)

```text
ExternalSystem → Application (integrates_with_context)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không mô tả API, adapter, protocol
