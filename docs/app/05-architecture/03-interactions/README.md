# Interactions

Concern này định nghĩa các loại flow chuẩn cho custom modular monolith, sau đó dùng flow của repo hiện tại để minh họa.

## Entity type chuẩn

- [InteractionFlow](../../../meta/01-entity-types/05-architecture/03-interactions/interaction-flows/interaction-flow.md) *(canonical: docs/meta)*
- [InboundIngestFlow](./inbound-ingest-flows/inbound-ingest-flow.md)
- [HumanReviewFlow](./human-review-flows/human-review-flow.md)
- [CanonicalEditFlow](./canonical-edit-flows/canonical-edit-flow.md)
- [OutboundDryRunFlow](./outbound-dry-run-flows/outbound-dry-run-flow.md)
- [OutboundSyncFlow](./outbound-sync-flows/outbound-sync-flow.md)
- [WebhookFlow](./webhook-flows/webhook-flow.md)
- [ScheduledScanFlow](./scheduled-scan-flows/scheduled-scan-flow.md)

## Codebase hiện tại đang dùng mạnh nhất

- Repo hiện tại có ngữ liệu rõ cho `InboundIngestFlow`, `HumanReviewFlow`, `CanonicalEditFlow`, `OutboundDryRunFlow`, `OutboundSyncFlow`, `ScheduledScanFlow`.
- `WebhookFlow` là type chuẩn nhưng chưa là đường chính của bản Lite hiện tại.
- `InteractionFlow` vẫn giữ như bucket tổng quát để không ép project phải chia flow quá sớm.

## Flow instances theo code hiện tại

- [AF-001-backlog-manual-pull](./interaction-flows/AF-001-backlog-manual-pull/README.md)
- [AF-002-backlog-project-pull](./interaction-flows/AF-002-backlog-project-pull/README.md)
- [AF-003-backlog-scheduled-pull](./interaction-flows/AF-003-backlog-scheduled-pull/README.md)
- [AF-004-translation-review](./interaction-flows/AF-004-translation-review/README.md)
- [AF-005-canonical-issue-edit](./interaction-flows/AF-005-canonical-issue-edit/README.md)
- [AF-006-jira-dry-run](./interaction-flows/AF-006-jira-dry-run/README.md)
- [AF-007-cis-to-jira-sync](./interaction-flows/AF-007-cis-to-jira-sync/README.md)

Candidate `Sync to CIS + Translate` là nhánh explicit của inbound `AF-001`: parent `manual_pull` ingest vào CIS, sau đó `TranslationApi` materialize current-source queue và `SyncApi` enqueue child `translate` jobs. HTTP không gọi AI; worker giữ execution, retry và journal trace parent/child.
