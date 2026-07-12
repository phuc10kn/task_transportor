# Phase BIS-02 - CIS manual create và external identity linking

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Tạo CIS issue thủ công](../../00-overview/03-target-design/04-manual-cis-issue.md)
- [External identity linking và Jira guards](../../00-overview/03-target-design/05-external-identity-linking.md)
- [Persistence và module boundaries](../../00-overview/03-target-design/06-persistence-and-boundaries.md)

Mục tiêu:

- Cung cấp owner actions cho Admin tạo CIS issue và gán external links an toàn.

Target files/artifacts:

- src/modules/Cis/CisApi.js
- src/modules/Cis/application/createManualIssue.js
- src/modules/Cis/application/linkExternalIdentities.js
- src/modules/Cis/application/prepareJiraSyncJob.js (mới, atomic H1/trace-link/H2/enqueue orchestration)
- src/modules/Cis/infrastructure/CisRepository.js
- src/modules/Cis/http/routes.js
- src/modules/Cis/http/controllers/IssuesController.js
- src/infrastructure/database/transaction.js
- src/modules/Sync/SyncApi.js
- src/modules/Sync/application/hasActiveIssueJob.js (mới)
- src/modules/Sync/application/hasActiveIssueJobInTransaction.js (mới)
- src/modules/Sync/application/enqueueIssueJobIfNoneActiveInTransaction.js (mới)
- src/modules/Sync/application/writeJournal.js
- src/modules/Sync/application/writeJournalInTransaction.js (mới)
- src/modules/Sync/infrastructure/SyncJobRepository.js
- src/modules/Sync/infrastructure/SyncJournalRepository.js
- src/modules/Jira/application/handlePushIssueJob.js
- src/modules/Jira/application/requestJiraSync.js
- src/modules/Jira/infrastructure/JiraSyncRepository.js
- src/modules/Cis/application/saveJiraDraftFields.js
- src/modules/Cis/application/saveJiraSyncResult.js
- src/modules/Cis/application/upsertBacklogIssue.js
- src/modules/Backlog/application/handleManualPullJob.js
- scripts/verify/system-issues.js
- scripts/verify/backlog-ingestion.js
- scripts/verify/issue-editor-api.js
- scripts/verify/issue-editor-dryrun-sync.js
- scripts/verify/jira-outbound.js
- package.json

Điều kiện mở:

- BIS-01 pass.
- Public lookup/identity integrity contract đã ổn định.

Việc cần làm:

- Tạo use case createManualIssue: validate project/summary, create issues row + revision 1 + journal action issue_manual_created trong một BEGIN IMMEDIATE transaction dùng cùng SQLite connection; journal lỗi phải rollback owner state và busy dùng bounded whole-transaction retry.
- Thêm POST /api/v1/issues nhưng không expose low-level createIssue trực tiếp.
- Tạo linkExternalIdentities use case: classify current value trước provider call, lookup/canonicalize tất cả external target, rồi BEGIN IMMEDIATE transaction re-read active-job/field/duplicate state, write và journal action issue_external_identity_linked bằng cùng connection; busy/busy-snapshot restart toàn transaction, không dùng stale read.
- Thêm POST /api/v1/issues/:issueId/external-identities.
- Bảo toàn canonical PATCH contract: external identity không được lén thêm vào updateCanonicalIssue payload.
- Trả outcome/error theo contract, không leak credentials hoặc raw external payload.
- Bổ sung public active `push_issue` lookup và transaction-bound enqueue-if-none-active qua SyncApi; chuyển `requestJiraSync` sang public capabilities này để SQL job-state nằm ở Sync owner. Không cho CIS/Jira import sâu repository của Sync và không dùng query mở connection mới bên trong CIS transaction.
- Khóa Jira outbound race: H1 phải được tính trong chính draft transaction; `prepareJiraSyncJob` check compatible active job **trước** no-active H1 predicate, rồi mới optional claim verified trace key, tính H2 và enqueue tối đa một job. Worker readiness trước mark syncing rồi dùng worker snapshot/hash sau mark, không fallback create khi linked target mất, và save result bằng compare-and-set theo expected Jira key.
- Thêm syncing write fence vào shared Backlog upsert trước mọi mutation; lỗi `ISSUE_SYNC_IN_PROGRESS` phải retryable để inbound job chờ Jira worker, không phá payload sau final H2 check.
- Mở rộng verifier cho manual issue, revision 1, audit insert failure rollback create/link, valid link, not-found, project mismatch, canonical provider key, duplicate, immutable different key, idempotent same key, active-job/link race, busy-snapshot retry/exhaustion và hai request link đồng thời.
- Mở rộng Jira verifier cho push pending/running, hai request sync đồng thời chỉ có một active job, link xen giữa readiness và external write, linked target 404/forbidden, stale canonical hash, canonical edit giữa draft commit/trace search làm expected H1 fail, H0/H1/H2 compare-and-set conflict, trace cardinality 0/1/>1, trace target đã thuộc CIS issue khác, hai trace-link request tranh cùng target, atomic rollback khi job insert fail, `0 ở request -> 1/>1 ngay trước worker create` và save-result conflict. Dùng barrier test để Backlog upsert attempt đúng sau worker H2 check và assert zero mutation/retry. Giữ test Jira draft override hiện hữu (đặc biệt due_date) chạy thành công; multiple trace vẫn tạo conflict/anomaly/journal nhưng zero write, unexpected mutation/duplicate tạo zero link/job/Jira write; không test bằng cách bỏ qua dry-run/readiness hiện hữu.

## Checklist hoàn thành phase

- [ ] POST /api/v1/issues tạo manual issue có canonical cis branch, current_revision = 1 và journal.
- [ ] Issue manual không có Backlog/Jira source snapshot giả.
- [ ] External link chỉ persist sau khi mọi key trong request đã verify thành công.
- [ ] Link duplicate hoặc key khác sau khi đã gán trả conflict rõ ràng và không partial write.
- [ ] Journal insert lỗi rollback toàn bộ manual create/link; không tồn tại owner state thiếu audit.
- [ ] Link hiện hữu không bypass Jira dry-run/readiness/outbound guardrail; H0/H1/H2 giữ override/verified trace-link hợp lệ nhưng stale worker không ghi remote hoặc overwrite link mới.
- [ ] H1 được tính trước commit trong draft transaction; canonical edit sau commit không bị hấp thụ vào H1/H2.
- [ ] Trace target thuộc CIS issue khác bị block trước enqueue/update; trace-link + job insert commit/rollback atomic và tạo zero remote write khi fail.
- [ ] Hai Jira sync request đồng thời tạo tối đa một active `push_issue`; hai trace=1 request tương thích hội tụ cùng job, còn khác H1/H2/action/key trả stale/state-changed rõ ràng.
- [ ] Trace 0/1/>1 giữ create/verified-link-then-update/conflict semantics; multiple match không bao giờ fallback create và vẫn có conflict/anomaly/audit evidence.
- [ ] Create worker recheck trace ngay trước external create; trace mới xuất hiện trả STATE_CHANGED/conflict với zero Jira write.
- [ ] Linked Jira target 404/forbidden là terminal block, không trace-search/create issue thay thế.
- [ ] Busy/busy-snapshot được retry từ đầu; cạn lượt trả DATABASE_BUSY và không partial write.
- [ ] Existing Jira override flow vẫn pass; own `syncing` không tự làm worker fail readiness.
- [ ] Backlog upsert trong lúc Jira syncing tạo zero mutation và retry sau worker; Jira external payload không stale.
- [x] Unit test check (Agent): verify:system-issues, verify:phase02, verify:phase03, verify:issue-editor và verify:phase06 pass thật.
- [ ] Manual check (Người review): chỉ tick khi user xác nhận manual create/link và Jira guard trên môi trường tích hợp thật.

Kết quả thực hiện:

Status: Automated pass.

- Manual create + revision 1 + journal và external link + journal commit/rollback atomically; journal FK failure rollback được verifier chứng minh.
- Jira request path giữ H0/H1/H2, resolve trace 0/1/>1 trước enqueue, atomic trace-link + active-job enqueue và worker recheck/CAS.
- Backlog upsert có syncing fence và `BEGIN IMMEDIATE` bounded retry/backoff.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
