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

## allowed relations (candidate)

```text
Environment → Application (hosts)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Context Environment vs Operation Runtime
