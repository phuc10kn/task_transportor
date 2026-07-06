---
id: SO-004
slug: project-integration-state
entity_type: StateOwner
layer: 05-architecture
concern: 04-state
status: active
theory_basis:
  - TH-MOD-01
  - TH-MOD-06
---

# SO-004 - Project Integration State

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

## Evidence

- `docs/architecture/04-boundaries.md`
- `src/modules/Projects/ProjectsApi.js`
