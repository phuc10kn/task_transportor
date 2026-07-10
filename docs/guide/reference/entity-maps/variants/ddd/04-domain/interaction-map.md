# Interaction Map — DDD / 04-domain

Reading view cho relation template DDD tactical ở layer `04-domain`. Source rules: [DDD valid triples](../../../packs/variants/ddd/04-domain/valid-triples.md).

## Graph

```mermaid
flowchart LR
  DC[DomainConcept]
  DE[DomainEntity]
  VO[ValueObject]
  AG[Aggregate]
  INV[Invariant]
  DP[DomainPolicy]
  DS[DomainService]
  DEV[DomainEvent]
  LC[Lifecycle]

  DC -->|models| DE
  DE -->|member_of| AG
  AG -->|contains| DE
  VO -->|used_by| DE
  AG -->|enforces| INV
  INV -->|constrains| DE
  INV -->|constrains| VO
  DP -->|applied_by| DS
  DS -->|operates_on| DE
  DEV -->|raised_by| AG
  DEV -->|marks_transition| LC
  LC -->|describes| DE
  LC -->|emits| DEV
```

## Ghi chú

- Pack khác (không DDD) = variant khác; không sửa map này thành “mọi domain”.
- Dual `contains` / `member_of` có thể còn mở — `docs/review/review.md`.
- Triple list canonical thuộc [DDD valid triples](../../../packs/variants/ddd/04-domain/valid-triples.md).
