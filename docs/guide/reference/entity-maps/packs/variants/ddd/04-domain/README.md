# DDD Tactical - 04-domain Base

Base này giữ reusable type, relation và triple template cho DDD tactical. Nó không tạo entity instance, không định nghĩa runtime methodology field và không quản lý lifecycle local của project.

## Entity Types

- [DomainConcept](entity-types/01-language/domain-concepts/domain-concept.md)
- [DomainEntity](entity-types/02-model/01-entities/domain-entity.md)
- [ValueObject](entity-types/02-model/02-value-objects/value-object.md)
- [Aggregate](entity-types/02-model/03-aggregates/aggregate.md)
- [Invariant](entity-types/03-rules/01-invariants/invariant.md)
- [DomainPolicy](entity-types/03-rules/02-domain-policies/domain-policy.md)
- [DomainService](entity-types/04-behavior/01-domain-services/domain-service.md)
- [DomainEvent](entity-types/04-behavior/02-domain-events/domain-event.md)
- [Lifecycle](entity-types/05-lifecycle/lifecycles/lifecycle.md)

## Relation And Rule Templates

- [DDD valid triples](valid-triples.md)
- [DDD cross-layer valid triples](cross-layer-valid-triples.md)
- Relation definitions: `relation-types/`, gồm generic dependencies trong `relation-types/shared/` và cross-layer dependencies trong `relation-types/cross-layer/`.
