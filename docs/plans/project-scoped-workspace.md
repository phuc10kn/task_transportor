# Kế hoạch — Gom toàn bộ workspace theo Project

> Ngày lập: 2026-07-16  
> Trạng thái: Approved — PSP-00 sẵn sàng triển khai  
> Scope: Backend API + Admin Web, Lite  
> Hình thức: một file review theo yêu cầu của user; chưa phải tài liệu canonical trong `docs/app`

## Mục tiêu

Đóng hai khoản nợ `BE-PROJECT-SCOPE-01/02` bằng cách đưa mọi API và màn hình thuộc workspace về cùng một boundary Project:

- URL API luôn chứa `projectId` rõ ràng;
- Backend kiểm tra Project tồn tại, đang enabled và resource thực sự thuộc Project đó;
- Admin Web chỉ gọi endpoint của Project đang active;
- Dashboard được mở lại sau khi summary và alerts đã project-scoped;
- save, pull, retry và các action bất đồng bộ chỉ loading/cập nhật đúng item hoặc nút phát sinh action, không reload page và không ghi đè draft ở item khác.

## Phạm vi

### Trong scope

- Chuẩn hóa endpoint workspace về prefix `/api/v1/projects/:projectId`.
- Thêm Project workspace middleware dùng chung cho xác thực Project tồn tại/enabled.
- Scope truy vấn read/write theo `project_id` tại repository/state owner tương ứng.
- Chuyển toàn bộ caller Admin Web sang endpoint mới.
- Làm `CIS.pollJob` project-aware.
- Mở Dashboard project-scoped ở cả Backend và Admin Web.
- Bổ sung automated isolation test với ít nhất hai Project enabled và một Project disabled.
- Xóa route cũ ngay khi capability tương ứng cutover; Backend và Admin Web được deploy phối hợp trong cùng release.
- Cập nhật tài liệu canonical sau khi implementation và acceptance pass.

### Ngoài scope

- Tenant, organization, RBAC theo Project và phân quyền người dùng.
- Đưa active Project vào JWT, cookie hoặc custom header.
- Global/current Project state ở Backend.
- API version `v2`, compatibility proxy, dual route hoặc thời gian deprecation.
- Thay framework Admin Web, SPA rewrite hoặc thêm state-management library.
- Thay schema dữ liệu chỉ để phục vụ URL mới; index chỉ thêm khi query plan hoặc test hiệu năng chứng minh cần thiết.
- Thay đổi worker nội bộ sang gọi HTTP API.

## Baseline hiện tại

- Admin Web đã giữ active Project trong `sessionStorage` qua `cis_active_project_id`, nhưng nhiều request vẫn gọi route global.
- Dashboard đang bị disabled tại `apps/admin-web/views/layout.js` và bị chặn fetch trong `apps/admin-web/public/shared.js` vì Backend chưa scope theo Project.
- Backlog pull và Translation Glossary đã có route Project-scoped; đây là baseline cần giữ, không rewrite vô ích.
- CIS Issues đang tồn tại cả route global và một route list Project-scoped; mutation và detail vẫn global.
- Jira mapping-values pull đã project-scoped; dry-run và sync theo issue vẫn global.
- Translation Queue, Mapping, Anomaly, Sync Jobs, Sync Journal và attachment retry vẫn global.
- `CIS.pollJob(id, ...)` đang poll `/api/v1/sync-jobs/:id`, chưa mang Project context.
- Các page scripts hiện có: `issues.js`, `translation.js`, `mappings.js`, `operations.js`, `backlog.js`; UI dùng Tabler + vanilla JavaScript và tiếp tục giữ kiến trúc này.
- Product và quality docs đang ghi nhận Dashboard disabled cùng `BE-PROJECT-SCOPE-01/02` là accepted gap chờ phase Backend.

## Source of truth

Thứ tự ưu tiên khi triển khai:

1. `AGENTS.md` cho scope Lite, module boundary, Admin UI và quality gate.
2. `docs/app/02-product/README.md` cho product scope và accepted gap hiện tại.
3. `docs/app/10-decisions/README.md` cho quyết định còn hiệu lực.
4. `docs/app/05-architecture/**` cho module ownership, read allowlist và repository boundary.
5. `docs/app/03-interface/README.md` và `docs/app/08-quality/README.md` cho Admin UI acceptance.
6. File kế hoạch này khóa target contract sau khi user review chấp thuận.
7. Code và verify hiện tại là baseline evidence; chúng không ghi đè contract đã được duyệt.

## Quyết định cần khóa khi review

| Chủ đề | Quyết định đề xuất |
| --- | --- |
| Workspace URL | Mọi resource workspace dùng `/api/v1/projects/:projectId/...`. |
| Global API | Chỉ giữ health, auth và Project CRUD/config ở global scope. |
| Active Project FE | Tiếp tục lưu `projectId` trong `sessionStorage`; mỗi caller truyền explicit vào helper. |
| Project resolution | Middleware resolve Project qua public API của Projects module và gắn `req.project`. |
| Resource ownership | Repository/state owner query bằng resource id + `project_id`; không tạo service trung tâm đọc mọi bảng. |
| Cross-project lookup | Trả `404 RESOURCE_NOT_FOUND` để không lộ resource thuộc Project khác. |
| Project disabled | Trả `409 PROJECT_DISABLED` cho toàn bộ workspace read/write. |
| `project_id` trong body/query | Không dùng làm scope. Nếu request gửi giá trị xung đột với path thì trả `422 PROJECT_SCOPE_MISMATCH`. |
| Cutover | Backend + Admin Web cutover cùng capability; không giữ route legacy. |
| Loading FE | Action sở hữu loading của chính nó; không thay toàn bộ page/body và không refetch danh sách sau mutation thành công. |
| Refresh dữ liệu | Nút Refresh hiện có là đường explicit để reload toàn màn. |

## Target API contract

### Endpoint global được giữ

- `GET /api/v1/health`
- `/api/v1/auth/*`
- `GET/POST /api/v1/projects`
- `GET/PATCH/DELETE /api/v1/projects/:projectId`
- Các action cấu hình/enablement Project hiện có dưới `/api/v1/projects/:projectId`.

Project CRUD/config là control plane. Các endpoint còn lại trong bảng dưới là workspace data plane.

### Endpoint workspace sau cutover

| Capability | Endpoint target |
| --- | --- |
| Dashboard | `GET /api/v1/projects/:projectId/dashboard/summary` |
| Dashboard | `GET /api/v1/projects/:projectId/dashboard/alerts` |
| CIS Issues | `GET/POST /api/v1/projects/:projectId/issues` |
| CIS Issue | `GET/PATCH /api/v1/projects/:projectId/issues/:issueId` |
| Issue editor/history | `GET /api/v1/projects/:projectId/issues/:issueId/editor` và `/history` |
| Issue worklogs/attachments | `GET /api/v1/projects/:projectId/issues/:issueId/worklogs` và `/attachments` |
| Issue identities/actions | `/api/v1/projects/:projectId/issues/:issueId/external-identities`, `/force-approve`, `/mark-duplicate` |
| Issue translation | `/api/v1/projects/:projectId/issues/:issueId/translations/...` |
| Jira dry-run/sync | `POST /api/v1/projects/:projectId/issues/:issueId/dry-run/jira` và `/sync/jira` |
| Jira mapping values | `POST /api/v1/projects/:projectId/jira/mapping-values/pull` |
| Translation Queue | `/api/v1/projects/:projectId/translation-queue[/:queueId]` và các action `/draft`, `/approve`, `/reject`, `/retranslate` |
| Translation Glossary | Giữ `/api/v1/projects/:projectId/translation-glossary/...` |
| Mapping settings/rules | `/api/v1/projects/:projectId/mapping-settings` và `/mapping-rules[/:ruleId]`, gồm `/approve`, `/reject` |
| Anomaly | `/api/v1/projects/:projectId/anomalies[/:anomalyId]`, gồm `/resolve`, `/ignore` |
| Sync Jobs | `/api/v1/projects/:projectId/sync-jobs[/:jobId]`, gồm `/retry`, `/cancel` |
| Sync Journal | `/api/v1/projects/:projectId/sync-journal` và `/issues/:issueId/sync-journal` |
| Backlog | Giữ `/api/v1/projects/:projectId/backlog/...` |
| Attachment retry | `POST /api/v1/projects/:projectId/attachments/:attachmentId/retry-download` |

### Response và isolation rule

- Giữ envelope hiện tại `{ data: ... }` và `{ error: ... }`.
- Middleware chỉ chịu trách nhiệm Project existence/enabled; controller/use case vẫn gọi public module API theo boundary hiện tại.
- Owner repository chịu trách nhiệm object isolation bằng điều kiện `project_id` hoặc JOIN qua owner có `project_id`.
- Resource con không có `project_id` trực tiếp phải scope qua aggregate owner; không lookup child id global rồi kiểm tra sau.
- Read model Dashboard phải áp dụng cùng `project_id` cho tất cả subquery. Không trả count global như `projects_enabled` trong workspace summary.
- Internal worker/job flow tiếp tục truyền `project_id` trong command/payload; không phụ thuộc HTTP middleware.

## Target Admin Web

### Shared client

Thêm helper nhỏ trong `apps/admin-web/public/shared.js`:

```js
CIS.projectApi(projectId, path, options)
```

Helper chỉ ghép `/api/v1/projects/${projectId}` với `path`, validate `projectId` và gọi lại `CIS.api`. Không đọc active Project ngầm và không chứa business rule.

Đổi polling thành:

```js
CIS.pollJob(projectId, jobId, onUpdate, timeout)
```

### Mutation và loading

Áp dụng cùng một rule cho save mapping item, pull buttons, approve/reject, retry/cancel và các action bổ sung sau này:

1. Disable và hiện busy/loading trên đúng control phát action.
2. Không replace `#page-content`, table, section hoặc row khác.
3. Request thành công chỉ patch state/DOM của entity vừa thay đổi từ response API.
4. Không refetch list sau success; người dùng chủ động dùng nút Refresh khi muốn đồng bộ lại toàn màn.
5. Request lỗi giữ nguyên input/draft, trả control về trạng thái thao tác được và hiển thị lỗi gần action.
6. Các action ở item khác vẫn thao tác được nếu không cùng entity đang pending.
7. Deep link trỏ resource sai Project hiển thị not-found/error state và link quay về list của active Project.

### Dashboard

- Bỏ trạng thái disabled trong `apps/admin-web/views/layout.js`.
- Bỏ nhánh `Dashboard unavailable` trong `apps/admin-web/public/shared.js`.
- Dùng `apps/admin-web/public/pages/operations.js` để render Dashboard, tránh tạo page helper mới khi file hiện tại đã sở hữu operations read model.
- Hiển thị pending review, missing mapping, failed job và open anomaly của đúng Project.
- Có loading, empty, error và retry state; các card/link điều hướng sang queue, mappings, jobs và anomalies.

## Phase triển khai

| Thứ tự | Phase | Dependency | Kết quả bắt buộc |
| --- | --- | --- | --- |
| 1 | PSP-00 — Khóa contract và preflight | Plan được user duyệt | Endpoint/error/cutover contract thành decision được chấp thuận. |
| 2 | PSP-01 — Foundation Project scope | PSP-00 pass | Middleware, test fixture và FE helper dùng chung sẵn sàng. |
| 3 | PSP-02 — CIS, Jira và Attachment slice | PSP-01 pass | Issue workflow chạy hoàn chỉnh bằng endpoint mới. |
| — | HG-01 — Human Review Gate | PSP-02 automated pass | User kiểm issue edit/save/dry-run/sync và xác nhận draft item khác không mất. |
| 4 | PSP-03 — Translation và Mapping slice | HG-01 pass | Queue, glossary và mappings project-scoped; item action cô lập. |
| 5 | PSP-04 — Anomaly, Sync Jobs và Journal slice | PSP-03 pass | Operations read/write và polling project-scoped. |
| — | HG-02 — Human Review Gate | PSP-04 automated pass | User kiểm mapping buttons, translation actions, retry/cancel và polling. |
| 6 | PSP-05 — Dashboard Backend + FE | HG-02 pass | Dashboard được mở lại và chỉ phản ánh active Project. |
| 7 | PSP-06 — Cleanup, docs và release gate | PSP-05 pass | Route cũ bị xóa, full verify pass, docs canonical đồng bộ. |
| — | HG-03 — Final acceptance | PSP-06 automated pass | User xác nhận toàn bộ workspace và Dashboard trước release. |

## PSP-00 — Khóa contract và preflight

### Mục tiêu

Chuyển contract đã review thành quyết định triển khai, xác nhận schema hiện tại đủ ownership data và khóa danh sách endpoint cũ phải xóa.

### Artifact mục tiêu

- `docs/app/10-decisions/01-decision-making/01-decisions/DEC-005-project-scoped-workspace-api/README.md`
- Endpoint inventory từ `src/modules/*/http/routes.js` và caller inventory từ `apps/admin-web/public/**/*.js`, `scripts/verify/**/*.js`
- Decision schema contract và docs navigation gate; `Decision` không phải canonical entity type trong `docs/meta/01-entity-types`

### Điều kiện mở phase

- User duyệt các quyết định trong plan, đặc biệt `404`, `409`, `422` và cutover không compatibility.

### Công việc

- Materialize decision đúng entity contract và architecture relation policy.
- Chứng minh mọi aggregate cần scope có đường ownership tới `project_id`.
- Ghi rõ child resource phải JOIN qua owner nào.
- Lập inventory old route → target route → FE caller → verify caller.
- Xác nhận không cần schema migration; ghi evidence cho index thật sự cần thêm.

### Checklist nghiệm thu

- [x] Decision record khớp `decision/v1` và docs navigation gate.
- [x] Không còn endpoint/caller nào ngoài inventory surface đã khóa.
- [x] Mọi resource có ownership path tới Project.
- [x] SQLite backup và rollback command được xác định cho release.

### Kết quả thực hiện

Fix tối thiểu: docs/app/10-decisions/01-decision-making/01-decisions/DEC-005-project-scoped-workspace-api/README.md - khóa endpoint, error, ownership, FE interaction và coordinated release contract  
No-change: docs/meta/01-entity-types - Decision dùng `decision/v1`, không tạo entity type giả để bypass Type Contract Gate

## PSP-01 — Foundation Project scope

### Mục tiêu

Tạo một Project scope boundary dùng chung và client helper tối thiểu trước khi chuyển từng capability.

### Artifact mục tiêu

- Project workspace middleware trong infrastructure/http composition phù hợp cấu trúc repo
- `src/app.js`
- `apps/admin-web/public/shared.js`
- `scripts/verify/project-scope.js`
- `package.json` với `verify:project-scope`

### Điều kiện mở phase

- PSP-00 automated checklist pass.

### Công việc

- Middleware parse `projectId`, resolve Project qua Projects public API, chặn missing/disabled Project và gắn `req.project`.
- Không đưa resource-specific ownership vào middleware.
- Thêm `CIS.projectApi(projectId, path, options)` và đổi `CIS.pollJob` sang signature có `projectId`.
- Tạo fixture Project A/B enabled và Project C disabled.
- Khóa error contract `404 PROJECT_NOT_FOUND`, `409 PROJECT_DISABLED`, `422 PROJECT_SCOPE_MISMATCH`.

### Checklist nghiệm thu

- [x] Middleware test pass cho invalid, missing, disabled và enabled Project.
- [x] FE helper không đọc active Project ngầm.
- [x] `pollJob` không còn gọi sync-job route global.
- [x] Không có service trung tâm truy cập repository của nhiều module.

### Kết quả thực hiện

Fix tối thiểu: src/http/middleware/requireProjectWorkspace.js - resolve Project, chặn disabled và reject body/query scope mismatch  
Fix tối thiểu: apps/admin-web/public/shared.js - thêm explicit `projectApi` và project-aware `pollJob`  
Fix tối thiểu: src/modules/Sync - thêm scoped job-read phục vụ polling; list/retry/cancel giữ cho PSP-04  
Fix tối thiểu: scripts/verify/project-scope.js - khóa middleware, FE boundary và cross-project job-read assertions

## PSP-02 — CIS, Jira và Attachment slice

### Mục tiêu

Cutover trọn issue workflow để Backend và Issue List/Editor cùng dùng Project scope.

### Artifact mục tiêu

- `src/modules/Cis/http/routes.js` và owner use case/repository liên quan
- `src/modules/Jira/http/routes.js` và owner use case/repository liên quan
- `src/modules/Backlog/http/routes.js` cho attachment retry
- `apps/admin-web/public/pages/issues.js`
- Verify scripts cho system issues, issue editor, Jira và attachment retry

### Điều kiện mở phase

- PSP-01 pass và Project scope fixtures chạy được.

### Công việc

- Chuyển toàn bộ issue list/detail/editor/mutation/action sang route target.
- Scope issue, history, worklog, attachment, external identity và journal lookup theo Project.
- Chuyển Jira dry-run/sync và attachment retry sang Project URL.
- Cập nhật Issue List/Editor caller.
- Giữ form/draft khi request lỗi và chỉ loading đúng action phát sinh request.
- Xóa route CIS/Jira/attachment cũ ngay trong slice.

### Checklist nghiệm thu

- [x] List Project A không chứa issue Project B.
- [x] Dùng issue B qua URL Project A trả 404 cho read và mutation.
- [x] Cross-project mutation không đổi DB, journal hoặc job.
- [x] Save issue không reload page, giữ nguyên form hiện tại và chỉ loading tại nút Save.
- [x] Dry-run/sync/attachment retry chỉ tạo job trong Project của resource.
- [x] Old route của slice trả 404.

### Kết quả thực hiện

Fix tối thiểu: src/modules/Cis - cutover issue list/detail/editor/mutation/action sang Project URL và enforce ownership tại public API/repository  
Fix tối thiểu: src/modules/Jira và src/modules/Backlog - scope Jira dry-run/sync và attachment retry theo Project của resource  
Fix tối thiểu: apps/admin-web/public/pages/issues.js - dùng explicit `projectApi`; Save cập nhật state tại chỗ, không reload và không khóa action khác  
Fix tối thiểu: verify scripts và Admin Web E2E - khóa list/read/mutation isolation, zero side-effect, old-route 404 và no-reload Save  
Pass: PSP-02 — automated gate pass; HG-01 được user xác nhận ngày 2026-07-16

## PSP-03 — Translation và Mapping slice

### Mục tiêu

Cutover Translation Queue, issue translation và Mapping; xử lý item-level state độc lập trên FE.

### Artifact mục tiêu

- `src/modules/Translation/http/routes.js` và owner repositories/use cases
- `src/modules/Mapping/http/routes.js` và owner repositories/use cases
- `apps/admin-web/public/pages/translation.js`
- `apps/admin-web/public/pages/mappings.js`
- `apps/admin-web/public/pages/backlog.js` cho các pull button liên quan mapping values
- Verify scripts và Admin Web E2E mocks liên quan

### Điều kiện mở phase

- PSP-02 pass và HG-01 được user xác nhận.

### Công việc

- Scope queue list/detail/draft/approve/reject/retranslate theo Project.
- Giữ glossary route hiện có và đưa qua middleware chung mà không đổi contract nghiệp vụ.
- Scope mapping settings/rules và approve/reject theo Project.
- Cập nhật toàn bộ FE caller và mock URL.
- Với save mapping item, chỉ set pending trên item đó; success patch status/value của item đó; không render lại group/list.
- Áp dụng cùng action-state rule cho Pull Backlog fields, Pull Jira fields và Sync CIS catalog from Jira.

### Checklist nghiệm thu

- [x] Translation Queue và Mapping list A không chứa B.
- [x] Queue/rule B qua Project A trả 404 và không mutate.
- [x] Save một mapping item không mất các unsaved mapping item khác.
- [x] Ba pull buttons chỉ loading tại nút được click và không reload page.
- [x] Lỗi API giữ selection/draft và cho phép retry đúng item.
- [x] Old route Translation/Mapping của slice trả 404.

### Kết quả thực hiện

Fix tối thiểu: src/modules/Translation và src/modules/Mapping - Project-scoped routes, lookup `(id, project_id)` và zero-side-effect cross-project guard  
Fix tối thiểu: apps/admin-web/public/pages/mappings.js - row-local Save/error/retry và ba catalog action không reload/fetch lại settings  
Fix tối thiểu: apps/admin-web/public/pages/translation.js và pages/issues.js - scoped caller, cập nhật status tại item và loại bỏ `location.reload()`  
Fix tối thiểu: verify phase04/05 và Admin Web E2E - isolation, old-route 404, adjacent draft preservation, action-local loading và retry evidence  
Pass: PSP-03 — automated gates pass

## PSP-04 — Anomaly, Sync Jobs và Journal slice

### Mục tiêu

Cutover operations workflow và bảo đảm polling/recovery không vượt Project boundary.

### Artifact mục tiêu

- `src/modules/Anomaly/http/routes.js` và owner repositories/use cases
- `src/modules/Sync/http/routes.js` và owner repositories/use cases
- `apps/admin-web/public/pages/operations.js`
- Verify scripts và Admin Web E2E mocks liên quan

### Điều kiện mở phase

- PSP-03 automated checklist pass.

### Công việc

- Scope anomaly list/detail/create/resolve/ignore.
- Scope sync-job list/detail/create/retry/cancel.
- Scope journal list và issue journal.
- Cập nhật Operations callers và mọi `CIS.pollJob` caller.
- Chỉ patch row/card đang được resolve, ignore, retry hoặc cancel.
- Xóa old routes của slice.

### Checklist nghiệm thu

- [x] Anomaly/job/journal list A không chứa B.
- [x] Retry/cancel job B qua Project A trả 404 và không enqueue/mutate.
- [x] Polling Project A không đọc trạng thái job Project B.
- [x] Pending action không khóa row/card khác.
- [x] Old route Anomaly/Sync của slice trả 404.

### Kết quả thực hiện

Fix tối thiểu: src/modules/Anomaly - Project-scoped route/lookup và validate optional issue ownership trước create/action  
Fix tối thiểu: src/modules/Sync - cutover job/journal/issue-journal; scope list/create/read/retry/cancel và chặn foreign issue/job  
Fix tối thiểu: apps/admin-web/public/pages/operations.js - scoped caller; resolve/ignore/retry/cancel patch đúng row, không render lại page  
Fix tối thiểu: project-scope, mapping-anomaly, phase02/05/06/07 và Admin Web E2E - isolation, polling, zero side-effect, legacy 404 và local pending state  
Pass: PSP-04 — automated gates pass; HG-02 được user xác nhận ngày 2026-07-16

## PSP-05 — Dashboard Backend + FE

### Mục tiêu

Mở Dashboard sau khi summary và alerts đã hoàn toàn project-scoped.

### Artifact mục tiêu

- `src/modules/Dashboard/http/routes.js`
- `src/modules/Dashboard/DashboardApi.js` và read model/repository liên quan
- `apps/admin-web/views/layout.js`
- `apps/admin-web/public/shared.js`
- `apps/admin-web/public/pages/operations.js`
- Dashboard verify và Admin Web E2E

### Điều kiện mở phase

- PSP-04 pass và HG-02 được user xác nhận.

### Công việc

- Scope mọi Dashboard subquery theo `project_id`.
- Chuyển summary/alerts route sang Project URL.
- Loại global `projects_enabled` khỏi workspace response.
- Enable Dashboard navigation và bỏ early disabled state.
- Render counts/alerts, loading, empty, error, retry và link điều hướng theo active Project.

### Checklist nghiệm thu

- [x] Dashboard A không tính pending/mapping/job/anomaly của B.
- [x] Dashboard C disabled trả 409 và FE hiển thị state đúng.
- [x] Dashboard không gửi request khi chưa chọn active Project.
- [x] Keyboard focus, link và retry hoạt động.
- [x] `docs/app/03-interface/README.md` acceptance được đáp ứng bằng Playwright evidence.

### Kết quả thực hiện

Fix tối thiểu: src/modules/Dashboard — summary/alerts nhận Project context, mọi subquery lọc `project_id`, bỏ `projects_enabled` và xóa route global  
Fix tối thiểu: apps/admin-web — bật Dashboard nav, render KPI/alert scoped với loading/empty/error/retry/link, không fetch khi thiếu/disabled Project  
Evidence: project-scope fixture A/B/C, phase07/Admin CI và Playwright 10/10 bao phủ error/retry/empty/focus/link/no-project/disabled state  
Pass: PSP-05 — automated checklist pass

## PSP-06 — Cleanup, docs và release gate

### Mục tiêu

Loại toàn bộ contract cũ, cập nhật source of truth và chứng minh release có thể triển khai phối hợp an toàn.

### Artifact mục tiêu

- `src/modules/*/http/routes.js`
- `apps/admin-web/public/**/*.js`
- `scripts/verify/**/*.js`
- `docs/app/02-product/README.md`
- `docs/app/03-interface/README.md`
- `docs/app/05-architecture/**` liên quan
- `docs/app/06-technical/README.md`
- `docs/app/07-implementation/README.md`
- `docs/app/08-quality/README.md`
- `docs/app/09-operation/README.md`
- `docs/app/10-decisions/README.md`

### Điều kiện mở phase

- PSP-05 automated checklist pass.

### Công việc

- Thêm static gate quét route/caller cũ; chỉ cho phép historical provenance trong docs quyết định.
- Cập nhật toàn bộ verify/E2E mock sang target endpoint.
- Cập nhật canonical docs và đóng `BE-PROJECT-SCOPE-01/02`.
- Chạy full automated gate và sync CodeGraph index.
- Chuẩn bị release runbook: stop service, backup SQLite, deploy Backend + Admin Web cùng artifact, start, smoke test, rollback toàn artifact + database backup khi smoke fail.

### Checklist nghiệm thu

- [x] `npm run verify:project-scope` pass.
- [x] Existing phase/system/Admin Web verify pass.
- [x] `npm test` pass.
- [x] Static gate không tìm thấy old API route/caller trong code và verify scripts.
- [x] `npm run verify:docs` pass.
- [x] CodeGraph sync hoàn tất và không báo stale index.
- [x] Release smoke test bao phủ login, chọn Project, issue save, mapping save, pull, retry và Dashboard.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

### Kết quả thực hiện

Fix tối thiểu: scripts/verify/project-scope-static.js — lexical cutover gate cho Backend routes, Admin callers và verify callers; legacy 404 vẫn được kiểm bằng path dựng động  
Docs: product/interface/architecture/technical/implementation/quality/operation/decisions đóng `BE-PROJECT-SCOPE-01/02` và chốt coordinated deploy/backup/smoke/rollback  
Evidence: `npm test`, Admin CI, Playwright 10/10, Translation boundary scans, docs/architecture gates và `git diff --check` pass  
CodeGraph: index up to date — 295 files, 1.859 nodes, 4.846 edges, DB 7,89 MB  
In-progress: PSP-06 automated pass; release dừng tại HG-03 để người review xác nhận manual acceptance

## Human Review Gates

### HG-01 — Issue workflow

- Bundle kết thúc: PSP-02.
- Người review thao tác: sửa nhiều field trong một Issue Editor rồi Save; chạy Jira dry-run/sync và attachment retry trên cùng issue.
- Điều kiện xác nhận: Save không reload page, form giữ nguyên state, loading chỉ nằm tại action đang chạy, dữ liệu không vượt active Project.
- Phase bị giữ khi chưa pass: PSP-03.

### HG-02 — Mapping, Translation và Operations

- Bundle kết thúc: PSP-04.
- Người review thao tác: save nhiều mapping item nối tiếp; dùng ba pull buttons; approve/reject/retranslate; retry/cancel job; resolve/ignore anomaly.
- Điều kiện xác nhận: item state độc lập, lỗi giữ input, polling/action đúng Project, không có full-page refresh ngoài nút Refresh.
- Phase bị giữ khi chưa pass: PSP-05.

### HG-03 — Final workspace acceptance

- Bundle kết thúc: PSP-06.
- Người review thao tác: đi qua Dashboard và toàn bộ workspace bằng Project A/B; thử deep link sai Project và Project disabled.
- Điều kiện xác nhận: UI chỉ hiển thị dữ liệu active Project, error state rõ, Dashboard counts/links đúng và không còn flow gọi route cũ.
- Release bị giữ khi chưa pass.

## Điều phối

### Handoff hiện tại

Current phase: HG-03 — Final workspace acceptance  
Done: PSP-00 đến PSP-05 pass; PSP-06 implementation và toàn bộ automated release gates pass; HG-01/HG-02 đã được user xác nhận.  
Next: User chạy HG-03 với Project A/B, deep link sai Project và Project disabled; xác nhận manual pass để release.  
Prompt tiếp theo: executor.md

### Trạng thái blocked

None.

### Accepted gaps

- Không hỗ trợ zero-downtime giữa Backend cũ và Admin Web mới; release dùng coordinated deployment.
- Không thêm compatibility route hoặc API v2.
- Không thêm index nếu chưa có evidence từ query plan/test.

### Quy tắc resume

- Chỉ mở `PSP-00` sau khi user xác nhận các quyết định cần khóa.
- Mỗi phase phải ghi `Kết quả thực hiện` và pass checklist tự động trước khi chuyển phase.
- Phase sau Human Gate chỉ mở khi user xác nhận gate tương ứng.
- Nếu implementation phát hiện resource không có ownership path tới Project, dừng phase, ghi `In-progress` và quay lại sửa decision/plan trước khi code tiếp.
- Nếu target endpoint thay đổi sau PSP-00, invalidate verify evidence và FE caller của các phase downstream liên quan.

## Rủi ro và rollback

| Rủi ro | Cách kiểm soát | Trigger dừng |
| --- | --- | --- |
| FE mới gọi Backend cũ hoặc ngược lại | Deploy Backend + Admin Web trong cùng artifact/release window | Smoke test gặp 404 do lệch contract |
| Lookup id global làm lộ/mutate chéo Project | Query `(id, project_id)` hoặc JOIN owner; test A/B cho từng aggregate | Bất kỳ cross-project mutation nào đổi DB/job/journal |
| Child table thiếu `project_id` | Scope qua aggregate owner trong một query | Không chứng minh được ownership path |
| Dashboard còn count global | Test fixture A/B với count khác nhau | Summary/alerts A thay đổi khi chỉ seed B |
| FE rerender làm mất draft | Patch đúng entity từ response; E2E nhiều unsaved item | Draft item không liên quan bị đổi/mất |
| SQLite query chậm sau thêm scope | Kiểm tra query plan và thêm index có evidence | Query plan scan gây regression đo được |

Rollback release là rollback toàn bộ Backend + Admin Web về cùng version và restore SQLite backup nếu release có migration/index change. Không rollback riêng FE hoặc riêng Backend.

## Checklist nghiệm thu tổng

- [x] Tất cả workspace endpoint mang `projectId` trong URL.
- [x] Global route chỉ còn health, auth và Project control plane.
- [x] Cross-project read/write trả 404 và không tạo side effect.
- [x] Disabled Project trả `409 PROJECT_DISABLED`.
- [x] Conflicting body/query Project trả `422 PROJECT_SCOPE_MISMATCH`.
- [x] Admin Web không còn caller đến old workspace endpoints.
- [x] Save/pull/retry/approve actions chỉ loading và patch item phát sinh action.
- [x] Draft/selection của item khác không mất sau mutation.
- [x] Dashboard được mở lại và chỉ phản ánh active Project.
- [x] Old routes bị xóa; không dual route/fallback.
- [x] Automated isolation, existing verify, Admin Web E2E và docs gate pass.
- [x] Canonical docs đóng `BE-PROJECT-SCOPE-01/02`.
- [ ] HG-01, HG-02 và HG-03 được user xác nhận.
- [x] Unit test check (Agent).
- [ ] Manual check (Người review).

## Điều kiện hoàn thành

Plan hoàn thành khi PSP-00 đến PSP-06 đều có `Kết quả thực hiện` hợp lệ, toàn bộ automated gate pass, old API contract không còn trong code/caller, Backend và Admin Web đã smoke test trên cùng release artifact, và user xác nhận HG-03.

## Câu hỏi review cần chốt

1. Chấp thuận `404` cho resource thuộc Project khác, `409` cho Project disabled và `422` khi body/query xung đột với path?
2. Chấp thuận cutover đồng bộ, không giữ endpoint cũ và không hỗ trợ zero-downtime giữa hai contract?
3. Chấp thuận bỏ count global `projects_enabled` khỏi Dashboard workspace response?
4. Chấp thuận FE không tự refetch sau mutation; chỉ patch item vừa xử lý và để nút Refresh chịu trách nhiệm reload toàn màn?
