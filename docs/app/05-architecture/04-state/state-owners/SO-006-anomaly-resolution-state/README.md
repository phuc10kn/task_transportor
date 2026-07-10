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

## Relations

- Không có outbound relation canonical. Ownership được ghi ở [MOD-005-anomaly](../../../01-structure/modules/MOD-005-anomaly/README.md) qua `owns: SO-006`.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Anomaly/AnomalyApi.js`

## Validation Notes

- Consumer có thể đọc hoặc yêu cầu tạo anomaly qua API, nhưng không trở thành owner của state.
