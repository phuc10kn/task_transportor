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
- Persistence dùng SQLite qua `better-sqlite3`.
- Migration runner đọc SQL từ `src/db/migrations` và ghi lịch sử vào `schema_migrations`.

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

- Bảng lõi gồm `admin_users`, `projects`, `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs`, `translation_queue`, `mapping_rules`, `anomaly_log`, `sync_jobs`, `sync_journal`, `pull_state`, `webhook_events`.
- `issues.fields_json` là field-level source tracking với các nhánh `backlog`, `cis`, `jira`.
- Nhánh `fields_json.<field>.cis` là canonical branch vận hành cho Issue Editor và Jira outbound.
- `webhook_events` đã có schema nhưng webhook route chưa là đường Lite chính.

API contract:

- Success detail trả envelope `{ "data": ... }`.
- Error response dùng `error.code`, `error.message`, `error.details`, `error.correlation_id`.
- Auth dùng Bearer JWT với `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Endpoint group hiện đang mount: dashboard, projects, issues/CIS, Backlog pull/attachments, sync jobs/journal, translation queue, mapping, anomaly, Jira dry-run/sync.
- Webhook endpoint không là contract Lite hiện tại khi code chưa mount.

Technical guardrail:

- Backlog manual/project pull đi qua job/audit path.
- Pull one issue được phép run ngay để Admin UI nhận kết quả.
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
