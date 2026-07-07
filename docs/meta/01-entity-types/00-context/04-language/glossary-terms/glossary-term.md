# GlossaryTerm

| Field | Value |
|-------|-------|
| **name** | GlossaryTerm |
| **layer** | `00-context` |
| **concern** | `04-language` |
| **folder** | `glossary-terms/` |
| **ID pattern** | `GLO-{NNN}-{slug}` |

## meaning

Thuật ngữ dùng chung toàn project với definition canonical.

## instance criteria

Khi thuật ngữ dễ nhầm hoặc cần meaning thống nhất cross-layer.

## required fields

id, slug, entity_type, layer, concern, status

Body: term, definition

## optional fields

aliases, not_to_be_confused_with, scope, related_entities

## lifecycle

draft → active → deprecated

## allowed relations (candidate)

```text
GlossaryTerm → DomainConcept (related_term)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Không định nghĩa Business Rule
- Phân biệt với DomainConcept
