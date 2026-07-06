---
id: DU-003
slug: local-state-services
entity_type: DeploymentUnit
layer: 05-architecture
concern: 06-deployment
status: active
theory_basis:
  - TH-MOD-05
---

# DU-003 - Local State Services

## Meaning

Tập runtime component local giữ state bền vững của monolith: SQLite và local file storage.

## Runtime role

- SQLite giữ persistent state cho modules.
- Storage path local giữ attachment files và artifact liên quan.

## Hosted modules

- dữ liệu của `Cis`, `Translation`, `Sync`, `Anomaly`, `Projects`, `Mapping`
- file storage cho `Backlog` attachment path

## Boundaries

Shared persistence không đồng nghĩa shared ownership; ownership vẫn thuộc module business tương ứng.

## Evidence

- `src/infrastructure/database/migrate.js`
- `src/infrastructure/storage/bootstrap.js`
- `src/server.js`
