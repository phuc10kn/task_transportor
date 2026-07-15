# MUI-07 — Backlog actions UI

## Mục tiêu

Bổ sung Pull one, Pull project và hai candidate actions bằng current API semantics, rồi mở HG-03.

## Artifact mục tiêu

- Backlog mutation/polling components trong `apps/admin-web/features/backlog/**`.
- Full Backlog Issues Playwright suite.
- HG-03 deterministic Backlog seed và review checklist.

## Điều kiện mở phase

- MUI-06 automated pass.
- Current pull/sync endpoints, response shapes và job detail route đã khóa ở MUI-00.

## Công việc

- Pull one mặc định `<backlog_issue_key_prefix>-1`, giữ issue key khi validation/API fail và bind `actions.pull_one` gồm enabled, execution mode, consumer readiness, disabled reasons.
- Pull project gọi POST không gửi Created/Status/Assignee candidate filters; backend dùng persisted Project pull settings.
- Pull project bind `actions.pull_project` và hiển thị current `execution_mode`, `consumer_ready`, `disabled_reasons`; cả hai candidate actions bind `actions.sync_to_cis`. Không dùng readiness của action này để enable action khác.
- Pull project giữ current candidate form/result trên màn, luôn hiển thị `enqueued` và consumer warning từ readiness, rồi theo dõi từng `job.id` được trả trong response `jobs[]`. Response không có job thì render đúng no-op evidence; không tạo `batch_id`, aggregate job hoặc relation API mới.
- Zero job hiển thị no-op theo response; nhiều job hiển thị progress/outcome từng job, không tuyên bố toàn bộ hoàn tất khi còn non-terminal item.
- Mỗi candidate row có `Sync to CIS` và `Sync to CIS + Translate`; một parent active khóa cả hai button của đúng candidate đó, candidate khác vẫn thao tác được và mỗi key chỉ có một poll timer.
- HTTP code không thay explicit body evidence: HTTP 200 render outcome; HTTP 202 có terminal `job.status` thì render terminal, non-terminal job có ID mới hiển thị accepted/queued rồi poll tới `success`, `failed`, `cancelled` hoặc client timeout; aggregate response giữ `enqueued`/`jobs[]`.
- Parent success refresh row/result. Với Sync thường, báo ingest CIS hoàn tất. Với `Sync to CIS + Translate`, chỉ báo CIS sync hoàn tất và hướng review Translation Queue; không tuyên bố draft đã tạo hoặc dùng child-job count từ parent result.
- Khi API trả `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION`, giữ `error.details.job_id/status`, poll parent đó và nói rõ translation chưa queue; sau success hướng operator tới Issue Editor > Translate.
- Chỉ render link CIS Issue khi response hoặc polled job result có explicit CIS issue ID. Translation Queue link chỉ dùng explicit project/issue identity hiện có; không truy tìm child bằng API mới.
- Conflict/failure/cancel/timeout giữ job id/status/input và server error details; không toast sai rằng translation đã queue.
- Route unmount/new search abort request/poll; stale response không ghi đè state mới.
- Mở rộng Backlog route refetch adapter cho action readiness/current active-job evidence; Global Refresh không tạo request mutation hoặc poll timer trùng.
- Không nhận ownership dedupe/one-active-job invariant của backend.

## Checklist nghiệm thu

- [x] Pull project network request không chứa candidate Created/Status/Assignee filters.
- [x] Pull one giữ input; Pull project giữ browse context, `enqueued`, `consumer_ready` warning và zero/one/many returned jobs đúng.
- [x] HTTP 200/202 và explicit terminal/non-terminal body evidence không bị xử lý lẫn nhau.
- [x] Hai candidate actions giữ row isolation và current server evidence.
- [x] Một parent active khóa cả hai action cùng row, không khóa row khác và không tạo poll timer trùng.
- [x] Parent success của action kèm translation không bị trình bày là child translation hoàn tất.
- [x] `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` giữ job evidence và chỉ dẫn Issue Editor > Translate, không claim translation queued.
- [x] Failure/conflict/timeout không làm mất job/input context hoặc báo completed sai.
- [x] Abort/unmount/new-search cleanup chống stale state.
- [x] Current Backlog/Sync verifiers và full Backlog Playwright pass.
- [x] HG-03 được user xác nhận.
- [x] Manual check (Người review tại HG-03).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-07 - automated gate pass | Next: chờ HG-03.

Đã chuyển Pull one, Pull project và hai candidate action sang Next tại `apps/admin-web/app/(console)/backlog-issues/page.tsx`. UI giữ input/context, bind readiness riêng, giữ evidence `enqueued/jobs[]`, poll job non-terminal theo từng ID và cô lập action theo candidate. Không thay đổi backend/API.

Evidence tự động: `npm run verify:backlog-ingestion`, `npm run admin:lint`, `npm run admin:typecheck`, `npm run admin:build`, `npm test` pass; full Admin UI Playwright pass 23/23. Browser matrix bao phủ Pull project query rỗng với zero/one/many jobs, consumer-ready text, Pull one giữ input, row isolation/parent lock, translated-parent feedback, running-without-translation guidance, conflict/timeout evidence và stale response sau search mới. HG-03 và Manual vẫn chờ user review.

### Ma trận evidence Agent

- `backlog-actions.spec.ts`: Pull project/Pull one, row isolation + parent lock, parent translation feedback và running-without-translation guidance.
- `backlog-actions.spec.ts`: candidate conflict/timeout và in-flight action bị vô hiệu sau search mới.
- `backlog.spec.ts` + `verify:backlog-ingestion`: filter/query contract, loading/error/retry và current Backlog job contract.
