# Screen

| Field | Value |
|-------|-------|
| **name** | Screen |
| **layer** | `03-interface` |
| **concern** | `03-structure` |
| **folder** | `screens/` |
| **ID pattern** | `SCR-{NNN}-{slug}` |

## meaning

Đơn vị giao diện có mục đích rõ ràng.

## instance criteria

Khi screen có knowledge value (không document mọi view nhỏ).

## required fields

id, slug, entity_type, layer, concern, status

Body: purpose, primary_users

## optional fields

supported_use_cases, supported_features, entry_conditions, main_content, available_actions, states

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Required | Cardinality |
| --- | --- | --- | --- | --- |
| supports | `supports` | Feature | false | 0..n |
| composed_of | `composed_of` | UIComponent | false | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không mô tả component tree chi tiết
