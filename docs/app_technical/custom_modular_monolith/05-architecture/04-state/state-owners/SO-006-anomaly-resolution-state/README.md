---
id: SO-006
slug: anomaly-resolution-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-MOD-01
---

# SO-006 - Anomaly Resolution State

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

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Anomaly/AnomalyApi.js`
