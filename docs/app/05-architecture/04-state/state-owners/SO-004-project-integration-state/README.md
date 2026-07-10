---
schema: entity-instance/v1
id: SO-004
slug: project-integration-state
title: Project Integration State
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
summary: State của project profile, integration config, env references và sync enabled flag.
theory_basis:
  - TH-HUBFLOW-05
  - TH-CANON-04
relations:
  shared_via:
    - DF-003
    - DF-004
---
# SO-004 - Project Integration State

## Summary

State của project profile, integration config, env references và sync enabled flag.

## Meaning

State của project profile, integration config, env references và sync enabled flag.

## Owner

`Projects`

## Reason

Project là context điều phối cho inbound/outbound integration, nên enablement và config phải có owner riêng thay vì nằm rải trong từng integration module.

## Write policy

- `Projects` write `projects`.
- `Backlog` và `Jira` chỉ đọc để thực thi integration flows.

## Consumers

- `Backlog`
- `Jira`
- `Dashboard`



## Why this state is central

State của project profile, integration config, env references và sync enabled flag. Ownership phải rõ để consumer không ghi trực tiếp hoặc suy diễn shared ownership.

## What belongs to this state

State, lifecycle và record do Owner nêu trong Meaning/Write policy quản lý thuộc instance này.

## What does not belong here

Business state của module khác, transport detail và state không do Owner quản lý không thuộc instance này.

## Architectural implications

Consumer đọc hoặc yêu cầu thay đổi qua public API/owner path; runtime hoặc shared storage không làm thay đổi ownership.

## Relations

`shared_via` ghi DataFlow đọc project integration context cho preview hoặc outbound payload. Ownership vẫn thuộc `Projects`.

## Evidence

- `docs/app/05-architecture/02-boundaries/README.md`
- `src/modules/Projects/ProjectsApi.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
