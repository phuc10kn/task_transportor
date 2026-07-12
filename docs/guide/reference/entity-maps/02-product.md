# Entity Map — 02-product

Derived from: [overview.md](overview.md), [folder-structure.md](../folder-structure.md) § 02-product

## Câu hỏi

Product phải cung cấp gì?

## Concern lens (pure/default)

```mermaid
flowchart TB
  P[02-product]
  P --> Needs
  P --> Capabilities
  P --> Behavior
  P --> Delivery
  P --> Specification
  P --> Acceptance
```

Pure source: [universal 02-product pack](packs/universal/02-product/README.md).

Map này chỉ giữ concern lens. Entity type, relation slot và valid triple active thuộc `docs/meta/` của project.

## Status

Chưa có default canonical entity type set hoặc interaction graph trong guide cho layer này. Type/graph active thuộc `docs/meta/` của project.
