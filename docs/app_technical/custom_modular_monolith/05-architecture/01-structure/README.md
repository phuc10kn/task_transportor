# Structure

Concern này định nghĩa khung structure chuẩn cho custom modular monolith, rồi map ngữ liệu code hiện tại của `task_transportor` vào đó.

## Entity type chuẩn

- [Module](./modules/module.md)
- [ModuleGroup](./module-groups/module-group.md)
- [IntegrationModule](./integration-modules/integration-module.md)
- [ReadModelComponent](./read-model-components/read-model-component.md)
- [PublicCapability](./public-capabilities/public-capability.md)
- [OwnerApiCapability](./owner-api-capabilities/owner-api-capability.md)

## Codebase hiện tại đang dùng mạnh nhất

- `Module` là bucket instance chính hiện tại.
- `IntegrationModule` có thể dùng để phân lớp rõ hơn cho `Backlog`, `Jira`.
- `ReadModelComponent` có thể dùng để phân lớp rõ hơn cho `Dashboard`.
- `PublicCapability` giúp architecture biết module expose gì cho module khác gọi vào.
- `OwnerApiCapability` giúp tách rõ capability nào thật sự là owner write hoặc owner business action.
- `ModuleGroup` hiện chưa được instantiate riêng.

## Module instances theo code hiện tại

- [MOD-001-cis](./modules/MOD-001-cis/README.md) - lõi canonical issue state của hệ thống
- [MOD-002-backlog](./modules/MOD-002-backlog/README.md) - inbound từ Backlog vào CIS
- [MOD-003-translation](./modules/MOD-003-translation/README.md) - translation queue, AI draft, review
- [MOD-004-mapping](./modules/MOD-004-mapping/README.md) - mapping rules và approval
- [MOD-005-anomaly](./modules/MOD-005-anomaly/README.md) - anomaly log và blocking checks
- [MOD-006-sync](./modules/MOD-006-sync/README.md) - queue, worker, retry, journal
- [MOD-007-jira](./modules/MOD-007-jira/README.md) - dry-run và outbound sync sang Jira
- [MOD-008-projects](./modules/MOD-008-projects/README.md) - project config và integration toggle
- [MOD-009-auth](./modules/MOD-009-auth/README.md) - admin auth và identity
- [MOD-010-dashboard](./modules/MOD-010-dashboard/README.md) - reporting và operations read model

## Rule structure đang áp dụng

- Module source đặt trong `src/modules/<Domain>/`.
- Public boundary giữa module là `<Domain>Api.js`.
- HTTP controller của module nằm trong `src/modules/<Domain>/http/`.
- Shared technical capability đi vào `src/infrastructure/`.
- Shared helper không thuộc domain đi vào `src/shared/`.
