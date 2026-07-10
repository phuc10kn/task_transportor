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
relations:
  shared_via:
    - DF-003
    - DF-004
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


## Why this state is central

State mapping rule approved và rejected do Mapping sở hữu. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

`shared_via` ghi DataFlow đọc approved mapping cho preview hoặc outbound payload. Relation này không cấp write quyền cho consumer.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Mapping/MappingApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
