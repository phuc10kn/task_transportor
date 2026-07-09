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

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Không định nghĩa Business Rule
- Phân biệt với DomainConcept


