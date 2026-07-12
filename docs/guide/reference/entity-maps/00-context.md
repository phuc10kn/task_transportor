# Entity Map — 00-context

Derived from: [overview.md](overview.md), [folder-structure.md](../folder-structure.md) § 00-context

## Câu hỏi

App tồn tại trong bối cảnh nào?

## Concern lens (pure/default)

```mermaid
flowchart TB
  Ctx[00-context]
  Ctx --> Overview
  Ctx --> ScopeC[Scope]
  Ctx --> Premises
  Ctx --> Language
  Ctx --> Ecosystem
  Ctx --> EnvironmentC[Environment]
```

Pure source: [universal 00-context pack](packs/universal/00-context/README.md).

Map này chỉ giữ concern lens. Entity type, relation slot và valid triple active thuộc `docs/meta/` của project.

## Status

Chưa có default canonical entity type set hoặc interaction graph trong guide cho layer này. Type/graph active thuộc `docs/meta/` của project.
