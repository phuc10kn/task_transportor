# Deployment

Concern này định nghĩa taxonomy deployment chuẩn cho custom modular monolith, rồi gắn topology runtime hiện tại của repo vào đó.

## Entity type chuẩn

- [DeploymentUnit](../../../meta/01-entity-types/05-architecture/06-deployment/deployment-units/deployment-unit.md) *(canonical: docs/meta)*
- [ApplicationRuntime](./application-runtimes/application-runtime.md)
- [WorkerRuntime](./worker-runtimes/worker-runtime.md)
- [SchedulerRuntime](./scheduler-runtimes/scheduler-runtime.md)
- [DataStoreUnit](./data-store-units/data-store-unit.md)
- [ApplicationDatabase](./application-databases/application-database.md)
- [StorageUnit](./storage-units/storage-unit.md)

## Codebase hiện tại đang dùng mạnh nhất

- Repo hiện tại có ngữ liệu rõ cho `ApplicationRuntime`, `WorkerRuntime`, `DataStoreUnit`, `StorageUnit`.
- `ApplicationDatabase` là type nền để nói rõ một app DB dùng chung engine nhưng không tạo shared ownership.
- `SchedulerRuntime` là type chuẩn nhưng hiện chưa tách thành runtime riêng.
- `DeploymentUnit` vẫn được giữ như bucket tổng quát để mô tả topology hiện tại nhanh.

## Deployment unit instances theo code hiện tại

- [DU-001-express-admin-app](./deployment-units/DU-001-express-admin-app/README.md)
- [DU-002-internal-sync-worker](./deployment-units/DU-002-internal-sync-worker/README.md)
- [DU-003-local-state-services](./deployment-units/DU-003-local-state-services/README.md)
