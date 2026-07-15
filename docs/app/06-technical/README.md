# 06 - Technical

`06-technical/` mô tả cơ chế kỹ thuật dùng để hiện thực Architecture. File này giữ technical truth đã đối chiếu với code hiện tại. Giải thích generic về technical layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Layer model: `docs/guide/concepts/layer-model.md`
- Cách đọc theo task: `docs/guide/workflows/read-for-task.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#06-technical`
- Canonical map: `docs/guide/reference/canonical-map.md`
- Architecture source: `docs/app/05-architecture/README.md`
- Generic taxonomy source: `docs/guide/reference/entity-maps/06-technical.md` → `docs/guide/reference/entity-maps/packs/universal/06-technical/`

## Technical Truth Hiện Tại

Runtime và platform:

- Runtime là Node.js CommonJS.
- HTTP server dùng Express 5, JSON body limit lấy từ `HTTP_JSON_LIMIT`.
- Admin API dùng version prefix `/api/v1`.
- Health endpoint hiện có `/health` và `/api/v1/health`.
- Admin Web là Next.js trong `apps/admin-web`; browser chỉ gọi relative `/api/v1/*` và Next rewrite request server-side đến Express. Express không còn static mount hoặc route UI legacy.
- Persistence dùng SQLite qua `better-sqlite3`.
- Migration runner đọc SQL từ `src/db/migrations`, ghi checksum canonical LF vào `schema_migrations`, chấp nhận checksum legacy LF/CRLF và nâng ledger legacy về canonical khi chạy lại.

Runtime config:

- `DATABASE_PATH` mặc định `storage/db/cis.sqlite`.
- Worker config gồm `WORKER_ENABLED`, `WORKER_ID`, `WORKER_POLL_INTERVAL_MS`, `WORKER_LOCK_TIMEOUT_SECONDS`.
- Project credential có cột DB cho `backlog_api_key`, `jira_email`, `jira_api_token`.
- Các biến `*_env` còn phục vụ import/compat, command import là `npm run migrate:credentials-from-env`.

Translation AI config:

- Config canonical là `translation_ai_provider`, `translation_ai_transport`, `translation_ai_model`.
- Default hiện tại là `deepseek`, `openai_compatible`, `deepseek-v4-flash`.
- DeepSeek dùng `DEEPSEEK_API_KEY`, `DEEPSEEK_OPENAI_BASE_URL`, alias cũ `DEEPSEEK_BASE_URL`, `DEEPSEEK_ANTHROPIC_BASE_URL`, `DEEPSEEK_REQUEST_TIMEOUT_SECONDS`.
- Module Translation không gọi HTTP/process trực tiếp; transport thật nằm ở `src/infrastructure/ai`.
- `codex_exec` là process transport/legacy command, không phải provider chính của Translation.

Persistence/schema:

- Bảng lõi gồm `admin_users`, `projects`, `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs`, `translation_queue`, `translation_glossary_concepts`, `translation_glossary_terms`, `mapping_rules`, `anomaly_log`, `sync_jobs`, `sync_journal`, `pull_state`, `webhook_events`.
- `issues.fields_json` là field-level source tracking với các nhánh `backlog`, `cis`, `jira`.
- Nhánh `fields_json.<field>.cis` là canonical branch vận hành cho Issue Editor và Jira outbound.
- `webhook_events` đã có schema nhưng webhook route chưa là đường Lite chính.

API contract:

- Success detail trả envelope `{ "data": ... }`.
- Error response dùng `error.code`, `error.message`, `error.details`, `error.correlation_id`.
- Auth dùng Bearer JWT với `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Endpoint group hiện đang mount: dashboard, projects, issues/CIS, Backlog pull/attachments, sync jobs/journal, translation queue, mapping, anomaly, Jira dry-run/sync.
- CIS API có `POST /api/v1/issues` và `POST /api/v1/issues/:issueId/external-identities`.
- Candidate sync dùng `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis`; body `{ "with_translation": true }` giữ parent `manual_pull` payload, còn active translate job được guard atomically theo `translation_queue_id`. Parent/child trace dùng `requested_by`, `request_correlation_id` và `parent_sync_job_id`; SQLite busy/locked và Sync transient giữ `retryable` để parent retry.
- Pull mapping values của Backlog/Jira giữ contract text cũ (`issue_type`, `status`, `priority`, `user`, `component`, `user_labels`) và bổ sung sibling `*_directory` `{ id, value, name, email?, display_order? }`; Jira user tách `accountId` ở `id` khỏi email/text legacy ở `value`. Directory không được copy sang CIS mapping values. Mappings là touchpoint duy nhất gọi pull/refresh snapshot. Backlog API CIS có action-readiness, `filter-options` và candidate GET theo created range cùng Status/`not_closed`/người được gán tùy chọn; `filter-options` chỉ đọc `status_directory`/`user_directory` đã lưu trong cấu hình project, nên mở màn không gọi Backlog. Candidate chỉ chạy sau `Find issues` và dùng ID snapshot để query Backlog. Khi cùng có `status_id` và `not_closed`, module lấy giao hai tập Status. Tất cả route public đều scope theo project và browse path không ghi database. Chỉ `BacklogClient` gọi endpoint `/api/v2/*` của Backlog.
- Webhook endpoint không là contract Lite hiện tại khi code chưa mount.

Technical guardrail:

- Backlog manual/project pull đi qua job/audit path.
- Pull one issue được phép run ngay để Admin UI nhận kết quả.
- Candidate Sync to CIS chỉ enqueue khi project/manual-pull/sync/worker gate đều sẵn sàng và atomically reuse active manual-pull job theo project + canonical Backlog key.
- Candidate Sync + Translate chỉ tạo queue current-source `summary`/`description`; worker `manual_pull` enqueue child `translate`, không gọi AI trong HTTP. Worker và các manual Translation entry point dùng cùng active-job gate theo `translation_queue_id`.

### Translation Glossary

- Migration `015_translation_glossary_tables.sql` tạo hai bảng normalized, backfill `projects.translation_glossary_json` theo Project rồi loại bỏ cột legacy; migration `016_translation_glossary_term_variants.sql` rebuild terms atomic để thêm generated `term_match_key` và `is_canonical`.
- `translation_glossary_concepts` có unique `(project_id, group_key, concept_key)`; `translation_glossary_terms` cho phép variants với unique `(glossary_concept_id, language_code, term_match_key)`, partial unique canonical/language, collision trigger theo Project/language và cascade theo concept.
- API project-scoped: `GET/POST /api/v1/projects/:projectId/translation-glossary`, `PATCH/DELETE /api/v1/projects/:projectId/translation-glossary/concepts/:conceptId`; POST/PATCH nhận full aggregate, language lowercase, mỗi language đúng một canonical, normalized duplicate là `422`, race conflict là `409`; `term_match_key` chỉ là field nội bộ.
- Runtime chỉ materialize concept đủ source/target pair tại execution time; preprocessing quét `source_text`, chọn span không chồng lấn trên source variants, chỉ đưa target canonical xuất hiện vào context và giới hạn 40 entry; không có JSON fallback hoặc dual-write.
- Manual create/link dùng `BEGIN IMMEDIATE` và ghi owner state + journal bằng cùng SQLite connection.
- Jira outbound phải đi qua dry-run trước sync thật.
- Sync thật bị chặn bởi missing mapping, blocking anomaly, Jira config lỗi, sync state không hợp lệ và dry-run stale.
- Attachment download failure không block issue ingest/sync issue v1, nhưng có status lỗi và retry riêng.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#06-technical`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ technical mechanism và guardrail hiện đang áp dụng.

Chỉ mục nhanh:

- `01-platforms/`
- `02-interfaces/`
- `03-state-and-storage/`
- `04-exchange/`
- `05-security/`
- `06-processing/`
- `07-configuration/`
- `08-performance/`

## Theory Routing

- `TH-MODULAR`: technical boundary hỗ trợ module ownership.
- `TH-AI-GOV`: boundary giữa AI transport và AI business capability.
- `TH-SYNC-SAFE`: technical support của dry-run, readiness và outbound gate.
- `TH-OPS-TRACE`: job, journal, retry, audit và observability mechanism.

## Rule Riêng Hiện Tại

- Technical mechanism phải phục vụ Product/Architecture đã chốt, không tự tạo behavior mới.
- Credential thật, API key, JWT secret và internal path riêng máy không được commit.
- Translation module không tự gọi `fetch`, `child_process`, `spawn`, `spawnSync`.
- Code/UI mới dùng `translation_ai_*`, không dùng `translation_provider`/`translation_model` làm config canonical.
- Source organization và code-level contract thuộc `07-implementation/`.
