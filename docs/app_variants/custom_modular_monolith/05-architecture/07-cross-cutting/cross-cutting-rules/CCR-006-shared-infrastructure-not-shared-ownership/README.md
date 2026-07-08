---
id: CCR-006
slug: shared-infrastructure-not-shared-ownership
entity_type: CrossCuttingRule
layer: 05-architecture
concern: 07-cross-cutting
status: active
theory_basis:
  - TH-MOD-05
  - TH-MOD-06
---

# CCR-006 - Shared Infrastructure Not Shared Ownership

## Meaning

Repo dùng chung Express app, SQLite, local storage và một số infrastructure adapter, nhưng ownership nghiệp vụ vẫn nằm theo module.

## Statement

Chia sẻ runtime hoặc persistence là quyết định kỹ thuật; nó không cho phép bỏ qua boundary owner-write hoặc nhúng logic domain sang module khác.

## Scope

Toàn bộ monolith, đặc biệt `Cis`, `Translation`, `Sync`, `Jira`

## Evidence

- `src/app.js`
- `src/server.js`
- `docs/app/05-architecture/01-structure/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`
