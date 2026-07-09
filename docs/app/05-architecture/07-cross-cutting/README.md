# Cross-Cutting

Concern này định nghĩa loại rule cắt ngang chuẩn cho custom modular monolith.

## Entity type chuẩn

- [CrossCuttingRule](../../../meta/01-entity-types/05-architecture/07-cross-cutting/cross-cutting-rules/cross-cutting-rule.md) *(canonical: docs/meta)*
- [OwnershipRule](./ownership-rules/ownership-rule.md)
- [IntegrationGuardrail](./integration-guardrails/integration-guardrail.md)
- [ReliabilityRule](./reliability-rules/reliability-rule.md)
- [SecurityRule](./security-rules/security-rule.md)
- [ObservabilityRule](./observability-rules/observability-rule.md)
- [GovernanceRule](./governance-rules/governance-rule.md)

## Codebase hiện tại đang dùng mạnh nhất

- Repo hiện tại có ngữ liệu rõ cho `OwnershipRule`, `IntegrationGuardrail`, `ReliabilityRule`, `GovernanceRule`.
- `SecurityRule` hiện đang tập trung ở `Auth` và boundary route hơn là một catalog lớn.
- `ObservabilityRule` hiện còn nhẹ.
- `CrossCuttingRule` được giữ như bucket tổng quát để không ép project phải phân loại quá sớm.

## Rule instances theo code hiện tại

- [CCR-001-system-cis-system](./cross-cutting-rules/CCR-001-system-cis-system/README.md)
- [CCR-002-owner-write-discipline](./cross-cutting-rules/CCR-002-owner-write-discipline/README.md)
- [CCR-003-job-for-heavy-side-effects](./cross-cutting-rules/CCR-003-job-for-heavy-side-effects/README.md)
- [CCR-004-dry-run-before-jira-write](./cross-cutting-rules/CCR-004-dry-run-before-jira-write/README.md)
- [CCR-005-human-review-on-translation](./cross-cutting-rules/CCR-005-human-review-on-translation/README.md)
- [CCR-006-shared-infrastructure-not-shared-ownership](./cross-cutting-rules/CCR-006-shared-infrastructure-not-shared-ownership/README.md)
