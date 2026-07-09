# Environment

| Field | Value |
|-------|-------|
| **name** | Environment |
| **layer** | `00-context` |
| **concern** | `06-environment` |
| **folder** | `environments/` |
| **ID pattern** | `ENV-{NNN}-{slug}` |

## meaning

Environment có ý nghĩa ở mức project context.

## instance criteria

Khi environment khác biệt về purpose, data sensitivity.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, purpose

## optional fields

users, data_sensitivity, external_dependencies, availability_expectation, production_similarity

## lifecycle

active → retired

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| hosts | `hosts` | Application | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Context Environment vs Operation Runtime


