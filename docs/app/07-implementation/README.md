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
- Config loader nằm ở `src/config/env.js`.
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
- Translation: Issue Editor có route dịch trực tiếp cho summary/description, vẫn lưu `translation_queue`; approve + save apply reviewed text vào canonical CIS branch.
- Mapping/anomaly: Jira dry-run dùng approved mapping qua CIS và tạo/đọc anomaly để quyết định `can_sync`.
- Jira outbound: dry-run chạy qua API và ghi journal; sync thật enqueue `push_issue`, worker gọi Jira client khi gate pass.

Issue Editor contract:

- Source branch `backlog` và `jira` không bị ghi đè bởi manual edit.
- Translation modal chỉ dùng target `summary` và `description`.
- Translation source lấy từ `fields_json.<field>.backlog`.
- `Approve + save` translation apply reviewed text vào `fields_json.<target_field>.cis`.
- Jira sync modal chạy dry-run, cho sửa payload target, sync bằng payload đã chỉnh và lưu draft Jira field branch.

Implementation verification hiện có:

- `npm run verify:phase00` đến `npm run verify:phase07` map với các phase Lite đã triển khai.
- `npm run verify:issue-editor` gom verify API và dry-run/sync của Issue Editor.
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
