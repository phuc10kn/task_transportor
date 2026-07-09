# Entity Types — DDD / 04-domain

Derived from: `docs/meta/01-entity-types/04-domain/`, [folder-structure.md](../../../../folder-structure.md) § 04-domain

## Concern → Entity

```mermaid
flowchart TB
  D[04-domain DDD]
  D --> Language
  D --> Model
  D --> Rules
  D --> Behavior
  D --> LifecycleC[Lifecycle]

  Language --> DomainConcept
  Model --> DomainEntity
  Model --> ValueObject
  Model --> Aggregate
  Rules --> Invariant
  Rules --> DomainPolicy
  Behavior --> DomainService
  Behavior --> DomainEvent
  LifecycleC --> Lifecycle
```

| Concern (04) | Entity types |
| --- | --- |
| Language | DomainConcept |
| Model | DomainEntity, ValueObject, Aggregate |
| Rules | Invariant, DomainPolicy |
| Behavior | DomainService, DomainEvent |
| Lifecycle | Lifecycle |

Định nghĩa: `docs/meta/01-entity-types/04-domain/` (khi materialize theo pack này).

Quan hệ: [interaction-map.md](interaction-map.md).
