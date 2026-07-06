# Boundaries

Concern này định nghĩa taxonomy boundary chuẩn cho custom modular monolith. Các instance repo hiện tại chỉ là một tập con của taxonomy này.

## Entity type chuẩn

- [ModuleBoundary](./module-boundaries/module-boundary.md)
- [ImportBoundary](./import-boundaries/import-boundary.md)
- [ControllerBoundary](./controller-boundaries/controller-boundary.md)
- [PublicApiBoundary](./public-api-boundaries/public-api-boundary.md)
- [DataOwnershipBoundary](./data-ownership-boundaries/data-ownership-boundary.md)
- [ReadAllowlist](./read-allowlists/read-allowlist.md)
- [BoundaryTier](./boundary-tiers/boundary-tier.md)
- [TransactionBoundary](./transaction-boundaries/transaction-boundary.md)
- [RetryBoundary](./retry-boundaries/retry-boundary.md)

## Codebase hiện tại đang dùng mạnh nhất

- `ModuleBoundary` đang là bucket instance chính.
- `ReadAllowlist` có ngữ liệu thật trong `Dashboard`, `Jira`, `Translation`.
- `DataOwnershipBoundary` có ngữ liệu thật trong `Cis`, `Translation`, `Sync`, `Projects`, `Mapping`, `Anomaly`.
- `BoundaryTier` là type nền để object hóa Tier 0-4 thay vì chỉ để trong prose.
- `ImportBoundary`, `ControllerBoundary`, `PublicApiBoundary`, `TransactionBoundary`, `RetryBoundary` hiện mới chủ yếu được chốt ở mức rule.

## Boundary instances theo code hiện tại

- [MB-001-cis-canonical-ownership](./module-boundaries/MB-001-cis-canonical-ownership/README.md) - CIS là owner write của canonical issue state
- [MB-002-public-api-only](./module-boundaries/MB-002-public-api-only/README.md) - cross-module access đi qua public API
- [MB-003-read-allowlist](./module-boundaries/MB-003-read-allowlist/README.md) - read exception có kiểm soát cho Dashboard, Jira, Translation
- [MB-004-translation-ai-separation](./module-boundaries/MB-004-translation-ai-separation/README.md) - Translation không được tự mang transport detail
- [MB-005-sync-executes-not-owns](./module-boundaries/MB-005-sync-executes-not-owns/README.md) - Sync thực thi job nhưng không chiếm business ownership
- [MB-006-jira-outbound-guardrail](./module-boundaries/MB-006-jira-outbound-guardrail/README.md) - outbound Jira phải qua dry-run, readiness và journal
