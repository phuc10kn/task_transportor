---
schema: entity-instance/v1
id: SO-001
slug: canonical-issue-state
title: Canonical Issue State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: Canonical internal issue state do Cis sở hữu.
theory_basis:
  - TH-CANON-01
  - TH-CANON-04
relations:
  shared_via:
    - DF-002
    - DF-003
    - DF-004
---

# SO-001 - Canonical Issue State

## Summary

Canonical internal issue state do Cis sở hữu.

## Meaning

State canonical của issue nội bộ sau khi dữ liệu đã đi vào CIS.

## Why this state is central

Canonical internal issue state do Cis sở hữu. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## Owner

`Cis`

## Reason

Toàn bộ mô hình sản phẩm hiện tại đặt CIS làm trung tâm nên canonical issue state phải thuộc `Cis`, không thuộc `Backlog` hay `Jira`.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Write policy

- `Cis` write trực tiếp.
- Module khác chỉ yêu cầu thay đổi qua `CisApi`.

## Consumers

- `Dashboard`
- `Translation`
- `Jira`

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

`shared_via` ghi các DataFlow chỉ expose canonical issue state như input. Ownership vẫn thuộc `Cis`; feedback write được trace bằng `DataFlow --moves--> SO-001`.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Cis/CisApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
