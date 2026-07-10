---
schema: entity-instance/v1
id: SO-005
slug: mapping-approval-state
title: Mapping Approval State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: State mapping rule approved và rejected do Mapping sở hữu.
theory_basis:
  - TH-SYNC-SAFE-03
  - TH-CANON-04
---

# SO-005 - Mapping Approval State

## Summary

State mapping rule draft, approved và rejected do Mapping sở hữu.

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

## Relations

- Không có outbound relation canonical. Ownership được ghi ở [MOD-004-mapping](../../../01-structure/modules/MOD-004-mapping/README.md) qua `owns: SO-005`.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Mapping/MappingApi.js`

## Validation Notes

- Jira là consumer của mapping state, không phải owner; không suy ra relation Module-to-Module mới.
