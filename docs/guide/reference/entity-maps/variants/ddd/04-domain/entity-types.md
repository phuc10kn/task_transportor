# Type View — DDD / 04-domain

Status: **reading view**. Source pack: [../../../packs/variants/ddd/04-domain/README.md](../../../packs/variants/ddd/04-domain/README.md), [folder-structure.md](../../../../folder-structure.md) § 04-domain

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

Danh sách stable type template thuộc [DDD 04-domain base](../../../packs/variants/ddd/04-domain/README.md). `docs/meta/01-entity-types/04-domain/` giữ contract active của project.

Quan hệ: [interaction-map.md](interaction-map.md).
