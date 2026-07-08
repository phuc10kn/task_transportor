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

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| integrates_with_context | `integrates_with_context` | Application | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả API, adapter, protocol
