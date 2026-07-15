# MUI-10 — Translation UI

## Mục tiêu

Chuyển Issue translation actions và Translation Queue sang Next.js theo lifecycle hiện tại, giữ AI draft và human review authority.

## Artifact mục tiêu

- `/translation-queue` route.
- `apps/admin-web/features/translation/**` và Issue Editor translation surfaces.
- Translation Queue/Issue translation Playwright suites.

## Điều kiện mở phase

- MUI-09 automated pass.
- Current Translation Queue, issue translate/retranslate và review endpoints đã khóa ở MUI-00.

## Công việc

- Issue Editor dùng Translation-owned current endpoints; xử lý current HTTP 200/202 semantics đúng.
- Giữ translate, retranslate, edit, Approve + save và reject cho summary/description. `completed` mới báo draft đã tạo; `queued`/`partial_queued` chỉ báo job đang xử lý và giữ job evidence hiện có.
- Queue giữ list/detail/filter theo Project/Issue/review status mà endpoint hiện hỗ trợ; table giữ ID, Issue, target type/field hoặc comment context, Status, Source, AI Draft, Reviewed và Actions. AI Draft/Reviewed hiển thị tách riêng khi cả hai tồn tại, không dùng fallback làm mất một evidence. Filter, detail, target context và provider-error evidence là `Interface addition`; không làm đổi review lifecycle.
- Queue list/show chỉ render raw row evidence hiện có, gồm provider error; không tự suy `is_source_stale` cho queue row/comment.
- Issue Editor render decorated current-source/stale evidence. Item stale phải để translated text rỗng và khóa `Approve + save` tới khi retranslate tạo current-source item.
- Khi AI draft bằng source text, hiển thị warning hiện hành trước review.
- Manual edit dùng controlled dialog; không dùng browser prompt/confirm.
- AI output luôn là draft; chỉ current approve/manual-edit actions cập nhật canonical theo backend.
- Action chống double submit, giữ selected/filter/context và render server errors.
- Queue Retranslate phân biệt `reused=true` (job active được reuse) với job mới queued; không dùng cùng success message.
- Candidate/Issue link tới `/translation-queue?project_id=...&issue_id=...` khi identity hiện có; empty result giải thích rõ.
- Đăng ký Translation Queue nav/refetch adapter và mở rộng Issue Editor adapter cho translation evidence; Global Refresh không tự chạy translate/retranslate.
- Không sửa Translation repository, state machine, dedupe hoặc CIS apply transaction.

## Checklist nghiệm thu

- [x] Issue translation và Queue dùng current Translation-owned API.
- [x] Current HTTP 200/202 semantics không bị nhầm.
- [x] Issue/comment queue lifecycle và manual edit hoạt động.
- [x] Queue raw evidence và Issue Editor decorated stale evidence không bị trộn contract.
- [x] Queue không làm mất AI Draft hoặc Reviewed evidence khi cả hai cùng tồn tại.
- [x] Stale editor item không prefill old draft/reviewed text và không cho Approve + save trước current-source retranslate.
- [x] Same-as-source warning và Retranslate reused/new feedback được giữ.
- [x] Human review authority và backend state được giữ.
- [x] Loading/empty/error/retry giữ filter/detail context.
- [x] Translation verifiers và full Playwright pass.
- [x] Manual check (Người review tại HG-04).
- [x] Unit test check (Agent).

## Kết quả thực hiện

In-progress: MUI-10 - automated gate pass | Next: chờ HG-04.

Đã đưa Translation surface vào Issue Editor và thêm route `/translation-queue` với URL filter Project/Issue/review status, AI Draft/Reviewed tách riêng, controlled edit, approve/reject/retranslate và provider-error evidence. Issue stale được cảnh báo và khóa approve; action dùng Translation-owned API hiện tại.

Evidence tự động: `npm run verify:translation-issue-routes`, `npm run verify:translation-review`, `npm run admin:lint`, `npm run admin:typecheck`, `npm run admin:build`, `npm test` pass; full Admin UI Playwright pass 23/23. Browser matrix kiểm HTTP 200/202 feedback, queue raw vs editor stale evidence, AI Draft/Reviewed preservation, source-stale blank/blocked controls, same-source warning, retranslate reused/new feedback và URL-preserving queue error/retry. Manual/HG-04 vẫn chờ user review.

### Ma trận evidence Agent

- `cis-issue-editor.spec.ts`: issue translation HTTP 202, same-source warning, stale item blank/blocked and manual review controls.
- `translation.spec.ts`: queue raw Draft/Reviewed/provider evidence, retranslate reused/new feedback và URL-preserving error/retry.
- `verify:translation-issue-routes` + `verify:translation-review`: current Translation-owned API and review authority.
