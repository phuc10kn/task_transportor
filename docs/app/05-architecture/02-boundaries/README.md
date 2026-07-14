# Boundaries

Concern này định nghĩa taxonomy boundary chuẩn cho custom modular monolith. Các instance repo hiện tại chỉ là một tập con của taxonomy này.

## Entity type chuẩn

- [ModuleBoundary](../../../meta/01-entity-types/05-architecture/02-boundaries/module-boundaries/module-boundary.md) *(canonical: docs/meta)*
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

## Boundary cleanup còn hiệu lực

Nội dung cleanup cũ không còn là task list sống, nhưng giữ lại các rule còn áp dụng:

- Cross-module write phải gom về owner API hoặc owner use case; module khác không được ghi trực tiếp state của `Cis`, `Translation`, `Sync`, `Projects`, `Mapping`, `Anomaly`.
- `Dashboard`, `Jira`, `Translation` có thể đọc chéo theo allowlist để phục vụ read model, preview hoặc translation context; mọi read exception phải được ghi rõ trong boundary docs.
- `Sync` được điều phối job/retry/journal, nhưng business outcome vẫn thuộc owner module.
- `Jira` outbound không được bỏ qua dry-run, readiness gate, stale preview guard và journal.
- `Translation` được sở hữu prompt/parse/review/audit, nhưng AI transport/client/protocol thuộc `src/infrastructure/ai`.
- Candidate orchestration gọi `TranslationApi.enqueueIssueTranslations` qua public boundary; Translation chỉ expose queue/review capability, còn `SyncApi` sở hữu translate job, lock, retry và journal execution.
