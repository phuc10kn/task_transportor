# State

Concern này định nghĩa taxonomy state chuẩn cho custom modular monolith.

## Entity type chuẩn

- [StateOwner](./state-owners/state-owner.md)
- [CanonicalState](./canonical-states/canonical-state.md)
- [ReviewState](./review-states/review-state.md)
- [ExecutionState](./execution-states/execution-state.md)
- [ConfigurationState](./configuration-states/configuration-state.md)
- [ProjectionState](./projection-states/projection-state.md)
- [AnomalyState](./anomaly-states/anomaly-state.md)

## Codebase hiện tại đang dùng mạnh nhất

- `CanonicalState`, `ReviewState`, `ExecutionState`, `ConfigurationState`, `AnomalyState` đều có ngữ liệu thật trong repo.
- `ProjectionState` hiện mới nhẹ, chủ yếu qua `Dashboard`.
- `StateOwner` được giữ như bucket tổng quát để map nhanh owner hiện tại của repo.

## State owner instances theo code hiện tại

- [SO-001-canonical-issue-state](./state-owners/SO-001-canonical-issue-state/README.md)
- [SO-002-translation-review-state](./state-owners/SO-002-translation-review-state/README.md)
- [SO-003-sync-execution-state](./state-owners/SO-003-sync-execution-state/README.md)
- [SO-004-project-integration-state](./state-owners/SO-004-project-integration-state/README.md)
- [SO-005-mapping-approval-state](./state-owners/SO-005-mapping-approval-state/README.md)
- [SO-006-anomaly-resolution-state](./state-owners/SO-006-anomaly-resolution-state/README.md)
