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

- Login password/Google cùng resolve một enabled user và phát cùng user JWT. Project create ghi Team + owner lead + Project atomically; mọi Project HTTP flow resolve membership trước business action, rồi owner/lead guard áp dụng theo loại mutation.
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

`AF-002` và `AF-003` giữ trace kiến trúc nhưng execution hiện bị disable: manual route trả lỗi có chủ ý, scheduled scan trả disabled và không tạo job.

Candidate `Sync to CIS`/`Sync + Translate` là các nhánh `manual_pull`; `Sync + Translate + Jira` dùng job riêng `sync_translate_jira`. HTTP chỉ validate local state, enqueue/reuse/promote rồi trả `202`. Worker của job Jira verify Backlog, ingest CIS, dịch trực tiếp toàn batch, dry-run trên staged values, apply/approve batch atomically và gọi Jira trong cùng handler; không enqueue child `translate`, `push_issue` hoặc `push_comment`. Candidate read model overlay cả hai job type theo Project + Backlog key, kể cả CIS issue đã được tạo giữa workflow, để UI phục hồi polling sau reload. HTTP không gọi provider, AI hoặc Jira.

Manual filtered multi-pull là path additive dùng execution semantics của `AF-001`: Admin Web gọi Backlog Count rồi gọi tuần tự từng Page `100`; Count cần browse readiness, Page cần `sync_to_cis` readiness. Page tạo/reuse một `manual_pull` cho mỗi issue chưa có trong CIS và đưa internal Issue List snapshot vào job, nên child handler không gọi lại Backlog Project/Issue nhưng vẫn đọc comments/attachments trước normalize/mapping/CIS write. Path không tạo batch/coordinator job, job type hoặc bảng batch; manual project pull và scheduled pull vẫn disabled. `Page N/Total · X queued` là progress phía browser, mất khi refresh trong khi jobs đã enqueue vẫn bền; Count/offset scan chỉ best-effort khi source thay đổi.
