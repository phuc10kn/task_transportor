---
schema: entity-instance/v1
id: DU-001
slug: node-monolith
title: Node Monolith
entity_type: DeploymentUnit
layer: 05-architecture
concern: 06-deployment
status: active
summary: Deployment unit Node monolith duy nhất, chạy HTTP/admin, optional worker và dùng SQLite/local storage dependency.
theory_basis:
  - TH-MOD-05
relations:
  hosts:
    - MOD-001
    - MOD-002
    - MOD-003
    - MOD-004
    - MOD-005
    - MOD-006
    - MOD-007
    - MOD-008
    - MOD-009
    - MOD-010
---
# DU-001 - Node Monolith

## Summary

Deployment unit Node monolith duy nhất, chạy HTTP/admin, optional worker và dùng SQLite/local storage dependency.

## Meaning

Artifact Node.js deployable duy nhất của Lite hiện tại. HTTP/admin, worker nội bộ và persistence bootstrap cùng thuộc một topology process.

## Runtime role

`src/server.js` bootstrap storage/migration, khởi động Express application từ `src/app.js` và chỉ start `Sync` worker khi `config.worker.enabled`.

## Why this unit matters architecturally

Node monolith này là deployable boundary duy nhất hiện tại. HTTP/admin runtime và worker runtime là role bên trong cùng process; SQLite/local storage là dependency, không phải deployable unit riêng.

## Hosted modules

- `Auth`
- `Projects`
- `Cis`
- `Backlog`
- `Sync`
- `Translation`
- `Mapping`
- `Anomaly`
- `Jira`
- `Dashboard`

## Boundary notes

Worker có lifecycle start/stop gắn với server khi được bật. SQLite/local storage được bootstrap trước khi server chạy; shared process hoặc persistence không cho phép bỏ qua public API, owner-write discipline hay boundary module.

## Operational implications

Restart, rollout và failure domain hiện ở mức một Node process. Thay đổi worker config hoặc persistence dependency phải review reliability, audit và ownership impact nhưng chưa tạo deployment boundary mới.

## Evolution notes

- Worker chỉ trở thành DeploymentUnit mới khi có process/artifact, lifecycle deploy hoặc scale policy độc lập.
- SQLite/local storage chỉ trở thành deployment/resource instance riêng khi được provision hoặc vận hành độc lập.


## Relations

`hosts` ghi deployable Node process duy nhất chạy các module active của monolith. Worker nội bộ và SQLite/local storage vẫn là role/dependency của DU-001, không phải target relation hoặc deployable instance riêng.

## Evidence

- `src/server.js`
- `src/app.js`
- `src/modules/Sync/application/createWorker.js`
- `src/infrastructure/database/migrate.js`
- `src/infrastructure/storage/bootstrap.js`

## Validation Notes

- Instance đã được chuẩn hóa về `entity-instance/v1` trong Architecture Clean Baseline.
- Không suy diễn relation canonical mới từ prose hiện có.
