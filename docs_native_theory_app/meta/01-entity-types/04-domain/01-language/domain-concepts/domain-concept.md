# DomainConcept

| Field | Value |
|-------|-------|
| **name** | DomainConcept |
| **layer** | `04-domain` |
| **concern** | `01-language` |
| **folder** | `domain-concepts/` |
| **ID pattern** | `DC-{NNN}-{slug}` |

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

## allowed relations (candidate)

```text
DomainConcept → DomainEntity (models)
DomainConcept → GlossaryTerm (specializes)
```

Relation chưa canonical cho tới khi chốt tại `docs/meta/02-relation-types/`.

## validation

- Phân biệt Context Glossary vs Domain Concept
