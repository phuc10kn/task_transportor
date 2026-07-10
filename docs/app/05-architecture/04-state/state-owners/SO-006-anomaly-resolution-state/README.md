---
schema: entity-instance/v1
id: SO-006
slug: anomaly-resolution-state
title: Anomaly Resolution State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: State anomaly log, resolution và blocking status do Anomaly sở hữu.
theory_basis:
  - TH-SYNC-SAFE-03
  - TH-OPS-TRACE-03
relations:
  shared_via:
    - DF-003
    - DF-004
---

# SO-006 - Anomaly Resolution State

## Summary

State anomaly log, resolution và blocking status do Anomaly sở hữu.

## Meaning

State của anomaly log, ignore/resolve outcome và blocking status.

## Owner

`Anomaly`

## Reason

Anomaly là một concern vận hành riêng cần lifecycle riêng, dù nó phản ánh vấn đề của module khác.

## Write policy

- `Anomaly` write `anomaly_log`.
- Consumer khác đọc hoặc yêu cầu tạo anomaly qua API công khai.

## Consumers

- `Jira`
- `Dashboard`
- `Translation`


## Why this state is central

State anomaly log, resolution và blocking status do Anomaly sở hữu. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

`shared_via` ghi DataFlow đọc blocking anomaly state cho preview hoặc outbound payload. Relation này không thay đổi owner hoặc resolution lifecycle.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Anomaly/AnomalyApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
