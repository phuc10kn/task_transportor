# 09 - Operation

`09-operation/` mô tả cách hệ thống được chạy, quan sát, duy trì và phục hồi trong môi trường thực tế.

Layer này trả lời:

- hệ thống đang chạy trong operating context nào;
- release và thay đổi được đưa vào môi trường thực thế nào;
- signal, reliability, operational event, continuity và resource được quản lý ra sao;
- maintenance dài hạn được thực hiện thế nào.

## Concern Canonical

- `01-operating-context/`
- `02-release-and-change/`
- `03-signals/`
- `04-reliability/`
- `05-operational-events/`
- `06-continuity/`
- `07-resources/`
- `08-maintenance/`

## Generic Entity-Type Taxonomy

Các entity type dưới từng concern là vocabulary generic tái dùng được, không phụ thuộc `custom_modular_monolith`.

Chúng là template/reference cho application docs; chỉ promote type, relation slot hoặc valid triple sang `docs/meta/` sau khi meaning đã được chốt.

## Universal Boundary

Operation tập trung vào running system, production reality và operational control.

Layer này không giữ:

- architecture deployment topology abstract;
- implementation migration code;
- product acceptance hoặc quality objective nếu chưa có vận hành thực tế.

## Concern Guide

| Concern | Trả lời | Không chứa |
| --- | --- | --- |
| `01-operating-context/` | Runtime environment, local/device/CI/orchestrator context, dependency và topology thực tế là gì. | Context-level environment meaning. |
| `02-release-and-change/` | Deploy, release, rollout, publish, promotion, migration run hoặc change control diễn ra thế nào. | Architecture deployment unit abstract. |
| `03-signals/` | Metrics, logs, traces, audit, health, crash hoặc data-quality signal nào giúp quan sát hệ thống. | Product dashboard requirement. |
| `04-reliability/` | Availability, retry, failover, degradation, SLO guardrail hoặc operational reliability control nào tồn tại. | Quality objective abstract nếu chưa vận hành. |
| `05-operational-events/` | Incident, failed run, broken release, support event hoặc abnormal production event được ghi và xử lý ra sao. | Defect list thuần quality. |
| `06-continuity/` | Backup, restore, rollback, retry, replay, reprocess hoặc continuity plan được vận hành thế nào. | Technical storage design. |
| `07-resources/` | Capacity, quota, cost, compute, storage, battery hoặc resource constraint được theo dõi thế nào. | Product traffic assumption nếu chưa observed. |
| `08-maintenance/` | Patch, data cleanup, dependency maintenance, scheduled maintenance hoặc upkeep dài hạn được làm thế nào. | Implementation refactor plan. |

## Rename Rationale

- `01-operating-context/` bao phủ runtime, local environment, device/store environment, orchestrator environment hoặc package operating context.
- `02-release-and-change/` bao phủ deploy, release, rollout, publish, promotion hoặc change control.
- `03-signals/` bao phủ metrics, logs, traces, crash, audit hoặc data quality signal.
- `05-operational-events/` bao phủ incident, failed run, broken release, support event hoặc abnormal production event.
- `06-continuity/` bao phủ backup, restore, rollback, retry, replay hoặc reprocess.
- `07-resources/` bao phủ capacity, quota, cost, storage, compute hoặc battery/resource constraints.
