# 07 - Implementation

`07-implementation/` mô tả cách Architecture và Technical Design được hiện thực thành source code. File này giữ implementation truth hiện tại. Guide chỉ giữ concern folder universal ở `docs/guide/reference/folder-structure.md`; không giữ taxonomy/entity type cho layer này.

## Nguồn hướng dẫn

- Cách đọc theo task: `docs/guide/workflows/read-for-task.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#07-implementation`
- Architecture boundaries: `docs/app/05-architecture/02-boundaries/README.md`
- Module structure: `docs/app/05-architecture/01-structure/README.md`

## Implementation Truth Hiện Tại

Source organization:

- Entry app nằm ở `src/app.js`.
- Server start nằm ở `src/server.js`.
- Admin Web source nằm ở `apps/admin-web`; `server.js` dùng Node HTTP chuẩn để phục vụ document/assets và proxy API, `views/layout.js` render shell Tabler, `public/shared.js` giữ auth/workspace/API primitives và `public/pages/*.js` giữ controller theo màn. `scripts/admin-dev.js` và `npm run admin:start -- --port <port>` chạy cùng MPA server; Express không còn source UI/static server.
- Config loader nằm ở `src/config/env.js`.
- Pino logger, AsyncLocalStorage trace context và external lifecycle nằm ở `src/infrastructure/observability`; request middleware nằm ở `src/http/middleware/requestObservability.js`.
- Database connection/migration nằm ở `src/infrastructure/database`.
- SQL migrations nằm ở `src/db/migrations`.
- Module app nằm dưới `src/modules/<ModuleName>`.
- Module hiện có: `Auth`, `Projects`, `Cis`, `Backlog`, `Translation`, `Mapping`, `Anomaly`, `Sync`, `Jira`, `Dashboard`.

Module implementation pattern:

- Mỗi module expose public surface qua `<ModuleName>Api.js` khi module khác cần gọi.
- HTTP route/controller là adapter vào module, không chứa business flow dài.
- Cross-module call dùng public API của module khác.
- Ví dụ hợp lệ: Backlog gọi `CisApi`/`SyncApi`, Jira gọi `CisApi`/`MappingApi`/`AnomalyApi`/`SyncApi`.
- Import sâu vào internals module khác bị cấm theo boundary docs.

Implementation flow theo code hiện tại:

- Backlog inbound: Backlog pull tạo/execute `manual_pull` job, normalize payload, upsert vào CIS, tải attachment theo policy và ghi journal.
- Backlog candidate `Sync to CIS + Translate` ghi `with_translation` vào parent payload; `handleManualPullJob` gọi capability public `TranslationApi.enqueueIssueTranslations`, tạo/reuse current-source queue và child `translate` jobs. `SyncApi.enqueueTranslateJobIfNoneActive` là atomic gate theo `translation_queue_id`.
- Backlog/Jira client pull mapping values trả text legacy cho Mapping và directory `{ id, value, name }` cho toàn bộ catalog `issue_type`, `status`, `priority`, `user`, `component`; Jira user giữ `accountId` riêng với email/text legacy. Application pull replace directory snapshot nhưng giữ behavior text cũ; Jira sanitizer lọc user directory bằng cùng policy lọc user text. Mappings là UI duy nhất gọi Pull fields. Backlog candidate browse dùng `BacklogApi.listIssueCandidates`, batch read qua `CisApi`, không persist và chỉ chạy sau submit form. `BacklogApi.listIssueCandidateFilterOptions` chỉ đọc snapshot `status_directory`/`user_directory` khi UI mở. Browse dùng ID snapshot để query Backlog; `not_closed` resolve Status ID trừ `Closed`/`Close` rồi intersect với Status do Admin chọn nếu có. Directory không phải mapping business và không được copy sang CIS mapping values. Per-row action dùng `SyncApi.enqueueManualPullIfNoneActive` rồi worker chạy shared handler.
- CIS manual create và external identity link là owner actions; Backlog/Jira chỉ expose public remote lookup trả canonical provider key/project identity.
- Translation: Issue Editor luôn dựng read-model card Summary/Description, dùng placeholder không persistence khi chưa có queue item và không còn nút bulk `Translate issue`. Retranslate card đã có item chạy AI đồng bộ qua item route, không tạo sync job; placeholder gọi issue translation route với `target_field`, tạo đúng một `manual_immediate` translate job rồi chạy ngay khi lock được. Cả hai chỉ cập nhật `ai_draft` và không apply canonical. Chỉ action `Approve` riêng mới apply draft vào canonical; `PUT /translation-queue/:id/draft` vẫn chỉ lưu draft.
- Mapping/anomaly: Jira dry-run dùng approved mapping qua CIS và tạo/đọc anomaly để quyết định `can_sync`.
- Jira outbound: dry-run chạy qua API và ghi journal; sync thật enqueue `push_issue`, worker gọi Jira client khi gate pass.
- External provider gateway: application chỉ cấp `projectId`; worker mint một scope Project ở đầu handler và dùng lại cho Backlog/Jira. `external/core` giữ scope/policy, `external/providers` giữ provider operation/auth/error mapping và `external/transports` giữ HTTP/protocol mechanics. Fake/fixture cũng chạy capability guard trước adapter. Lỗi gate là non-retryable `EXTERNAL_GATE_BLOCKED`; `job_failed.details_json` giữ evidence đã sanitize và Sync Job read model expose `last_error_code`/`last_error_details` sau reload.
- Observability: Express phát request lifecycle theo từng record; enqueue ghi trace vào SQLite, worker phục hồi context từ job; shared HTTP transport phát request/response/error vào file provider tương ứng. Admin Web proxy chuyển tiếp `x-correlation-id`, ghi proxy metadata và trả correlation trong `API_PROXY_ERROR`.

Issue Editor contract:

- Canonical `story_point` dùng effective default `1`, cho phép sửa dạng số không âm và được đưa vào dry-run/hash. Jira adapter chỉ map đúng site/project/issue type đã xác minh là `10kn-developer.atlassian.net / WEC1 / Task` sang `customfield_10038`; project khác không nhận custom field ID này.
- Nợ kỹ thuật đã ghi nhận: Story Point phải chuyển thành Project custom field, được discover bởi Pull Jira fields và map tại Mappings; xem [khoản nợ Story Point Project Custom Field](../08-quality/07-maintainability/story-point-project-custom-field-debt.md). Chưa triển khai target này.

- Source branch `backlog` và `jira` không bị ghi đè bởi manual edit.
- Translation modal chỉ dùng target `summary` và `description`.
- Translation source lấy từ `fields_json.<field>.backlog`.
- Translation Glossary do `src/modules/Translation` sở hữu: `TranslationGlossaryRepository`, các application CRUD, controller/routes và `collectTranslationContext` runtime lookup; Projects chỉ giữ identity/language config và từ chối field legacy.
- Migration `src/db/migrations/015_translation_glossary_tables.sql` backfill atomic rồi drop JSON column; `016_translation_glossary_term_variants.sql` rebuild terms cho variants/canonical; verifier gồm migration, API, runtime và Admin UI acceptance.
- Save Draft không đổi `fields_json`; Approve translation mới apply `ai_draft` vào `fields_json.<target_field>.cis`.
- Jira sync modal chạy dry-run, cho sửa payload target, sync bằng payload đã chỉnh và lưu draft Jira field branch.

Implementation verification hiện có:

- `npm run verify:phase00` đến `npm run verify:phase07` map với các phase Lite đã triển khai.
- `npm run verify:issue-editor` gom verify API và dry-run/sync của Issue Editor.
- `npm run verify:system-issues` kiểm tra candidate browse/readiness, manual create, identity scope và candidate sync.
- `npm run verify:project-scope` chạy static cutover gate rồi kiểm tra middleware, cross-project resource isolation, Dashboard A/B, Project disabled và legacy 404.
- `npm run verify:external-provider-gateways` kiểm tra capability, scope authenticity/cross-project, fake guard, enqueue/worker/reload evidence và operation contract; `npm run verify:external-http-transport` kiểm tra HTTP status/text/binary/timeout; `npm run verify:external-egress-boundary` cấm network primitive trong `src/modules/**`.
- `npm run verify:observability` kiểm tra progressive HTTP events, response body, durable job trace, provider file routing, request/response pairing, binary omission và redaction canary.
- `npm test` chạy toàn bộ verify phase00-07.
- Khi sửa Translation AI, kiểm tra module Translation không tự gọi `fetch`, `child_process`, `spawn`, `spawnSync`.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#07-implementation`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ implementation truth và code-level guardrail hiện tại.

Chỉ mục nhanh:

- `01-organization/`
- `02-contracts/`
- `03-behavior/`
- `04-data-handling/`
- `05-external-boundaries/`
- `06-evolution/`
- `07-automation/`
- `08-coding-rules/`

## Theory Routing

- `TH-MODULAR`: public API, module boundary, cross-module dependency và data-access ownership.
- `TH-AI-GOV`: AI coding/translation adapter boundary.
- `TH-SYNC-SAFE`: implementation của dry-run, readiness gate và stale preview.
- `TH-OPS-TRACE`: implementation của job, journal, retry, audit.

## Rule Riêng Hiện Tại

- Module khác chỉ dùng public surface đã cho phép.
- Controller/route không chứa business flow dài.
- Source code detail dài không copy vào docs; docs chỉ giữ contract/rule có giá trị lâu dài.
- Khi sửa `src/modules`, đọc lại `docs/app/05-architecture/01-structure/README.md` và `docs/app/05-architecture/02-boundaries/README.md`.
