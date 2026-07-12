# DomainConcept

| Field | Value |
|-------|-------|
| **name** | DomainConcept |
| **layer** | `04-domain` |
| **concern** | `01-language` |
| **folder** | `domain-concepts/` |
| **ID pattern** | `DC-{NNN}` |
| **Instance folder pattern** | `DC-{NNN}-{slug}` |

## meaning

Khái niệm chuyên biệt trong domain model.

## instance criteria

Khi domain term có meaning khác GlossaryTerm hoặc cần precision.

## required fields

id, slug, entity_type, layer, concern, status

Body: name, definition, meaning

## optional fields

boundaries, examples, non_examples, related_business_terms, related_domain_entities

## lifecycle

draft → active → deprecated

## relations_template

| Slot | Relation Type | Target Entity Type | Requirement Mode | Cardinality |
| --- | --- | --- | --- | --- |
| models | `models` | DomainEntity | allowed_when_known | 0..n |
| specializes | `specializes` | GlossaryTerm | allowed_when_known | 0..n |

Relation slot chỉ hợp lệ khi relation type tồn tại trong `docs/meta/02-relation-types/` và valid triple tương ứng tồn tại trong `docs/meta/03-rules/`.

## validation

- Phân biệt Context Glossary vs Domain Concept


