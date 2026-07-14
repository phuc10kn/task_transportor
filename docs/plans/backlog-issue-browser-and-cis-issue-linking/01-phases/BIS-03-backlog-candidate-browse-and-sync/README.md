# Phase BIS-03 - Backlog candidate browse và candidate Sync to CIS

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Navigation và màn Backlog Issues](../../00-overview/03-target-design/01-navigation-and-backlog-screen.md)
- [Candidate browse API](../../00-overview/03-target-design/02-candidate-browse.md)
- [Candidate Sync to CIS](../../00-overview/03-target-design/03-candidate-sync.md)
- [Persistence và module boundaries](../../00-overview/03-target-design/06-persistence-and-boundaries.md)

Mục tiêu:

- Cung cấp non-persistent candidate browser đúng date/dedupe/fill semantics và action sync từng candidate.

Target files/artifacts:

- src/modules/Backlog/BacklogApi.js
- src/modules/Backlog/application/listIssueCandidates.js
- src/modules/Backlog/application/syncCandidateToCis.js
- src/modules/Backlog/application/handleManualPullJob.js
- src/modules/Backlog/infrastructure/BacklogClient.js
- src/modules/Backlog/support/normalizeBacklogIssue.js
- src/modules/Backlog/http/routes.js
- src/modules/Backlog/http/controllers/BacklogPullController.js
- src/modules/Cis/CisApi.js
- src/modules/Cis/application/upsertBacklogIssue.js
- src/modules/Cis/infrastructure/CisRepository.js
- src/modules/Sync/SyncApi.js
- src/modules/Sync/application/enqueueManualPullIfNoneActive.js (mới)
- src/modules/Sync/infrastructure/SyncJobRepository.js
- src/infrastructure/database/transaction.js
- scripts/verify/system-issues.js
- scripts/verify/backlog-ingestion.js
- package.json

Điều kiện mở:

- BIS-01 và BIS-02 pass.
- CIS batch duplicate read surface và remote Backlog lookup đã dùng được.

Việc cần làm:

- Thêm GET /api/v1/projects/:projectId/backlog/issues/candidates với required query validation.
- Thêm GET /api/v1/projects/:projectId/backlog/issues/action-readiness làm screen bootstrap; trả readiness độc lập cho browse, Pull one, Pull project và per-row Sync. Candidate GET trả cùng actions shape; mọi POST revalidate gate server-side.
- Khóa action schema: write action luôn trả `execution_mode` thuộc inline/queued_ready/queued_waiting/disabled, disabled luôn có consumer_ready=false và disabled_reasons unique theo precedence contract.
- Hiện thực server-side over-fetch algorithm theo thiết kế mục tiêu; filter source numeric project id và dùng batch CIS lookup cho từng page, không N+1 database lookup.
- Mở rộng FixtureBacklogClient.listIssues để hỗ trợ project filter, created range, sort, offset và count đủ test behavior.
- Assert adapter truyền đúng `projectId[]`, `createdSince`, `createdUntil`, `sort=created`, `order=asc`, `count=100`, `offset`; không tự convert YYYY-MM-DD sang timestamp. Fixture cover issue đúng hai boundary date và manual acceptance xác nhận provider thật.
- Chuẩn hóa Backlog client errors theo contract 404/429/5xx/network/timeout, destroy timed-out request và giữ `retryable` xuyên qua handleManualPullJob; không dựa lệch giữa `status` và `statusCode`.
- Thêm POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis với pre-check already_in_cis, sau đó enqueue shared manual-pull handler/normalizer/job path hiện hữu và trả 202 ngay; shared handler phải re-verify remote numeric project id.
- Enqueue candidate qua SyncApi active-job guard: hai request/click cùng project + canonical Backlog key phải nhận cùng pending/running job; terminal job không chặn retry mới.
- Không đổi POST Pull one issue hoặc resync semantics hiện hữu.
- Đảm bảo browse path không gọi write repository, enqueue job, journal, pull-state update hay attachment download; verifier snapshot row count **và value** của pull_state cùng mọi bảng liên quan trước/sau request.
- Trả metadata source_rows_scanned/excluded/pages/source_exhausted/scan_limit_reached/deadline_reached/stop_reason/provider_error_code để UI/operator hiểu rõ stop condition/partial warning.
- Làm CIS upsert conflict-safe trong IMMEDIATE transaction, xử lý unique conflict/bounded busy retry bằng reload existing thay vì leak raw SQLite error.
- Viết concurrent-process test bằng hai Node process dùng chung SQLite file: đúng một request có `created`, request còn lại có `already_in_cis`, đúng một issue/revision đầu tiên, không có `SQLITE_CONSTRAINT`/`SQLITE_BUSY` lộ ra. Sau đó resync tuần tự với payload đổi vẫn phải tạo revision mới theo semantics hiện hữu.
- Test hai candidate POST đồng thời/re-click sau UI timeout chỉ tạo một active manual_pull và trả cùng job id; sau failed/cancelled được phép tạo job retry mới.
- Test direct candidate-sync với key thuộc Backlog project khác trả `BACKLOG_ROUTING_MISMATCH` và tạo zero job/issue; hung `getProject`/`getIssue` bị destroy và kết thúc trong overall 20 giây với zero job; worker disabled tạo zero job; worker enabled trả 202 queued mà chưa chạy handler trong HTTP request. Sau đó verifier chạy worker riêng để cover success, retry scheduled và terminal failed.

## Checklist hoàn thành phase

- [ ] Thiếu/invalid created_from, created_to hoặc limit bị reject bằng error code rõ.
- [ ] `limit <= 100` và source page size 100 khớp Backlog API; hai date được forward nguyên dạng và boundary behavior có fixture/manual evidence.
- [ ] Browse request không đổi row count/value ở issues, issue_revisions, sync_jobs, sync_journal, webhook_events, pull_state hoặc table/cache database nào khác.
- [ ] Một page toàn duplicate khiến server query page tiếp theo.
- [ ] Source exhausted, scan bound, overall deadline hoặc later-page provider error trả partial candidates + metadata đúng; first-page error vẫn fail và request không quá 30 giây.
- [ ] Sync candidate mới tạo issue qua normalizer/job/journal hiện hữu.
- [ ] 429/5xx/network/timeout được worker schedule retry; 404/project mismatch là terminal và không leak raw error/API key.
- [ ] Duplicate tại click/race/process đồng thời không tạo CIS issue thứ hai, không leak raw SQLite error và UI nhận outcome để reload/remove row.
- [ ] Pending/running manual pull được reuse atomically; terminal job không khóa resync mới và không có duplicate poll timer.
- [ ] Disabled/worker-off/wrong-project routing không enqueue; POST trả queued ngay và worker riêng xử lý retryable/terminal outcome.
- [ ] Action-readiness có contract riêng cho Browse, Pull one, Pull project và Sync to CIS; UI không cần chạy browse trước mới biết trạng thái action.
- [ ] Verifier cover enabled/disabled cho từng write action, enum execution_mode, consumer_ready và exact ordered disabled_reasons.
- [x] Unit test check (Agent): verify:system-issues, verify:phase02 và verify:phase03 pass thật.
- [ ] Manual check (Người review): chỉ tick khi user xác nhận boundary date, partial result và action readiness bằng Backlog credential thật.

Kết quả thực hiện:

Status: Automated pass.

- Candidate browse/readiness/sync-to-CIS routes đã ship; browse không đổi row count ở owner/job/journal/event/pull-state tables.
- Backlog timeout/error normalization, canonical key routing, active manual-pull reuse và cross-process CIS upsert guard có automated evidence.
- Manual provider boundary/deadline acceptance còn chờ credential thật.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
