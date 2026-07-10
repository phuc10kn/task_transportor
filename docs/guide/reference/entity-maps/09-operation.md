# Entity Map — 09-operation

Derived from: [overview.md](overview.md), [folder-structure.md](../folder-structure.md) § 09-operation

## Câu hỏi

Hệ thống chạy, quan sát, duy trì và phục hồi thế nào?

## Concern lens (default)

```mermaid
flowchart TB
  O[09-operation]
  O --> OperatingContext[Operating Context]
  O --> ReleaseAndChange[Release And Change]
  O --> Signals
  O --> Reliability
  O --> OperationalEvents[Operational Events]
  O --> Continuity
  O --> Resources
  O --> Maintenance
```

Concern definition và boundary: [universal pack 09-operation](packs/universal/09-operation/README.md).

## Status

Chưa có default canonical entity type set hoặc interaction graph đã chốt cho layer này. File hiện là concern map; chỉ bổ sung stable map khi vocabulary type và canonical relation đã có reusable meaning rõ.

## Generic taxonomy

Taxonomy generic thuộc [universal pack 09-operation](packs/universal/09-operation/README.md), không phải canonical registry.
