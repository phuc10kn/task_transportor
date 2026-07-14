# Kế hoạch Sync Backlog candidate vào CIS kèm Translation Queue

> Trạng thái: Implemented — automated verification pass; manual acceptance bằng credential/browser thật còn pending.
>
> Phạm vi phiên bản: Lite.
>
> Mã phase ổn định: BCT = Backlog Candidate Translation.

## Mục tiêu

Thêm action theo từng Backlog candidate với nhãn **Sync to CIS + Translate**. Action này đưa issue vào CIS qua `manual_pull` đang có, sau đó tạo Translation Queue cho source Backlog của `summary` và `description`, rồi enqueue các job `translate` để worker xử lý bất đồng bộ.

Backlog không gọi AI trực tiếp. Luồng bắt buộc là:

```text
Backlog candidate
  -> manual_pull (Backlog -> CIS)
  -> translation_queue (CIS)
  -> translate jobs (CIS -> CIS)
  -> AI draft
  -> human review
```

## Phạm vi

Trong scope:

- Giữ nút `Sync to CIS` hiện hữu, không thay đổi semantics.
- Thêm nút `Sync to CIS + Translate` trên từng candidate ở Backlog Issues.
- Dùng cùng endpoint project-scoped `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis` với body JSON `{ "with_translation": true }`.
- Đưa cờ trên vào payload của `manual_pull`; chỉ shared handler sau ingest mới tạo queue và enqueue job dịch.
- Tạo queue cho `summary` và `description` có Backlog source text theo `issueTranslationTargets` hiện hữu.
- Tái sử dụng current-source dedupe của Translation; thêm active-job dedupe theo `translation_queue_id`.
- Dùng cùng translate-job gate theo `translation_queue_id` cho worker, Issue Editor và Translation Queue để một queue item không phát sinh hai AI request đồng thời.
- Ghi số queue item và translate job vào kết quả/journal của `manual_pull`; Translation job giữ journal riêng.
- Cập nhật Admin UI, docs/app và verify liên quan.

Ngoài scope:

- Không dùng `auto_translate` để đổi hành vi toàn project.
- Không đổi `Pull one issue`, `Pull project`, scheduled pull hay resync Backlog hiện hữu.
- Không dịch comment, attachment, custom field hay tự approve AI draft.
- Không thêm direct Backlog -> AI request, endpoint Backlog public mới, schema database mới hay dependency mới.
- Không thay đổi mapping, anomaly và Jira outbound gate.

## Baseline hiện tại

- Candidate `Sync to CIS` enqueue `manual_pull` qua `SyncApi.enqueueManualPullIfNoneActive`; bodyless request trả `queued` hay `already_in_cis`.
- `handleManualPullJob` đã upsert source vào CIS, link job, xử lý attachment và ghi journal, nhưng luôn trả `created_translation_items: 0`, `translate_jobs: 0`.
- Translation đã có `translation_queue`, handler `translate`, worker/retry/journal, AI adapter và human review. `requestIssueTranslations` hiện tạo queue rồi chạy translate ngay cho action trong Issue Editor.
- `auto_translate` tồn tại trong project config nhưng chưa là đường orchestration cho Backlog ingest.
- Candidate browse vẫn read-only; chỉ action sync theo hàng mới được ghi CIS/job/journal.

## Source of truth

| Nguồn | Vai trò trong plan |
| --- | --- |
| `AGENTS.md` | Scope Lite, modular boundary, documentation và verification rules bắt buộc. |
| `docs/app/02-product/README.md` | Scope và behavior Lite: candidate sync đi qua shared manual-pull job, translation có human review. |
| `docs/app/10-decisions/README.md` | Invariant `System -> CIS -> System`, manual pull là inbound chính, AI không là authority. |
| `docs/app/03-interface/README.md` và `08-quality/README.md` | Contract hai action trên Backlog Issues, operator feedback, automated verification và manual acceptance. |
| `docs/app/05-architecture/01-structure/README.md` và `02-boundaries/README.md` | Cross-module interaction đi qua `<Domain>Api.js`; CIS owner state, Sync owner queue execution, Translation owner queue/review. |
| `src/modules/Backlog/application/syncCandidateToCis.js` và `handleManualPullJob.js` | Contract và lifecycle thực tế của candidate sync. |
| `src/modules/Translation/application/requestIssueTranslations.js`, `translateQueueItemNow.js` và `handleTranslateJob.js` | Current-source queue semantics, direct Translate và worker execution hiện hữu. |
| `src/modules/Sync/SyncApi.js`, `application/runJobNow.js` và `infrastructure/SyncJobRepository.js` | Ownership của enqueue, active-job guard, immediate run, retry và journal. |
| `docs/plans/prompts/planner.md`, `coordinator.md`, `executor.md` | Shape, phase ID, scope/acceptance, current phase, handoff và execution log của plan này. |

Precedence: `AGENTS.md` áp dụng trước; scope/behavior lấy từ Product; decision accepted giữ invariant; code chỉ là evidence baseline và không tự mở scope.

## Phase triển khai

### Phase BCT-00 - Khóa contract và preflight

Mục tiêu:

- Chốt một action explicit theo candidate, đúng boundary và không đổi action Pull hiện hữu.

Target files/artifacts:

- `docs/plans/backlog-candidate-sync-with-translation/README.md`
- `docs/app/00-context/README.md` (verify-only)
- `docs/app/01-business/README.md` (verify-only)
- `docs/app/02-product/README.md` (verify-only)
- `docs/app/08-quality/README.md` (verify-only)
- `docs/app/10-decisions/README.md` (verify-only)
- `docs/app/05-architecture/README.md` (verify-only)
- `docs/app/05-architecture/01-structure/README.md` (verify-only)
- `docs/app/05-architecture/02-boundaries/README.md` (verify-only)
- `docs/app/05-architecture/03-interactions/README.md` (verify-only)
- `docs/guide/reference/entity-maps/packs/variants/modular-monolith/05-architecture/README.md` (verify-only)
- `docs/theories/modular-architecture/README.md` (verify-only)
- `src/modules/Backlog/application/syncCandidateToCis.js` (verify-only)
- `src/modules/Backlog/application/handleManualPullJob.js` (verify-only)
- `src/modules/Translation/application/requestIssueTranslations.js` (verify-only)
- `src/modules/Sync/SyncApi.js` (verify-only)

Điều kiện mở:

- Plan được user chấp nhận.
- Không có yêu cầu đổi `Pull one issue`, `Pull project` hay scheduled pull thành auto-translate.

Việc cần làm:

- Đọc đủ artifact verify-only của BCT-00 theo thứ tự trong `AGENTS.md` trước khi sửa `src/modules`; đây là preflight bắt buộc của executor.
- Khóa API contract: bodyless request và `{ "with_translation": false }` là Sync to CIS cũ; body `{ "with_translation": true }` là action mới; value không phải JSON boolean trả `422 VALIDATION_ERROR`; response thành công chỉ trả parent `manual_pull` job.
- Khóa coalescing contract cho request `with_translation`: active job đã có cờ dịch được reuse; active job `pending` chưa có cờ dịch được atomic promote thành có cờ dịch; active job `running` chưa có cờ dịch trả `409 BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` với `error.details.job_id` và `error.details.status: "running"`.
- Khóa field scope: chỉ source Backlog `summary` và `description` không rỗng.
- Khóa async contract cho candidate endpoint: HTTP `sync-to-cis` chỉ enqueue parent job; worker `manual_pull` chỉ enqueue translation job; candidate request không gọi AI. AI adapter chỉ được gọi từ handler `translate`, gồm cả trường hợp Issue Editor đã lock job rồi gọi `runJobNow` để giữ behavior trực tiếp hiện hữu.
- Khóa execution contract: mọi AI run của queue item phải đi qua một active translate job theo `translation_queue_id`. Ba entry point manual `/translations/issues/:issueId/translate`, `/translations/issues/:issueId/items/:queueId/translate` và `/translation-queue/:queueId/retranslate` đều dùng gate này. Hai action Issue Editor chỉ run ngay job đã enqueue khi lock được job đó; job đang running trả queued state và không gọi adapter lần hai. Retranslate giữ bất đồng bộ 202 nhưng reuse job active.
- Khóa response contract cho hai action Issue Editor: giữ `translated_items` cho draft đã hoàn thành, thêm `execution_status` (`completed`, `queued`, `partial_queued`) cùng `queued_job_ids`; controller trả 202 khi còn job queued, 200 khi tất cả job đã chạy xong. Admin UI chỉ thông báo draft đã tạo cho `completed`; trạng thái còn queue phải thông báo đã queue.
- Khóa direct-failure contract: `runJobNow` trả translate job failed phải được hai action Issue Editor map thành HTTP error ổn định kèm `error.details.job_id`, `error.details.status` và retry state; không trả success envelope cho failed job. `execution_mode: "manual_immediate"` giữ tối đa hai lần gọi adapter trong một locked job và `max_attempts: 1`, tương đương retry trực tiếp hiện hữu; child Backlog và Retranslate giữ worker retry hiện hữu.
- Khóa retranslate-state contract: `retranslateTranslation` kiểm tra/reuse active translate job trước `resetForRetranslate`; khi có job active, không reset queue item và không enqueue thêm job.
- Khóa failure contract: SQLite busy/locked, Sync enqueue transient và lỗi transport retryable từ capability Translation phải carry `retryable: true` để parent `manual_pull` schedule retry; validation/owner-state error terminal phải carry `retryable: false`; lỗi provider làm translate job fail/retry độc lập sau khi parent success.
- Khóa audit contract: parent payload của action mới mang `requested_by` và `request_correlation_id`; child payload mang `parent_sync_job_id`, `requested_by`, `request_correlation_id`, `translation_queue_id`.
- Khóa idempotency contract: retry parent job, re-click candidate và worker retry không tạo active job translate trùng cùng `translation_queue_id`.

Checklist nghiệm thu:

- [x] API contract được ghi đúng trong plan với path, Boolean body, invalid-body error và response parent job.
- [x] Mixed action có contract rõ: pending Sync thường được promote; running Sync thường trả error code ổn định tại `error.details` và không tuyên bố đã queue translation.
- [x] Mỗi queue item có một execution owner là translate job; cả ba manual entry point không tạo AI request song song với job pending/running.
- [x] Response Issue Editor phân biệt draft đã hoàn thành với job đang queue; Retranslate active giữ queue item nguyên state và reuse job evidence.
- [x] Translate trực tiếp giữ tối đa hai AI attempt trong một job locked; job failed trả HTTP error có job evidence, không có success toast sai.
- [x] Parent/child journal trace được nối qua parent job ID, requested_by và request correlation ID trong payload contract.
- [x] Scope chỉ ghi action candidate explicit và chỉ hai target field.
- [x] Không có task nào đổi global `auto_translate` hay các Pull flow ngoài scope.
- [x] Cross-module call chỉ dự kiến qua `BacklogApi`, `TranslationApi`, `SyncApi` và `CisApi`.

Kết quả thực hiện:

Status: Preflight và contract BCT-00 đã được khóa; automated verification pass.

- Fix tối thiểu: `docs/plans/backlog-candidate-sync-with-translation/README.md` - chốt contract body/response, coalescing, retry, trace và boundary trước khi triển khai.

### Phase BCT-01 - Orchestrate ingest, queue và translate job

Mục tiêu:

- Sau candidate ingest thành công, materialize Translation Queue và job translate idempotent mà không làm Translation chạy trong HTTP request.

Target files/artifacts:

- `src/modules/Backlog/BacklogApi.js`
- `src/modules/Backlog/application/syncCandidateToCis.js`
- `src/modules/Backlog/application/handleManualPullJob.js`
- `src/modules/Backlog/http/controllers/BacklogPullController.js`
- `src/modules/Translation/TranslationApi.js`
- `src/modules/Translation/application/requestIssueTranslations.js`
- `src/modules/Translation/application/enqueueIssueTranslations.js` (mới)
- `src/modules/Translation/application/handleTranslateJob.js`
- `src/modules/Translation/application/retranslateTranslation.js`
- `src/modules/Translation/application/syncIssueTranslationState.js`
- `src/modules/Translation/application/translateQueueItemNow.js`
- `src/modules/Translation/application/translateIssueTranslationNow.js`
- `src/modules/Translation/http/controllers/TranslationIssueController.js`
- `src/modules/Translation/http/controllers/TranslationQueueController.js` (verify-only)
- `src/modules/Translation/http/routes.js` (verify-only)
- `src/modules/Sync/SyncApi.js`
- `src/modules/Sync/application/enqueueManualPullIfNoneActive.js`
- `src/modules/Sync/application/enqueueTranslateJobIfNoneActive.js` (mới)
- `src/modules/Sync/application/runJobNow.js`
- `src/modules/Sync/infrastructure/SyncJobRepository.js`
- `src/modules/Cis/CisApi.js` (verify-only)
- `src/modules/Cis/support/issueTranslationTargets.js` (verify-only)

Điều kiện mở:

- BCT-00 pass.
- Current candidate sync và Translation review verifier đã pass trên baseline.

Việc cần làm:

- Validate `with_translation` là JSON boolean trước controller forward đến `syncCandidateToCis`; khi value là `true`, persist `with_translation`, `requested_by` và `request_correlation_id` trong `manual_pull.payload_json`.
- Giữ bodyless candidate request và readiness nguyên semantics hiện hữu.
- Mở rộng active-manual-pull guard theo coalescing contract: job đã yêu cầu translation được reuse; job `pending` chưa có cờ được atomic promote; job `running` chưa có cờ làm request `with_translation` fail với `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION`. Response error phải có `error.details.job_id`, `error.details.status` và không tạo queue/job dịch mới.
- Sau `CisApi.upsertBacklogIssue` và `SyncApi.linkJobIssue`, gọi một public capability của Translation để chuẩn bị queue cho issue. Backlog không import sâu application/infrastructure của Translation.
- Tách phần tạo/reuse current-source queue item từ `requestIssueTranslations` thành capability dùng chung.
- Dùng `enqueueTranslateJobIfNoneActive` làm universal execution gate cho worker và mọi manual entry point. `requestIssueTranslations` cùng `translateIssueTranslationNow` enqueue/reuse job rồi gọi `runJobNow` chỉ khi lock được job; khi job đã running trả queued state; hai flow này không gọi adapter ngoài job handler. `retranslateTranslation` chỉ enqueue/reuse job, giữ response 202 và không chạy adapter trong HTTP.
- `retranslateTranslation` phải gọi gate trước `resetForRetranslate`: job pending/running được trả về với `reused: true`, queue item không bị reset; chỉ trường hợp không có active job mới reset, refresh AI config rồi enqueue job mới.
- Hai action Issue Editor giữ trường `translated_items` cho phần đã run xong, trả thêm `execution_status` và `queued_job_ids`; `TranslationIssueController` trả 202 khi response còn item queued. Admin UI dùng field này thay cho việc luôn thông báo đã tạo draft.
- Job từ hai action Issue Editor có `payload_json.execution_mode: "manual_immediate"` và `max_attempts: 1`. `handleTranslateJob` dùng capability chung `translateQueueItemNow` với tối đa hai attempt cho mode này; child Backlog và Retranslate giữ số attempt worker hiện hữu. Khi `runJobNow` trả failed job, hai action Issue Editor ném AppError ổn định có job ID, status và retry state thay vì trả success response.
- `enqueueIssueTranslations` chỉ tạo item cho current `summary` và `description` có source Backlog; item existing cùng field/source được reuse; source stale không được chạy lại.
- `enqueueIssueTranslations` phải quét union của item mới tạo và item `pending` current-source đã có. Mỗi item trong tập này phải đi qua `SyncApi.enqueueTranslateJobIfNoneActive`.
- Dùng `SyncApi.enqueueTranslateJobIfNoneActive` để atomically reuse pending/running translate job theo `payload_json.translation_queue_id`, không dùng guard theo toàn `issue_id` vì hai field cần hai job riêng. Sau một lần gọi thành công, mỗi item `pending` current-source có đúng một active translate job.
- Mỗi translate job có `direction_from: "cis"`, `direction_to: "cis"`, `job_type: "translate"` và payload `{ translation_queue_id, parent_sync_job_id, requested_by, request_correlation_id }`. `handleTranslateJob` đọc request correlation từ payload khi sync state và ghi journal; journal enqueue/draft giữ requested_by tương ứng.
- Gọi `syncIssueTranslationState` sau khi queue được chuẩn bị để issue có item pending thành `pending_translate`.
- Capability Translation phân loại lỗi trước khi trả về Backlog: SQLite `SQLITE_BUSY`/`SQLITE_LOCKED`, Sync enqueue transient và transport retryable có `retryable: true`; validation, missing issue/queue và owner-state conflict có `retryable: false`. `handleManualPullJob` giữ explicit flag này và mở rộng fallback classifier cho SQLite busy/locked.
- Parent journal ghi action ingest hiện hữu cùng `created_translation_items`, `reused_translation_items`, `translate_jobs`, `reused_translate_jobs` và queue ID cần audit. Translate journal vẫn thuộc Translation handler.
- Với action Sync to CIS cũ, giữ các count translation bằng `0` và không tạo queue/job mới.

Checklist nghiệm thu:

- [x] Request `{ "with_translation": true }` chỉ enqueue một `manual_pull`, không gọi AI trong HTTP request.
- [x] Bodyless request và `{ "with_translation": false }` giữ Sync to CIS cũ; `with_translation` không phải Boolean trả `422 VALIDATION_ERROR` và tạo zero job.
- [x] Parent worker thành công tạo queue item cho Summary và Description có source text, đồng thời enqueue đúng một active translate job cho mỗi item.
- [x] Issue có pending queue item chuyển sang `pending_translate`.
- [x] Re-click/retry cùng source không tạo queue item mới hay active translate job thứ hai theo cùng queue ID.
- [x] Sync thường `pending` rồi Sync + Translate trả cùng parent job đã được promote; Sync thường `running` rồi Sync + Translate trả `409 BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` cùng job evidence.
- [x] Khi failure xảy ra sau khi queue item được tạo nhưng trước child enqueue, parent retry quét item `pending` current-source và tạo đúng một active translate job.
- [x] Lỗi SQLite busy/locked hay Sync enqueue transient làm parent job schedule retry; validation error làm parent terminal failed với retryable false.
- [x] Source Backlog đổi tạo queue item mới đúng field; item approved/edited của source cũ không bị ghi đè.
- [x] Lỗi provider chỉ làm translate job đi qua failed/retry; CIS ingest và parent job không bị rollback.
- [x] `/translations/issues/:issueId/translate`, `/translations/issues/:issueId/items/:queueId/translate`, `/translation-queue/:queueId/retranslate` và worker cùng gặp một queue item chỉ dùng một translate job; request đến khi job running trả queued state và tạo zero AI request mới.
- [x] Retranslate gặp active job giữ queue item nguyên state, reuse job cũ; không reset rồi enqueue translate job thứ hai.
- [x] Response Issue Editor giữ `translated_items` cho draft đã xong, báo `execution_status` và `queued_job_ids` đúng khi chưa thể lock job.
- [x] Direct Translate dùng `manual_immediate` giữ tối đa hai AI attempt; failed job trả error có `job_id`, `status`, retry state và không trả success envelope.
- [x] Child translate payload/journal có `parent_sync_job_id`, `requested_by`, `request_correlation_id`; translation draft journal giữ trace request này.
- [x] Bodyless Sync to CIS vẫn không tạo translation queue/job.
- [x] Không có deep import cross-module và không có `fetch`, process call trong Translation module mới.

Kết quả thực hiện:

Status: BCT-01 đã triển khai; backend queue/worker và ba manual entry point dùng chung active-job gate.

- Fix tối thiểu: `src/modules/Sync`, `src/modules/Backlog` và `src/modules/Translation` - thêm cờ ingest, atomic promote/dedupe, queue materialization, parent-child trace, retryable error và execution gate theo `translation_queue_id`.
- Verify: `npm run verify:phase03`, `npm run verify:phase04`, `npm run verify:system-issues` pass.

### Phase BCT-02 - Admin UI cho action explicit và quan sát job

Mục tiêu:

- Cho operator chọn rõ Sync thường hay Sync kèm Translation, rồi thấy trạng thái parent job mà không coi HTTP 202 là hoàn tất.

Target files/artifacts:

- `public/admin/app.js`
- `public/admin/styles.css`
- `src/modules/Backlog/http/routes.js` (verify-only)
- `src/modules/Backlog/http/controllers/BacklogPullController.js` (verify-only)
- `src/modules/Backlog/application/getIssueActionReadiness.js` (verify-only)

Điều kiện mở:

- BCT-01 pass bằng backend verifier.
- Existing Backlog Issues candidate form và row polling hoạt động.

Việc cần làm:

- Render hai nút trong row candidate: `Sync to CIS` và `Sync to CIS + Translate`.
- Nút mới gọi endpoint hiện hữu với `{ with_translation: true }`; nút cũ không gửi body.
- Khi parent job active, khóa cả hai action của cùng candidate; giữ chỉ một poll timer theo `backlog_issue_key`.
- Khi API trả `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION`, đọc `error.details.job_id`, set row vào trạng thái running rồi poll job đó; toast phải nói rõ job hiện tại không có translation và operator cần dùng Issue Editor > Translate sau terminal success.
- Lưu metadata action tại state client để terminal toast của Sync + Translate nói rõ `CIS sync completed. Review Translation Queue for available drafts.`; không đọc hay hiển thị số job từ parent result.
- Cập nhật Issue Editor: action Translate issue và Translate từng item đọc `execution_status`; chỉ thông báo draft đã tạo cho `completed`, còn `queued` và `partial_queued` phải nói rõ draft đang được tạo bởi job. Rerender queue state sau response, không tự tạo poll timer mới.
- Khi direct Translate trả HTTP error từ failed job, Issue Editor hiển thị error hiện hữu kèm job evidence khi API envelope cung cấp; không đổi state sang đã có draft.
- Giữ Translation Queue Retranslate là action 202; khi response báo `reused`, toast phải nói rõ job đang tồn tại được reuse thay vì nói đã queue job mới.
- Sau parent success, reload candidates để row đã vào CIS biến mất; operator vào Translations hay Issue Editor để review draft sau worker translate.
- Giữ nguyên behavior Find issues, filter snapshot, Not closed, Status, Assignee, Pull one issue và Pull project.

Checklist nghiệm thu:

- [x] Candidate row hiển thị hai label action chính xác.
- [x] Nút `Sync to CIS + Translate` gửi body đúng path project-scoped; nút cũ giữ request bodyless.
- [x] Active parent job khóa cả hai action và không tạo poll timer trùng.
- [x] `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` hiển thị job ID/state rõ, poll job đang chạy và không claim translation đã được queue.
- [x] HTTP 202 được hiển thị là queued; terminal parent status `success`/`failed`/`cancelled` mới hiển thị outcome.
- [x] Terminal toast của Sync + Translate không phụ thuộc `handler_result` hay số lượng translate job.
- [x] Issue Editor không thông báo draft đã tạo khi `execution_status` còn queued; Translation Queue Retranslate phân biệt enqueue mới và reuse active job.
- [x] Issue Editor không thông báo thành công khi direct Translate trả failed-job error.
- [x] Find/filter/mapping snapshot không nhận request Backlog mới khi mở screen.

Kết quả thực hiện:

Status: BCT-02 đã triển khai; candidate action, disabled/poll state và terminal/operator feedback đã được nối.

- Fix tối thiểu: `public/admin/app.js` và `public/admin/styles.css` - thêm hai action row, truyền flag translation, xử lý 409/poll/toast và phân biệt queued/completed/reused.
- Verify: `npm run verify:phase07` pass.

### Phase BCT-03 - Verification, docs và handoff

Mục tiêu:

- Chứng minh behavior mới, giữ contract cũ và cập nhật docs/app đúng implementation đã ship.

Target files/artifacts:

- `scripts/verify/system-issues.js`
- `scripts/verify/backlog-ingestion.js`
- `scripts/verify/translation-review.js`
- `scripts/verify/admin-ui-acceptance.js`
- `docs/app/01-business/README.md`
- `docs/app/02-product/README.md`
- `docs/app/03-interface/README.md`
- `docs/app/05-architecture/02-boundaries/README.md`
- `docs/app/05-architecture/03-interactions/README.md`
- `docs/app/06-technical/README.md`
- `docs/app/07-implementation/README.md`
- `docs/app/08-quality/README.md`
- `docs/app/09-operation/README.md`
- `docs/plans/backlog-candidate-sync-with-translation/README.md`
- `package.json` (verify-only)

Điều kiện mở:

- BCT-01 và BCT-02 pass.
- API/result field names đã ổn định.

Việc cần làm:

- Mở rộng `verify:system-issues`: bodyless/false/true/invalid request contract, pending promote, running `409` details, parent worker, queue Summary/Description, pending translate, exact job counts, retry/re-click dedupe, SQLite/Sync transient retry và bodyless regression.
- Mở rộng `verify:translation-review`: queue-capability enqueue job đúng; cả hai action Issue Editor, Translation Queue Retranslate và worker cùng queue item không gọi AI trùng; direct Translate lock/run job khi available, giữ hai immediate attempt trong `manual_immediate`, failed job trả error evidence; running job trả queued state; Retranslate active không reset state; child parent/request trace được journal; AI draft/review state hiện hữu giữ đúng.
- Mở rộng `verify:admin-ui-acceptance`: hai nút candidate, request flag, disabled/poll state, text operator và toast trạng thái queued/completed của action Translate hiện hữu.
- Giữ `verify:backlog-ingestion` khẳng định Pull one cũ có zero Translation Queue item.
- Cập nhật docs/app sau khi implementation có evidence: candidate action mới, asynchronous queue, review authority, operation recovery và exact verification command. Cập nhật `05-architecture/02-boundaries` cho capability public `BacklogApi`/`TranslationApi`/`SyncApi` được dùng thật; cập nhật `05-architecture/03-interactions` cho parent `manual_pull` sang child `translate` flow và trace journal.
- Không materialize entity/relation docs mới trừ khi đọc DEC-002 và có evidence đầy đủ; prose update không tự tạo graph edge.
- Chạy verification theo thứ tự: `npm run verify:phase03`, `npm run verify:phase04`, `npm run verify:phase07`, `npm run verify:system-issues`, `npm run verify:docs`, `npm test`.
- Tick `Unit test check (Agent)` chỉ sau command pass thật. Giữ `Manual check (Người review)` unchecked đến khi user xác nhận credential/browser thật.

Checklist nghiệm thu:

- [x] `scripts/verify/system-issues.js` chứng minh candidate Sync + Translate queue đúng hai source field, đúng parent/job trace và không duplicate.
- [x] `scripts/verify/backlog-ingestion.js` chứng minh Pull one cũ không tự translate.
- [x] `scripts/verify/translation-review.js` chứng minh job translate vẫn giữ AI draft và human review authority.
- [x] `scripts/verify/admin-ui-acceptance.js` chứng minh hai action row và request contract.
- [x] Docs/app mô tả đúng explicit action, queue async và manual review; không mô tả Backlog direct AI hay global auto-translate.
- [x] Architecture boundary/interaction docs phản ánh edge public API và parent-child job flow đã ship; không thêm deep import cross-module.
- [x] Unit test check (Agent): toàn bộ command đã nêu pass thật.
- [ ] Manual check (Người review): Backlog credential thật, AI credential thật, hai nút và Translation Queue được user xác nhận; giữ unchecked trước thời điểm đó.

Kết quả thực hiện:

Status: BCT-03 hoàn tất phần automated implementation; manual acceptance vẫn pending.

- Fix tối thiểu: `scripts/verify/system-issues.js`, `scripts/verify/translation-review.js`, `scripts/verify/admin-ui-acceptance.js` và `docs/app/*` - bổ sung evidence retry/dedupe, manual entry-point gate, UI contract và cập nhật boundary/interaction/operation docs.
- Verify: `npm test`, `npm run verify:docs` và các phase BCT liên quan pass.

## Quy ước điều phối

### Handoff hiện tại

Current phase: BCT-03 - Verification, docs và handoff

Done: BCT-00 đến BCT-03 đã triển khai; automated checklist và toàn bộ `npm test` pass.

Next: Chỉ còn manual browser/credential acceptance; giữ checklist Manual check unchecked đến khi user xác nhận.

Prompt tiếp theo: executor.md

### Trạng thái blocked

None

### Accepted gaps

- Comment translation, attachment translation, custom-field translation, global `auto_translate`, Pull one, Pull project, scheduled pull và resync auto-translate được deferred.
- Provider AI failure thực tế không làm rollback CIS ingest; recovery thuộc translate job retry và Translation Queue.
- Manual acceptance bằng Backlog/AI credential thật là non-blocking cho automated implementation.

### Quy tắc resume

- Resume luôn từ phase chưa có `Kết quả thực hiện` pass; không bỏ qua BCT-00.
- Mỗi phase chỉ sửa đúng target artifacts đã liệt kê. Artifact mới cần được thêm vào phase trước khi sửa.
- Sau mỗi phase, ghi đúng một format canonical: `No-change: <path> - <lý do ngắn>`, `Fix tối thiểu: <path> - <phạm vi ngắn>`, hay `In-progress: <phase id> - <đã xong> | Next: <việc tiếp theo>`.
- Requirement muốn replace nút cũ, auto-translate toàn pull flow hay thêm translation target phải quay về BCT-00 để replan.

## Rủi ro và trigger phải dừng

| Trigger | Hành động bắt buộc |
| --- | --- |
| Thiết kế cần Backlog import sâu code Translation, Sync hay CIS. | Dừng; expose capability tối thiểu qua `<Domain>Api.js`. |
| Dedupe translate job chỉ kiểm tra theo `issue_id`. | Dừng; một issue có Summary và Description nên guard phải theo `translation_queue_id`. |
| Issue Editor direct Translate bypass translate-job gate. | Dừng; mọi execution phải enqueue/reuse job theo queue ID, direct action chỉ được run job đã lock. |
| Translate từng item hay Translation Queue Retranslate bypass translate-job gate. | Dừng; ba entry point manual phải dùng cùng gate, Retranslate active không được reset state. |
| Chuyển direct Translate sang job làm mất immediate retry hay nuốt failed job thành success. | Dừng; `manual_immediate` phải giữ hai attempt, failed job phải trả error evidence. |
| Sync thường đang `running` nhận request Sync + Translate. | Trả `409 BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` cùng job evidence; không silent reuse và không tuyên bố translation đã được queue. |
| Queue/job error không có `retryable` rõ ràng hay child payload mất parent request trace. | Dừng BCT-01; phân loại error và payload trace phải có automated evidence trước khi mở UI. |
| HTTP action gọi adapter AI hay chờ AI response. | Dừng; chỉ worker `translate` được gọi adapter. |
| Requirement yêu cầu toàn bộ Pull flow tự queue translation. | Quay về BCT-00; đây là thay đổi product scope và semantics `auto_translate`. |
| Requirement yêu cầu comment/attachment/custom field translation. | Quay về BCT-00; target lifecycle và review contract chưa nằm trong scope. |
| Parent retry tạo queue/job duplicate không có atomic guard. | Dừng BCT-01; giải quyết trong Sync repository transaction trước khi tích hợp UI. |
| Docs/app cần entity/relation mới nhưng thiếu DEC-002 evidence. | Chỉ cập nhật prose; không materialize graph edge. |

## Checklist nghiệm thu tổng

- [x] Cùng endpoint candidate sync phân biệt rõ request bodyless/false/true; non-Boolean bị reject trước khi enqueue.
- [x] Backlog candidate mới được ingest vào CIS qua `manual_pull`, sau đó queue đúng Summary/Description và translate job bất đồng bộ.
- [x] Request HTTP không gọi AI; worker translate là execution point duy nhất cho adapter.
- [x] Dedupe theo current source và `translation_queue_id` chặn duplicate khi re-click/retry.
- [x] Pending Sync thường được promote atomic khi nhận Sync + Translate; running Sync thường trả error rõ, không làm mất ý định translation.
- [x] Retry sau partial queue/enqueue quét toàn bộ item `pending` current-source và bảo đảm mỗi item có đúng một active translate job.
- [x] Worker, hai action Issue Editor và Translation Queue Retranslate dùng cùng translate-job gate; một queue item không phát sinh AI request đồng thời.
- [x] Direct Translate giữ retry và error feedback cũ qua `manual_immediate`; không có failed job được hiển thị thành success.
- [x] CIS ingest success không bị rollback bởi provider AI failure; failure có retry/journal độc lập.
- [x] Retryable queue/Sync error schedule lại parent job; terminal error không retry; child journal trace được nối tới parent/request payload.
- [x] Sync to CIS cũ, Pull one issue, Pull project, scheduled pull, resync và `auto_translate` giữ behavior baseline.
- [x] Admin UI lộ rõ hai action, queued state và terminal outcome.
- [x] UI dùng `error.details.job_id`/`status` của 409 để theo dõi job chạy mà không thông báo sai về translation.
- [x] Docs/app, automated verifier và `npm test` phản ánh behavior đã ship.
- [ ] Manual check (Người review) chỉ tick sau xác nhận thực tế.

## Điều kiện hoàn thành

Plan hoàn thành khi BCT-00 đến BCT-03 có `Kết quả thực hiện` pass, tất cả automated checklist liên quan pass thật, docs/app mô tả đúng behavior đã ship và `npm test` pass.

Manual acceptance bằng Backlog và AI credential thật không chặn automated completion. Item Manual check chỉ được tick sau khi user xác nhận.
