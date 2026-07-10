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

- Repo hiện tại có một `DeploymentUnit` active. HTTP runtime, worker runtime, SQLite và local storage là concern bên trong hoặc dependency của unit đó.
- `ApplicationDatabase` là type nền để nói rõ một app DB dùng chung engine nhưng không tạo shared ownership.
- `SchedulerRuntime` là type chuẩn nhưng hiện chưa tách thành runtime riêng.
- `ApplicationRuntime`, `WorkerRuntime`, `DataStoreUnit`, `StorageUnit` hiện là taxonomy/reference; chúng không có app instance active riêng.

## Deployment unit instances theo code hiện tại

- [DU-001-node-monolith](./deployment-units/DU-001-node-monolith/README.md) - deployable Node process duy nhất; HTTP/admin, optional worker và local persistence dependency cùng nằm trong topology này.
