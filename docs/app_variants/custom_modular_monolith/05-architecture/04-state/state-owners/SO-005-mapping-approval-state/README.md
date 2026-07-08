---
id: SO-005
slug: mapping-approval-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# SO-005 - Mapping Approval State

## Meaning

State của mapping rule draft, approved hoặc rejected dùng cho outbound value translation.

## Owner

`Mapping`

## Reason

Approved mapping là knowledge nội bộ cần review rõ ràng và không nên gắn ownership vào module integration consumer.

## Write policy

- `Mapping` write `mapping_rules`.
- Consumer khác chỉ tra cứu approved rule.

## Consumers

- `Jira`
- `Projects`
- admin mapping UI

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Mapping/MappingApi.js`
