# Overview — Migrate Admin UI sang Next.js

## Mục tiêu nghiệp vụ

Admin/operator cần một Operations Console có URL ổn định, phân tách màn rõ, phản hồi trạng thái đầy đủ và không làm mất các guardrail đang hoạt động của luồng `System -> CIS -> System`.

Migration này thay lớp giao diện, không sửa sản phẩm phía sau giao diện. Express và các module hiện tại tiếp tục sở hữu API, persistence, business rule, job execution, mapping, translation review, anomaly và Jira outbound.

## In scope

- Next.js App Router app tại `apps/admin-web`.
- TypeScript, Tailwind CSS, ESLint và Playwright.
- Route shell, Bearer auth guard và toàn bộ màn Lite active.
- Same-origin rewrite `/api/v1/*` sang Express API origin.
- Shared API client, UI primitives và feature-local state/types.
- Loading, empty, error/retry, success, disabled và conflict feedback.
- Responsive, keyboard/focus, reduced-motion và automated accessibility.
- Human Review Gate theo các bundle vận hành được.
- Xóa hoàn toàn legacy UI sau release-candidate acceptance.
- Atomic cutover service UI trên port hiện tại.
- NextAdmin-adapted shell và shared primitives theo fast-track MUI-11N, chỉ vendor phần UI cần thiết.

## Out of scope

- Tạo hoặc sửa database schema phục vụ business data.
- Thêm table/column cho Backlog mapping snapshot, timestamp, fingerprint hoặc version.
- Đổi Project public DTO/credential semantics trong migration này.
- Đổi Sync Job persisted state, relation model, polling metadata hoặc retry/cancel business rule.
- Thêm backend stale-source transaction contract cho Translation.
- Thêm Jira dry-run identity, canonical/target hash hoặc latest-attempt contract mới.
- Sửa Mapping/Assignee business contract đang tồn tại.
- Đổi Bearer JWT/localStorage sang cookie/BFF/RBAC mới.
- Nginx/firewall/API-port hardening, webhook capability hoặc Medium/Full scope.
- Figma, visual clone 1:1, component framework hoặc global state/data-fetching library.

NextAdmin là ngoại lệ có chủ ý cho dòng “component framework”: repo chỉ dùng source component Free đã chọn lọc như visual foundation, không cài nguyên template/framework runtime và không nhận auth, ORM, database hoặc data layer của nó.

Các mục trên có thể là technical debt hoặc improvement hợp lệ, nhưng phải có plan riêng. Chúng không được dùng làm dependency ngầm của UI migration.

## Quyết định đã khóa

### Ranh giới migration

- Next.js chỉ gọi public Express API hiện tại.
- Không sửa `src/modules/**`, `src/db/migrations/**` hoặc state constants để làm đẹp contract cho frontend.
- MUI-16A là phase UI-only, không có ngoại lệ sửa backend. Dashboard/project isolation chưa được API hiện tại hỗ trợ đầy đủ là `BE-PROJECT-SCOPE-01/02`; Dashboard UI bị disabled và không fetch, Project `enabled=false` không thể mở workspace. Hai debt là accepted gap qua MUI-17 và phase BE sau mới đóng.
- MUI-00 khóa API/behavior matrix từ active UI. Phase UI triển khai theo matrix đó.
- Nếu active behavior không thể làm bằng API hiện tại, phase dừng, ghi blocker trong `02-coordination.md` và đề xuất plan backend riêng. Không tự mở rộng phase UI.
- Dead function hoặc capability không reachable từ legacy navigation không được kéo vào scope.

### NextAdmin fast-track

- Phase thực thi: [MUI-11N — NextAdmin fast-track](01-phases/MUI-11N-nextadmin-fast-track.md), chạy sau MUI-11 và trước MUI-12.
- Giữ Next.js App Router, React, Tailwind, `AuthGuard`, JWT/localStorage, `apiFetch`, route registry và Express API hiện tại.
- NextAdmin Free `1.3.x` chỉ là nguồn shell/component; dependency được xét theo component, không clone dashboard demo.
- Translation Glossary là pilot để khóa table, language grouping và dialog trước khi chuyển các route còn lại.
- HG-03 và HG-04 chỉ review lại sau khi toàn bộ five-wave fast-track pass automated acceptance.

### Framework và package boundary

- Frontend nằm trong `apps/admin-web` với package/lockfile riêng.
- Root package tiếp tục CommonJS/Express; root scripts gọi frontend qua `npm --prefix apps/admin-web`.
- Dùng Next.js App Router + TypeScript + Tailwind CSS + ESLint.
- MUI-00 preflight pin: `next@16.2.10`, `react@19.2.7`, `react-dom@19.2.7`; Next yêu cầu Node `>=20.9.0`. Workspace hiện tại là Node `v24.14.1`/npm `11.11.0`; package manager dùng npm `>=10`.
- `apps/admin-web/package.json` phải có `overrides.postcss = "8.5.10"`: audit mặc định của Next pin phát hiện 2 moderate PostCSS advisories, còn audit với override này trả 0 vulnerability. Cấm canary và version thuộc security advisory affected range.
- Không dùng static export. Production chạy `next start` trên port `8001`.

### Runtime preflight snapshot (MUI-00)

| Concern | Current evidence | Migration constraint |
| --- | --- | --- |
| API | Express `npm start`, local `PORT=3000` trong `.env`; production runbook profile có thể dùng API `3001` | Next chỉ gọi public Express API; không đổi API port trong UI phase |
| Next UI | `apps/admin-web`, local dev/start cố định `3001` | Local URL `http://127.0.0.1:3001/login`; E2E dùng port riêng để tránh xung đột |
| Legacy UI | `scripts/serve-admin-ui.js`, static `/admin`, local `FE_PORT/ADMIN_UI_PORT` mặc định `8000` | Giữ tới sau HG-07; MUI-17 mới cutover Next production |
| API origin config | Legacy dùng `CIS_ADMIN_API_BASE_URL`/port inference; chưa có `CIS_API_ORIGIN` | MUI-01 thêm server-only `CIS_API_ORIGIN`, không đưa origin vào browser bundle |
| Auth | `localStorage["cis_admin_token"]`, Bearer, `{data}`/`{error}` envelope | Giữ nguyên trong MUI-02 |
| Source baseline | `npm test` pass toàn bộ phase00–07, docs, architecture và workbench gates | Không sửa baseline assertion để hợp thức hóa UI mới |

### API và auth

- Browser chỉ gọi relative `/api/v1/*`; `next.config.ts` rewrite tới server-only `CIS_API_ORIGIN`.
- Giữ `localStorage["cis_admin_token"]`, Bearer header, success envelope `{ data }` và error envelope `{ error }` hiện tại.
- Protected business data được tải client-side; Next layout chỉ sở hữu shell/routing.
- API client chuẩn hóa timeout/abort/error ở mức transport, nhưng không phát minh business status hoặc đổi request/response contract.
- Credential behavior của Project API được giữ như hiện tại. Write-only/redacted DTO là security hardening riêng.

### Backlog mapping/filter contract

- Status và Assignee tiếp tục được đọc từ response `filter-options`, do backend lấy từ `backlog_mapping_values_json.status_directory` và `user_directory` hiện tại.
- Không thêm `_snapshot`, snapshot table, `schema_version`, `source_fingerprint`, TTL hoặc freshness state mới.
- Khi options trống/không tải được, UI giải thích và dẫn tới `/mappings?project_id=...` để operator chạy `Pull Backlog fields`.
- Chỉ `Find issues` gọi candidate browse. Mount, đổi filter, Back/Forward hoặc Pull project không tự browse candidate.
- `Not closed` và selected Status dùng đúng request semantics hiện tại; empty Status/Assignee bị omit.
- Pull project dùng persisted Project pull settings của backend. Created/Status/Assignee trên candidate form không được gửi như Pull project scope.
- MUI-16A supersede Project initial state: không tự chọn Project đầu tiên; operator chọn/tạo tại `Projects`. `created_from`/`created_to` vẫn mặc định ngày hiện tại và Pull-one key vẫn mặc định `<backlog_issue_key_prefix>-1`.
- Readiness binding là cố định: Find dùng `actions.browse`; Pull one dùng `actions.pull_one`; Pull project dùng `actions.pull_project`; cả hai candidate actions dùng `actions.sync_to_cis`.

### Async/action contract

- HTTP status không tự chứng minh business completion. HTTP 200 dùng explicit outcome/body; HTTP 202 xác nhận request đã được nhận nhưng UI vẫn phải đọc body: explicit terminal job status được hiển thị đúng terminal, non-terminal job có ID mới được poll, aggregate response giữ `enqueued`/`jobs[]` evidence.
- UI theo dõi non-terminal job bằng dữ liệu endpoint hiện có và giữ job id/status/error khi terminal, timeout hoặc failure.
- Không thêm server `terminal`, `allowed_actions`, `batch_id`, parent-child discovery hoặc state-machine metadata mới trong plan này.
- Nơi API hiện tại không có aggregate project-pull job, UI chỉ hiển thị response/evidence thực có; không giả completion hoặc aggregate relation.
- Khi một candidate có parent job active, khóa cả hai action của candidate đó nhưng không khóa candidate khác.
- Với `Sync to CIS + Translate`, parent `manual_pull` terminal success chỉ xác nhận ingest CIS; child `translate` vẫn bất đồng bộ. UI hướng operator tới Translation Queue, không suy draft đã tồn tại và không đọc số child job từ parent result.
- `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION` phải giữ job ID/status, poll parent hiện tại và hướng operator dùng Issue Editor > Translate sau parent success; không tuyên bố translation đã queue.

### Translation và Jira

- Translation UI dùng queue/item/action contract hiện tại, giữ AI draft và human review authority.
- Issue Editor dùng decorated translation evidence hiện có. Item stale phải hiển thị lý do, không prefill `ai_draft`/`reviewed_text` và khóa `Approve + save` tới khi retranslate tạo current-source item.
- Translation Queue chỉ hiển thị raw queue evidence API list/show hiện trả; không suy `is_source_stale` cho queue row/comment khi endpoint không cung cấp.
- Jira UI dùng dry-run/sync contract hiện tại: render `can_sync`, validation errors, warnings và payload preview; không thêm dry-run identity/hash contract mới.
- Dry-run response hiện có `stale=false` nhưng không có `stale_reason`. Nếu Sync trả `DRY_RUN_STALE`, Jira modal phải giữ nguyên context, hiển thị error message/details làm stale reason, chuyển local modal state sang stale và khóa Sync tới khi `Dry-run again` thành công; `can_sync=false` vẫn khóa Sync.
- Unsaved canonical vẫn chặn downstream action ở client như active Issue Editor hiện tại.

### UI state

- Active Project workspace của MUI-16A nằm trong `sessionStorage` và chỉ đổi bằng action explicit tại `Projects`; `project_id` trong URL chỉ mirror context, không phải nguồn đổi workspace. Filter còn lại có ý nghĩa deep-link được lưu trong URL.
- Project gate là render barrier: business page chỉ mount ở state `ready`; `unselected/resolving/invalid/disabled/unavailable` không được gửi business read/mutation. Chỉ URL list route có API Project filter mới mirror `project_id`; Dashboard/object detail không mirror.
- Issue identity nằm trong path `/cis-issues/[issueId]`.
- Candidate results, form drafts, modal state, dirty state và polling timer chỉ nằm trong client memory.
- Backlog candidate result gắn với submitted filter snapshot ở client; filter thay đổi thì xóa result và yêu cầu bấm `Find issues` lại.
- Navigation dùng Next `Link`/router; browser Back/Forward giữ route identity.
- MUI-03 sở hữu route registry/Global Refresh contract. Mỗi phase tạo top-level route phải đăng ký nav entry và route-specific refetch; phase bổ sung surface vào route có sẵn phải mở rộng refetch adapter tương ứng. Route không có nav owner hoặc Global Refresh handler là acceptance failure.

### Design direction

- **Modern Operations Console**: điềm tĩnh, chính xác, compact và data-dense.
- Neutral slate làm surface; xanh dương dịu là primary accent; warning/error/success chỉ dùng semantic color.
- Dùng Geist Sans cho nội dung và Geist Mono cho ID/code; hierarchy rõ, spacing 8 px, radius 8 px.
- Shared navigation, page header, filter bar, table, field, dialog, badge, toast và state panel.
- Signature differentiator là `System → CIS → System` status rail trong Issue Editor, chỉ diễn giải state API hiện có.
- Không gradient trang trí, glassmorphism, card lồng nhiều tầng hoặc khoảng trắng phóng đại.

### Phân loại parity và biến đổi có chủ ý

- `Preserve`: toàn bộ active screen, field, mutation, visible evidence và error/async semantics được materialize tại MUI-00 rồi giữ bằng Playwright/Human Gate. Không đổi request/response, persistence, business state hoặc authority của backend.
- `Intentional transform`: `state.view` và filter state trong memory đổi thành URL route/query phù hợp; browser prompt/confirm đổi thành controlled dialog nhưng giữ nguyên mutation; Find tuân `actions.browse` thay vì chỉ kiểm có Project; action async có job ID chuyển từ one-shot feedback sang giữ initial evidence rồi poll current job; `Dry-run again` xác nhận trước khi ghi đè Jira override; `Sync mapping fields` chuyển từ Project Config sang Mappings; Glossary list hiển thị full term text theo language với nhãn canonical; create Glossary mặc định theo source/target language của Project thay vì hard-code `ja`/`vi`.
- `Interface addition`: route deep-link/Back/Forward, data-state loading/empty/error/retry, responsive/accessibility, dirty-draft guard cho refresh/navigation/back/downstream action, `System → CIS → System` status rail, History hiển thị audit reason, Translation Queue filter/target/provider-error evidence, Anomaly filter/detail/Keep open và Attachment retry. Các phần này chỉ tăng khả năng quan sát hoặc an toàn thao tác, không tạo business capability/state mới.
- `Dead — exclude`: old `issueDetailHtml`/`bindIssueDetail`, Force approve không có reachable button/caller và attachment block nằm trong old issue detail không được coi là parity requirement.
- Mọi biến đổi khác ngoài danh sách đã khóa tại MUI-00 là blocker, không phải quyền tự quyết của executor.

Do đó mục tiêu parity là giữ nguyên kết quả nghiệp vụ và evidence của mọi control active, không phải clone DOM hoặc interaction primitive 1:1. MUI-00 phải chứng minh mỗi control active thuộc đúng một row trong ledger này trước khi code feature bắt đầu.

## Active UI parity matrix

MUI-00 đã khóa endpoint/method/request/visible-field/action theo binding active trong `public/admin/app.js` và route/controller hiện tại. `Preserve` giữ business behavior; `Intentional transform` chỉ đổi presentation/interaction đã nêu; `Interface addition` không thay business state; `Dead — exclude` không có caller/render path active.

| Route mới | Endpoint/action active hiện tại | Request/visible evidence phải giữ | Classification | Owner |
| --- | --- | --- | --- | --- |
| `/login` | `POST /api/v1/auth/login`; `GET /api/v1/auth/me` khi có token | Email/password, giữ email khi lỗi, Bearer token `localStorage["cis_admin_token"]`, protected redirect | Preserve; route/deep-link là Intentional transform | MUI-02 |
| `/dashboard` | `GET /api/v1/dashboard/summary`; `GET /api/v1/dashboard/alerts` | Sáu counters, health; Alerts: Type, Project, Issue, Status, Updated | Accepted MUI-16A transform: route/nav disabled và không gọi API tới khi phase BE thêm project scope; API contract không đổi | MUI-03/16A |
| `/projects` | `GET/POST /api/v1/projects`; `PATCH /api/v1/projects/:id` | List Name/Backlog/Jira/Sync; toàn bộ active fields, provider→transport→model, validation | Preserve; controlled edit dialog và explicit workspace selection là Intentional transform; edit/save không ngầm đổi active Project | MUI-04/16A |
| `/mappings` | `GET /api/v1/mapping-settings`; `GET/POST/PATCH /api/v1/mapping-rules`; `POST /api/v1/projects/:id/backlog/mapping-values/pull`; `POST /api/v1/projects/:id/jira/mapping-values/pull`; `POST /api/v1/projects/:id/cis/mapping-values/sync` | Hai chiều mapping, `required_for_jira`, Seen/issue count, row draft/save/approve; ba refresh action | Preserve; vị trí ba refresh action là Intentional transform | MUI-05 |
| `/backlog-issues` | `GET /api/v1/projects`; `GET /api/v1/projects/:id/backlog/issues/action-readiness`; `GET .../filter-options`; `GET .../candidates` sau Find; `POST .../backlog/pull`; `POST .../issues/:key/pull`; `POST .../issues/:key/sync-to-cis` | Project, Created from/to, limit, Status, Assignee, Not closed; candidate Backlog/Summary/Status/Assignee/Created/Updated; Pull one/project và hai Sync actions | Preserve; readiness guard, URL filter và explicit polling là Intentional transform | MUI-06/07 |
| `/cis-issues` | `GET /api/v1/issues?project_id=...`; `POST /api/v1/issues` | Active Project binding, manual create; Backlog, Project, Status, Summary, Review count, Anomaly count | Preserve; route là Intentional transform. MUI-16A bỏ selector/`All projects`, không đổi API | MUI-08/16A |
| `/cis-issues/[issueId]` | `GET /api/v1/issues/:id/editor`; `PATCH /api/v1/issues/:id`; history/worklogs/attachments; identity link; translation; Backlog pull; Jira dry-run/sync; attachment retry | Canonical 7 fields + assignee metadata; source comparison; identity/updated/worklog/hash/history; translation/recovery/Jira modal | Preserve; stale/dirty safety and added evidence là classified transforms/additions | MUI-08..12 |
| `/translation-queue` | `GET /api/v1/translation-queue[?project_id&issue_id&review_status]`; `GET /api/v1/translation-queue/:id`; approve/reject/retranslate/manual-edit mutations | ID, Issue, target context, Status, Source, AI Draft và Reviewed tách riêng, provider error, action outcomes | Preserve lifecycle; filter/detail/evidence là Interface addition | MUI-10 |
| `/translation-glossary` | `GET/POST/PATCH/DELETE /api/v1/projects/:id/translation-glossary/concepts...` | Project lazy-load, Group/search, full dynamic language terms with canonical labels; CRUD/conflict | Preserve CRUD/invariant; Project-language defaults là Intentional transform | MUI-11 |
| `/anomalies` | `GET /api/v1/anomalies[filters]`; `GET /api/v1/anomalies/:id`; POST resolve/ignore | ID, Issue, Type, Severity, Status, details, filters/detail, Resolve/Ignore/Keep open | Preserve mutations; filters/detail/Keep open là Interface addition | MUI-13 |
| `/sync-jobs` | `GET /api/v1/sync-jobs[?project_id]`; `POST /api/v1/sync-jobs/:id/retry|cancel` | Active Project binding; ID, Project, source/target issue, Type, Direction, Status, Created, Succeeded, Error, actions | Preserve; MUI-16A bỏ Project filter control nhưng giữ các filter nghiệp vụ khác, không đổi API | MUI-14/16A |
| `/journal` | `GET /api/v1/sync-journal[?project_id]` | Active Project binding; ID, Job, Project, source/target issue, Action, Status, Direction, Created, Succeeded, Message/Error; read-only | Preserve; MUI-16A bỏ Project filter control nhưng giữ các filter nghiệp vụ khác, không đổi API | MUI-14/16A |

Top-level controls ngoài bảng: `Refresh` phải refetch read adapter của route hiện tại; `Sign out` xóa token; sidebar chỉ hiển thị route đã triển khai. Không đưa `/api/v1/auth/logout`, force-approve, mark-duplicate hoặc old issue-detail function vào parity nếu legacy UI không gọi/render chúng.

## Target source structure

```text
apps/admin-web/
├── app/
│   ├── login/
│   └── (console)/
├── components/
│   ├── layout/
│   └── ui/
├── features/
├── lib/
├── e2e/
├── next.config.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

`features/` chia theo UI route/domain; không mirror backend modules và không chứa repository/database code.

## Route map canonical

| Route | Màn | Phase |
| --- | --- | --- |
| `/`, `/login` | Entry/login/protected redirect | MUI-02 |
| `/dashboard` | Console shell + operational Dashboard | MUI-03 |
| `/projects` | Project Config | MUI-04 |
| `/mappings` | Mappings | MUI-05 |
| `/backlog-issues` | Browse MUI-06; actions MUI-07 | MUI-06/MUI-07 |
| `/cis-issues`, `/cis-issues/[issueId]` | List/editor MUI-08; recovery MUI-09; translation MUI-10; Jira MUI-12 | MUI-08..MUI-12 |
| `/translation-queue` | Translation Queue | MUI-10 |
| `/translation-glossary` | Translation Glossary | MUI-11 |
| `/anomalies` | Anomalies | MUI-13 |
| `/sync-jobs`, `/journal` | Operations | MUI-14 |

## Test strategy

### Contract baseline

Verifier API hiện có tiếp tục bảo vệ backend behavior. Migration không sửa assertion để hợp thức hóa API contract mới vì plan không tạo contract mới.

### Browser acceptance

Playwright chạy Next app với Express test API/temp SQLite/fake external adapters hiện có. Happy path dùng API thật; interception chỉ ép loading/error/timing state khó tái lập.

Mỗi feature suite phải kiểm visible fields, action semantics và error preservation đã khóa ở MUI-00, không chỉ kiểm route render.

### Aggregate target

```text
npm run admin:e2e:install
npm test
npm run verify:docs
git diff --check
```

## Migration và cutover

1. MUI-00 khóa active behavior/API/runtime mà không sửa production source.
2. MUI-01 đến MUI-03 dựng Next foundation và mở HG-01.
3. MUI-04 đến MUI-14 chuyển từng bundle theo active parity matrix, dừng ở các Human Gate.
4. MUI-15 chạy full release-candidate acceptance khi legacy source vẫn còn nhưng không phải test target.
5. Sau HG-07, MUI-16 xóa legacy UI/static mount và cập nhật tracked docs/scripts.
6. MUI-16A khóa Project-first workspace ở UI bằng API hiện có; Dashboard/project isolation backend được ghi nợ cho phase BE sau và không nằm trong phase này.
7. MUI-17 deploy exact release SHA, đổi duy nhất service UI trên port `8001`, smoke Dashboard-disabled state và chờ HG-08; accepted gap `BE-PROJECT-SCOPE-01/02` còn open.
8. Phase BE sau MUI-17 đóng project-scoped Dashboard và server-side object isolation theo plan riêng.
9. Không chạy hai UI active sau cutover. Previous release chỉ là recovery artifact khi cutover fail, không phải compatibility UI.
