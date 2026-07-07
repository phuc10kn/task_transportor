---
id: DU-002
slug: internal-sync-worker
entity_type: DeploymentUnit
layer: 05-architecture
concern: 06-deployment
status: active
theory_basis:
  - TH-MOD-05
---

# DU-002 - Internal Sync Worker

## Meaning

Runtime unit nội bộ thực thi `sync_jobs` khi worker được bật trong config.

## Runtime role

Tạo từ `SyncApi.createWorker({ config })`, start cùng lifecycle server process và xử lý handler registry.

## Hosted modules

- `Sync` là owner runtime chính
- handler của `Backlog`, `Translation`, `Jira`

## Boundaries

Worker không phải deployable service riêng trong code hiện tại; nó là internal runtime component của monolith.

## Evidence

- `src/server.js`
- `src/modules/Sync/application/createWorker.js`
- `src/modules/Sync/application/handlerRegistry.js`
