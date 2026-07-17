# 08 - Quality

`08-quality/` mô tả cách project xác định, kiểm tra và duy trì chất lượng sản phẩm. File này giữ acceptance Lite, verification command và release gate hiện tại. Giải thích generic về quality layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Validation/lifecycle: `docs/guide/concepts/validation-and-lifecycle.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#08-quality`
- Status và note: `docs/guide/reference/status-and-notes.md`
- Product scope: `docs/app/02-product/README.md`
- Generic taxonomy source: `docs/guide/reference/entity-maps/08-quality.md` → `docs/guide/reference/entity-maps/packs/universal/08-quality/`

## Acceptance Lite Hiện Tại

Lite được coi là đạt ở mức product khi:

- Backlog manual pull tạo inbound job `backlog -> cis`.
- Issue Editor resync áp dụng lại approved Backlog→CIS mappings cho canonical Issue type, Priority, Status và Assignee; source payload không đổi không tạo revision giả. UI refresh đúng bốn field tại chỗ và giữ nguyên Summary/Description chưa lưu.
- Candidate `Sync to CIS`/`Sync to CIS + Translate` trả `202` sau local gate + enqueue, còn provider/project verification chạy trong worker. Candidate browse overlay pending/running parent job để reload khóa đúng row và resume polling mà không enqueue lại; đúng queue `summary`/`description`, child `translate` jobs bất đồng bộ và parent/child journal trace được giữ; retry/re-click không tạo active job trùng.
- Candidate `Sync + Translate + Jira` auto-approves chỉ khi operator chọn action explicit; request tạo/promote job `sync_translate_jira` và không tạo child queue. Một translation item hoặc dry-run fail phải rollback draft/canonical/approval của toàn batch và chặn Jira; job chỉ success sau direct Jira delivery, còn reload giữa workflow vẫn overlay đúng row.
- Manual project pull trả `409 BACKLOG_PROJECT_PULL_DISABLED`; scheduled scan trả disabled, không query Backlog, không enqueue job và không cập nhật pull state.
- Pull mapping values giữ các mảng text legacy cho Mapping/dry-run và đồng thời materialize directory provider ID cho toàn catalog; Jira user directory giữ được `accountId` nhưng CIS mapping vẫn chỉ nhận text. Candidate browse chỉ chạy sau action Admin; `filter-options` chỉ đọc Status/người được gán snapshot đã lưu trong project config, còn browse dùng ID snapshot để query Backlog theo created range cùng Status/Not closed/người được gán tùy chọn. Luồng không tạo database write, loại Backlog key đã thuộc CIS cùng project và over-fetch tới limit/source bound.
- Manual CIS issue có revision đầu tiên + journal; external identity verify tồn tại/project và duplicate theo `project_id + đúng system column`.
- CIS lưu raw/source snapshot, canonical issue, comments, attachments metadata, job và journal.
- Translation option tạo draft Nhật -> Việt; AI/operator cùng chỉnh một draft, Save Draft không đổi canonical, Approve mới apply, và vẫn có reject/retranslate.
- Translation Glossary kiểm tra migration fresh/upgrade/atomic failure, CRUD/error contract, runtime source variants/target canonical, non-overlap preprocessing (chỉ term xuất hiện trong source text, tối đa 40 entry) và Admin UI lazy-load/filter/modal/error/retry/delete/variant.
- Mapping required có approve path.
- Dry-run Jira trả payload, validation, warning và `can_sync`.
- Sync thật không gọi Jira nếu pre-check fail.
- Sync thật create/update Jira khi pre-check pass.
- Backlog/Jira egress phải khớp named operation + capability Project; gate off tại action không enqueue, gate off trước worker tạo terminal `failed` non-retryable với `EXTERNAL_GATE_BLOCKED` và phục hồi được code/evidence sau reload. Fake/fixture tuân cùng gate và verify không gọi provider thật.
- Attachment download failure không block issue ingest/sync, nhưng hiển thị trạng thái lỗi và có retry riêng.
- Job lỗi retry theo policy, hết retry chuyển `failed`, admin retry được.
- Dashboard/Admin UI hiển thị pending review, missing mapping, failed job và open anomaly.
- Workspace sau chọn Project chỉ hiển thị/cho thao tác dữ liệu Project đó; Backend enforce Project path + owner lookup, không fallback hoặc tiết lộ resource Project khác. Dashboard dùng cùng scope; Project `enabled=false` chặn toàn bộ workspace read/mutation.

Quality objectives Lite hiện tại:

- Correctness: dữ liệu đi đúng `Backlog -> CIS -> Jira`, không đi tắt Backlog -> Jira.
- Safety: sync thật không chạy nếu missing mapping, blocking anomaly, Jira config lỗi, sync state chưa hợp lệ, dry-run stale.
- Traceability: sync job, sync journal, anomaly và audit phải đủ để giải thích kết quả.
- Recoverability: failed job, attachment failure và stale preview có đường xử lý rõ.
- Operator clarity: Dashboard/Admin UI hiển thị pending review, missing mapping, failed job và open anomaly.
- Data separation: source snapshot, canonical CIS data và target preview không bị trộn.
- Quality evidence hiện tại bao phủ happy path, blocked sync, retry flow, operator visibility và tách state business khỏi mechanism kỹ thuật.

Verification command:

- `npm run verify:phase00`: foundation.
- `npm run verify:phase01`: auth và projects.
- `npm run verify:phase02`: CIS và sync jobs.
- `npm run verify:phase03`: Backlog ingestion.
- `npm run verify:phase04`: translation review.
- `npm run verify:phase05`: mapping, anomaly và dry-run.
- `npm run verify:phase06`: Jira outbound.
- `npm run verify:external-provider-gateways`: contract/gate/worker evidence local.
- `npm run verify:external-egress-boundary`: static guard chống module tự gọi network.
- `npm run verify:phase07`: Admin UI acceptance.
- `npm run admin:ci`: kiểm tra cú pháp JavaScript, asset/route foundation và chặn dependency Next/React/TypeScript/Tailwind trong Admin Web.
- `npm run verify:admin-ui-e2e`: Playwright behavior của Tabler MPA; kiểm tra login/Project gate, URL document route, Backlog job, Issue Editor/Jira gate, Translation Queue và Glossary.
- `npm run verify:issue-editor`: Issue Editor API và dry-run/sync.
- `npm run verify:system-issues`: Backlog Issues, manual CIS issue và external identity linking.
- `npm run verify:translation-review`: Translation queue, worker gate, direct manual entry point và human review.
- `npm test`: toàn bộ phase00-07.

Manual acceptance Lite còn sống:

- Admin login được.
- Admin trigger `Pull one issue` và resync issue từ Backlog.
- Issue Editor hiển thị canonical CIS, source Backlog/CIS/Jira và trạng thái issue.
- Translation modal translate/retranslate, Markdown Edit/Preview, Save Draft, Approve riêng và reject được; hai màn CIS Issue/Translation Queue cùng đọc `ai_draft`.
- Checklist glossary: Project-scoped CRUD, mỗi language đúng một canonical và không normalized duplicate, concept thiếu pair không vào runtime context, không còn legacy Project JSON và Translation Queue vẫn pass.
- Jira sync modal tự chạy dry-run, hiển thị `can_sync`, warning và payload preview.
- Sync Jira thật chỉ chạy sau khi dry-run hợp lệ.
- Dashboard active Project hiển thị pending review, missing mapping, failed job và open anomaly; metric/alert link giữ Project context, có loading/empty/error/retry và không fetch khi chưa chọn Project.
- Tabler MPA là Admin UI duy nhất; source/dependency Next/React/Vue và endpoint static UI cũ không được tồn tại hoặc có fallback/dual UI.
- SQLite backup được chạy theo operation runbook trước khi coi demo/release an toàn.
- Issue Editor gate: dry-run dùng canonical effective values mới nhất; stale queue item vẫn giữ draft để đối chiếu nhưng Approve bị khóa tới khi Save Draft theo source hiện tại hoặc retranslate; attachment warning chưa là gate v1; manual acceptance ưu tiên `Pull one issue` và `Resync from Backlog`.
- Story Point gate: issue cũ/mới có effective default `1`; patch sai kiểu hoặc âm bị từ chối; WEC1 Task dry-run, operator override và worker payload đều giữ đúng giá trị tại `customfield_10038`.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#08-quality`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ acceptance, verification command và gate hiện tại của Lite.

Chỉ mục nhanh:

- `01-objectives/`
- `02-verification/`
- `03-validation/`
- `04-assurance/`
- `05-risks/`
- `06-defects/`
- `07-maintainability/`
- `08-release-readiness/`

## Theory Routing

- `TH-SYNC-SAFE`: safety gate, dry-run, readiness và stale preview.
- `TH-OPS-TRACE`: retry, audit, recoverability và operational explainability.
- `TH-AI-GOV`: human review, AI draft và accountability.

## Rule Riêng Hiện Tại

- Quality gate phải bám `02-product/README.md` và decision còn hiệu lực trong `10-decisions/`.
- Acceptance Lite không được dùng để mở scope Medium/Full khi chưa có decision mới.
- Checklist `Unit test check (Agent)` chỉ tick khi lệnh/test tự động pass thật.
- Checklist `Manual check (Người review)` chỉ tick khi user xác nhận manual pass.
- Nếu một item chưa thể tick, để nguyên chưa tick và ghi lý do.
