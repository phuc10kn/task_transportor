# Plan — Migrate Admin UI sang Next.js

> Ngày lập: 2026-07-14
> Trạng thái: In progress — MUI-16A Project-first workspace gate được mở trước production cutover.
> Scope: Lite, thay thế hoàn toàn Admin UI hiện tại

## Mục tiêu

Thay Admin UI thuần HTML/CSS/JavaScript trong `public/admin` bằng ứng dụng Next.js App Router có route thật, component dùng chung, responsive/accessibility đo được và browser acceptance tái lập được.

Đây là migration của lớp giao diện. Express API, SQLite, module nghiệp vụ, state machine và integration Backlog/Jira/Translation hiện tại không bị thiết kế lại trong plan này.

Chi tiết contract: [00-overview.md](00-overview.md).

## Phạm vi

Bao gồm inventory hành vi UI đang hoạt động, Next.js foundation, auth/API client theo contract hiện tại, toàn bộ route Lite, loading/empty/error/retry, responsive/accessibility, Playwright acceptance, Human Review Gate, xóa UI cũ và atomic cutover service UI.

Không bao gồm schema/database mới, public API hardening, đổi Project DTO, snapshot freshness/fingerprint, đổi Sync Job state machine, Translation transaction redesign, Jira dry-run identity/hash redesign hoặc sửa business rule backend. MUI-16A không có ngoại lệ backend: Dashboard UI bị disabled/không fetch, Project `enabled=false` không thể mở workspace; project-scoped Dashboard và server isolation thuộc phase BE sau MUI-17. Nếu active UI behavior khác không thể triển khai bằng API hiện tại, phase sở hữu phải dừng và ghi blocker để lập plan backend riêng.

## Baseline hiện tại

- `public/admin/app.js` là SPA nguyên khối dùng `state.view`, không có route URL thật.
- Express phục vụ `/admin`; static UI server riêng chạy trên port `8000/8001`.
- JWT nằm trong `localStorage`, request dùng Bearer token và API envelope `/api/v1`.
- Các màn đang hoạt động: Dashboard, Project Config, Backlog Issues, CIS Issues/Issue Editor, Translation Queue, Translation Glossary, Mappings, Anomalies, Sync Jobs và Journal.
- API hiện tại đã phục vụ các hành vi active của UI cũ; migration mặc định tái sử dụng contract đó.
- Repo chưa có Next.js/React/TypeScript frontend hoặc Playwright browser suite.

## Source of truth

Thứ tự ưu tiên:

1. `AGENTS.md`.
2. `docs/app/02-product/README.md` và `docs/app/10-decisions/README.md` cho scope/decision Lite.
3. `docs/app/03-interface/README.md` cho interface truth và design direction.
4. Active behavior trong `public/admin/index.html`, `public/admin/app.js`, `public/admin/styles.css`.
5. Public routes/controller/application hiện tại trong `src/modules/**` và verifier hiện có cho API contract thật.
6. `docs/app/05-architecture/**` cho boundary: Next.js chỉ là client của Express API.
7. `docs/app/06-technical`, `07-implementation`, `08-quality`, `09-operation` cho kỹ thuật, quality và deployment.

Dead/unreferenced function trong legacy source không tạo requirement mới. Code/API hiện tại dùng để xác nhận behavior active, không phải lý do mở rộng backend.

## Phase triển khai

| Thứ tự | Phase | Phụ thuộc mở phase | Kết quả bắt buộc | Human gate sau phase |
| --- | --- | --- | --- | --- |
| 1 | [MUI-00 — Active UI contract và preflight](01-phases/MUI-00-contract-and-preflight.md) | Không | Khóa active-screen/API/visible-data matrix, runtime và baseline. | — |
| 2 | [MUI-01 — Next.js workspace và test harness](01-phases/MUI-01-nextjs-workspace-and-test-harness.md) | MUI-00 automated pass | Frontend package, scripts, API rewrite và browser-test topology. | — |
| 3 | [MUI-02 — Auth và API client](01-phases/MUI-02-auth-and-api-client.md) | MUI-01 automated pass | Bearer auth, envelope/error handling và protected route foundation. | — |
| 4 | [MUI-03 — Console shell và Dashboard](01-phases/MUI-03-console-shell-and-dashboard.md) | MUI-02 automated pass | Design primitives, responsive shell và Dashboard operational. | HG-01 Console foundation |
| 5 | [MUI-04 — Project Config UI](01-phases/MUI-04-project-config-ui.md) | HG-01 confirmed | Project list/create/edit giữ đầy đủ field và API behavior hiện tại. | — |
| 6 | [MUI-05 — Mappings UI](01-phases/MUI-05-mappings-ui.md) | MUI-04 automated pass | Hai chiều mapping, ba refresh action và row-level workflow. | — |
| 7 | [MUI-05Q — Next UI quality pass](01-phases/MUI-05Q-next-ui-quality-pass.md) | MUI-03, MUI-04, MUI-05 automated pass | Một lượt visual/interaction polish desktop cho toàn bộ route Next hiện có, không đổi behavior. | HG-02 Project Config + Mappings |
| 8 | [MUI-06 — Backlog browse UI](01-phases/MUI-06-backlog-browse-ui.md) | HG-02 confirmed | Readiness, Status/Assignee/Not closed và explicit Find. | — |
| 9 | [MUI-07 — Backlog actions UI](01-phases/MUI-07-backlog-actions-ui.md) | MUI-06 automated pass | Pull one/project, hai candidate actions và terminal feedback. | HG-03 Backlog inbound |
| 10 | [MUI-08 — CIS Issues và Issue Editor base](01-phases/MUI-08-cis-issue-editor-base.md) | HG-03 confirmed | CIS list/create/deep-link, canonical editor và operational evidence. | — |
| 11 | [MUI-09 — Issue recovery flows](01-phases/MUI-09-issue-recovery-flows.md) | MUI-08 automated pass | Identity link, Backlog resync và attachment retry. | — |
| 12 | [MUI-10 — Translation UI](01-phases/MUI-10-translation-ui.md) | MUI-09 automated pass | Issue translation và Translation Queue theo API hiện tại. | — |
| 13 | [MUI-11 — Translation Glossary UI](01-phases/MUI-11-translation-glossary-ui.md) | MUI-10 automated pass | Concept/group/language/variant/canonical CRUD. | — |
| 14 | [MUI-11N — NextAdmin fast-track](01-phases/MUI-11N-nextadmin-fast-track.md) | MUI-11 automated pass | NextAdmin-adapted shell, tokens và primitives; migrate toàn bộ route đã có mà không đổi API/auth/business behavior. | HG-03 Backlog inbound + HG-04 Issues + Translation |
| 15 | [MUI-12 — Jira preparation UI](01-phases/MUI-12-jira-preparation-ui.md) | HG-04 confirmed | Target preview/edit, dry-run gate và sync feedback theo contract hiện tại. | HG-05 Jira outbound |
| 16 | [MUI-13 — Anomalies UI](01-phases/MUI-13-anomalies-ui.md) | HG-05 confirmed | List/detail và Resolve/Ignore/Keep open. | — |
| 17 | [MUI-14 — Sync Jobs và Journal UI](01-phases/MUI-14-sync-jobs-and-journal-ui.md) | MUI-13 automated pass | Job operations và read-only audit evidence. | HG-06 Operations |
| 18 | [MUI-15 — Cross-route acceptance](01-phases/MUI-15-cross-route-acceptance.md) | HG-06 confirmed | Full browser/responsive/accessibility acceptance trên Next app. | HG-07 Release candidate |
| 19 | [MUI-16 — Legacy removal và release docs](01-phases/MUI-16-legacy-removal-and-release-docs.md) | HG-07 confirmed | Xóa UI cũ, đổi scripts/docs và tạo release-ready tree. | — |
| 20 | [MUI-16A — Project-first workspace gate](01-phases/MUI-16A-project-workspace-gate.md) | MUI-16 automated pass | Bắt buộc chọn/tạo Project, khóa context xuyên route và scope Dashboard. | HG-07A Project workspace |
| 21 | [MUI-17 — Production atomic cutover](01-phases/MUI-17-production-atomic-cutover.md) | MUI-16A + HG-07A + clean release commit + maintenance window | Deploy exact SHA, chuyển service UI port `8001` và smoke production. | HG-08 Production acceptance |

Chỉ một phase active. Không deploy MUI-01 đến MUI-16 riêng lên production. Human Gate là dependency bắt buộc nhưng không phải phase/file riêng.

## Điều phối

Current phase, blocked state, accepted gaps và resume rules chỉ có một source tại [02-coordination.md](02-coordination.md).

## Checklist nghiệm thu tổng

- [ ] Next.js App Router tồn tại trong `apps/admin-web` và root Express package vẫn CommonJS.
- [ ] Toàn bộ route Lite active được thay bằng route Next.js deep-link được.
- [ ] UI mới chỉ gọi relative `/api/v1/*` qua Express; không truy cập SQLite hoặc Backlog/Jira trực tiếp.
- [ ] Không có schema, module business rule, API response semantics hoặc state machine bị thay đổi trong plan này.
- [ ] Project Config, Mappings, Backlog, Issues, Translation, Jira và Operations giữ active behavior/visible evidence đã khóa tại MUI-00.
- [ ] MUI-11N chỉ vendor tập con NextAdmin Free cần thiết; không nhập auth, ORM, database, demo route hoặc data layer của template.
- [ ] MUI-00 phân loại từng behavior là `Preserve`, `Intentional transform`, `Interface addition` hoặc `Dead — exclude`; không có thay đổi ngầm ngoài bốn nhóm này.
- [ ] Backlog Status/Assignee tiếp tục lấy từ saved mapping values hiện tại; không thêm snapshot table/fingerprint/freshness contract.
- [ ] Pull project dùng persisted Project pull settings, không dùng candidate search filter đang hiển thị.
- [ ] HTTP status không bị dùng thay business evidence: explicit terminal body được giữ đúng, non-terminal job mới poll và aggregate response giữ `enqueued`/`jobs[]`.
- [ ] Parent `manual_pull` success của `Sync to CIS + Translate` chỉ được trình bày là ingest CIS hoàn tất; child translation vẫn bất đồng bộ và phải review tại Translation Queue.
- [ ] Mọi route dữ liệu có loading, empty, error/retry và success feedback phù hợp; form lỗi giữ input.
- [ ] HG-01 đến HG-07 pass trước khi xóa legacy; HG-08 pass trên production.
- [ ] Keyboard/focus, three viewports, touch target, reduced-motion và selected axe WCAG A/AA gate pass.
- [ ] `verify:phase07` chạy Next lint/typecheck/build + Playwright behavior acceptance; không còn source-regex legacy sau cutover.
- [ ] `public/admin`, Express `/admin` mount và `scripts/serve-admin-ui.js` bị xóa sau HG-07.
- [ ] Production port `8001` chỉ có Next UI; `/admin*` không còn phục vụ legacy.
- [ ] `npm test`, `npm run verify:docs` và `git diff --check` pass.
- [ ] Unit test check (Agent).
- [ ] Manual check (Người review).

## Điều kiện hoàn thành

Plan hoàn thành khi MUI-00 đến MUI-16A và MUI-17 có `Kết quả thực hiện` hợp lệ, HG-01 đến HG-08 cùng HG-07A được xác nhận đúng mốc, full automated gate pass sau legacy cleanup, production smoke pass và không còn blocker UI migration.
