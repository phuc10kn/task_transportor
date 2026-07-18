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
- Admin Web là Node.js CommonJS client-rendered MPA trong `apps/admin-web`. Server UI chỉ trả route document, asset Tabler local và proxy relative `/api/v1/*` tới Express; browser giữ Bearer JWT và gọi API qua same-origin proxy. Express không còn static mount hoặc route UI legacy.
- Persistence dùng SQLite qua `better-sqlite3`.
- Migration runner đọc SQL từ `src/db/migrations`, ghi checksum canonical LF vào `schema_migrations`, chấp nhận checksum legacy LF/CRLF và nâng ledger legacy về canonical khi chạy lại.

Runtime config:

- `DATABASE_PATH` mặc định `storage/db/cis.sqlite`.
- Worker config gồm `WORKER_ENABLED`, `WORKER_ID`, `WORKER_POLL_INTERVAL_MS`, `WORKER_LOCK_TIMEOUT_SECONDS`.
- Project credential có cột DB cho `backlog_api_key`, `jira_email`, `jira_api_token`.
- Project lưu `backlog_external_read_enabled`, `jira_external_read_enabled` và `jira_external_write_enabled`. Project mới mặc định `true/true/false`; migration giữ Project cũ ở `true/true/true`. Provider URL có giá trị phải là HTTPS origin-only; Project chưa cấu hình được phép để trống.
- Các biến `*_env` còn phục vụ import/compat, command import là `npm run migrate:credentials-from-env`.
- Logging dùng Pino với `LOG_LEVEL` (mặc định `info`, test mặc định `silent`), `LOG_STORAGE_PATH` (mặc định `storage/logs`), `LOG_RETENTION_DAYS` (mặc định `7`) và `LOG_STDOUT_ENABLED` (mặc định tắt). Không dùng `pino-http`, pretty transport hoặc worker transport riêng.

Observability contract:

- HTTP ghi progressive event `request.start` trước body parser, `request.body` sau parser, `request.resolved` sau auth/Project resolution và `request.end` với response body trước khi gửi. `x-correlation-id` hợp lệ được giữ lại; response luôn trả `x-correlation-id` và `x-request-id`.
- Sync job lưu bền `trace_id` và `correlation_id` trong `sync_jobs`; journal có `trace_id`. Event gồm `job.enqueued`/`job.reused`, `job.start`, `job.retry` và terminal `job.end`, nên worker restart vẫn tiếp tục cùng trace.
- External HTTP ghi file riêng cho `backlog`, `jira`, `deepseek`, `openai`. `request` và `response` là hai record nối bằng `external_request_id`; response có status, duration, optional provider request ID và body. Timeout/network ghi `error` riêng không giả lập response.
- JSON/text body được giữ sau recursive redaction; credential/header/token/password bị thay bằng `[REDACTED]`. Binary không ghi body và đặt `binary_omitted=true`.
- File là NDJSON theo UTC day tại `storage/logs/app/<service>-YYYY-MM-DD.ndjson` và `storage/logs/external/<provider>/<provider>-YYYY-MM-DD.ndjson`; retention cleanup chạy khi logger khởi tạo channel. `sync_journal` vẫn là audit trail nghiệp vụ độc lập.

Translation AI config:

- Config canonical là `translation_ai_provider`, `translation_ai_transport`, `translation_ai_model`.
- Default hiện tại là `deepseek`, `openai_compatible`, `deepseek-v4-flash`.
- DeepSeek dùng `DEEPSEEK_API_KEY`, `DEEPSEEK_OPENAI_BASE_URL`, alias cũ `DEEPSEEK_BASE_URL`, `DEEPSEEK_ANTHROPIC_BASE_URL`, `DEEPSEEK_REQUEST_TIMEOUT_SECONDS`.
- OpenAI là provider tùy chọn theo Project, dùng `openai_compatible`; model mặc định tương thích là `gpt-4.1-mini`, đồng thời cho phép chọn `gpt-5.4-mini`, `gpt-5.6-luna`, `gpt-5.6-terra` hoặc `gpt-5.6-sol`. Credential server-side là `OPENAI_API_KEY`; base URL/timeout tùy chọn là `OPENAI_BASE_URL`, `OPENAI_REQUEST_TIMEOUT_SECONDS`. Request OpenAI không gửi field `thinking` riêng của DeepSeek; model họ GPT-5 dùng `temperature = 1` theo giới hạn provider, model khác giữ `0.2`.
- Module Translation không gọi HTTP trực tiếp; transport thật nằm ở `src/infrastructure/external/transports`, còn OpenAI/DeepSeek provider gateway nằm ở `src/infrastructure/external/providers`.

Persistence/schema:

- Bảng lõi gồm `users`, `teams`, `team_members`, `projects`, `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs`, `translation_queue`, `translation_glossary_concepts`, `translation_glossary_terms`, `mapping_rules`, `anomaly_log`, `sync_jobs`, `sync_journal`, `pull_state`, `webhook_events`. Migration `020_auth_users.sql` giữ nguyên user ID/password hash và backfill `system_admin`; migration `021_project_teams.sql` backfill Team/owner/membership cho Project cũ.
- `issues.fields_json` là field-level source tracking với các nhánh `backlog`, `cis`, `jira`.
- Nhánh `fields_json.<field>.cis` là canonical branch vận hành cho Issue Editor và Jira outbound.
- `fields_json.story_point.cis` là số không âm, effective default `1` và tham gia canonical hash. Với `10kn-developer.atlassian.net/WEC1` issue type `Task`, Jira payload dùng `customfield_10038`; metadata được xác nhận bằng Jira REST GET là field `Story Points`, schema `number/float`, operation `set` và required trên Task.
- `webhook_events` đã có schema nhưng webhook route chưa là đường Lite chính.

API contract:

- Success detail trả envelope `{ "data": ... }`.
- Error response dùng `error.code`, `error.message`, `error.details`, `error.correlation_id`.
- Auth dùng Bearer JWT principal `user` với password login, Google login, `POST /api/v1/auth/google/link`, one-time `POST /api/v1/auth/password`, logout và `GET/PATCH /api/v1/auth/me`. Self-profile `PATCH` chỉ owner-write `name` đã trim (tối đa 120 ký tự), không cho payload thay email hoặc system role. Google cần deployment config `GOOGLE_LOGIN_ENABLED`, `GOOGLE_CLIENT_ID`, `PUBLIC_ORIGIN`; runtime lưu identity theo Google `sub`/verified email nhưng không lưu ID/access/refresh token. Google-first tạo user role `user`; password-first chỉ link qua authenticated endpoint khi email trùng.
- System-admin user API là `GET/POST /api/v1/users` và `PATCH/DELETE /api/v1/users/:userId`. `DELETE` hard-delete user cùng Google identity/Team membership phụ thuộc bằng FK cascade, nhưng chặn self-delete, system admin enabled cuối cùng và Project owner còn được tham chiếu. Project ownership control-plane là `GET /api/v1/projects/ownerships` và `PATCH /api/v1/projects/:projectId/owner` với body `{ "new_owner_user_id": <enabled-user-id> }`; transaction promote/thêm owner mới thành lead, đổi `projects.owner_user_id`, rồi demote owner cũ thành member. Project Team API là `GET /api/v1/projects/:projectId/team`, `POST .../team/members`, `PATCH/DELETE .../team/members/:userId`.
- Endpoint global chỉ gồm health, auth và Project CRUD/config. Mọi workspace data-plane endpoint dùng prefix `/api/v1/projects/:projectId`, gồm Dashboard, issues/CIS, Backlog pull/attachments, sync jobs/journal, translation queue/glossary, mapping, anomaly và Jira dry-run/sync.
- CIS manual create và external identity link dùng `POST /api/v1/projects/:projectId/issues` và `POST /api/v1/projects/:projectId/issues/:issueId/external-identities`.
- `GET /api/v1/projects/:projectId/issues` trả `{ items, pagination }`, cố định `page_size = 20`; query search duy nhất là `q`, contains canonical Summary không phân biệt hoa thường. Priority và Assignee trong từng item đọc riêng `fields_json.<field>.cis` để hiển thị.
- Kết quả AI dịch issue `Summary` được chuẩn hóa ngay khi lưu draft thành `【<source issue key>】<translated summary>`. Trước khi owner-write ghi `summary.cis`, CIS chuẩn hóa lần hai: xóa marker trùng của đúng source key và đặt đúng một marker ở đầu; marker khác như `【WEB】` được giữ nguyên.
- Kết quả AI dịch issue `Description` được chuẩn hóa ngay khi lưu draft thành `<source issue URL>\n\n<translated description>`; Backlog URL dùng `backlog_space_url/view/<backlog_issue_key>`, Jira URL dùng `jira_site_url/browse/<jira_issue_key>`. Save Draft thủ công và owner-write `description.cis` dùng cùng normalizer; rollback atomic chỉ bỏ qua normalization của Description để khôi phục đúng snapshot cũ, còn invariant Summary vẫn giữ nguyên.
- `POST /api/v1/projects/:projectId/issues/:issueId/translations/translate` nhận tùy chọn `target_field = summary|description`; khi có field, endpoint chỉ tạo/reuse và dịch item của field đó. Issue Editor dùng contract này cho placeholder card, không dùng bulk action.
- Project middleware kiểm tra membership rồi trả `404 PROJECT_NOT_FOUND`, `409 PROJECT_DISABLED` hoặc `422 PROJECT_SCOPE_MISMATCH`; owner lookup sai Project trả `404 RESOURCE_NOT_FOUND`. System role không bypass membership. Hai ownership control-plane endpoint tự enforce `system_admin` trong Projects application layer nhưng không cho actor đọc workspace nếu actor không thuộc Team. Route workspace global cũ không còn được mount.
- Candidate sync dùng `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis`; body `{ "with_translation": true }` tạo Translation flow, còn `{ "with_translation": true, "push_to_jira": true }` tạo auto-delivery flow. HTTP chỉ chuẩn hóa key cục bộ, kiểm tra readiness/CIS hiện có và enqueue/reuse/promote; `handleManualPullJob` mới gọi provider. Parent/child trace dùng `requested_by`, `request_correlation_id` và `parent_sync_job_id`.
- Pull mapping values của Backlog/Jira giữ contract text cũ (`issue_type`, `status`, `priority`, `user`, `component`, `user_labels`) và bổ sung sibling `*_directory` `{ id, value, name, email?, display_order? }`; Jira user tách `accountId` ở `id` khỏi email/text legacy ở `value`. Directory không được copy sang CIS mapping values. Mappings là touchpoint duy nhất gọi pull/refresh snapshot. Backlog API CIS có action-readiness, `filter-options` và candidate GET theo created range cùng Status/`not_closed`/người được gán tùy chọn; `filter-options` chỉ đọc `status_directory`/`user_directory` đã lưu trong cấu hình project, nên mở màn không gọi Backlog. Candidate chỉ chạy sau `Find issues` và dùng ID snapshot để query Backlog. Khi cùng có `status_id` và `not_closed`, module lấy giao hai tập Status. Tất cả route public đều scope theo project và browse path không ghi database. `BacklogClient`/`JiraClient` chỉ thích nghi payload; request thật đi qua operation registry và provider gateway trong `src/infrastructure/external/providers`, rồi HTTP transport dùng chung.
- Filtered manual pull có hai POST route project-scoped: `manual-pulls/count` chỉ đếm theo cùng filter với browse và `manual-pulls/pages/:page` lấy Page `100`, bulk-check CIS rồi enqueue/reuse từng `manual_pull`. Cả hai resolve remote Backlog Project rồi luôn gửi `projectId[]`; Count dùng browse readiness, Page dùng `sync_to_cis`. Page tạo snapshot nội bộ từ Issue List; handler `manual_pull` dùng snapshot hợp lệ để bỏ GET Project/Issue, nhưng vẫn gọi comments/attachments. Không có batch table/job/coordinator; counter progress do Admin Web giữ và scan Count/offset là best-effort khi nguồn biến động.
- Webhook endpoint không là contract Lite hiện tại khi code chưa mount.

Technical guardrail:

- Backlog Pull one/candidate sync và filtered Page enqueue đi qua job/audit path; manual project/scheduled pull trả disabled và không enqueue job.
- Pull one issue được phép run ngay để Admin UI nhận kết quả.
- Candidate Sync to CIS chỉ enqueue khi project/manual-pull/sync/worker gate đều sẵn sàng và atomically reuse active manual-pull job theo project + normalized requested Backlog key. Candidate GET overlay snapshot tối thiểu `active_job` từ pending/running `manual_pull`; Admin UI dùng snapshot này để khóa row và resume polling sau reload.
- Candidate Sync + Translate chỉ tạo queue current-source `summary`/`description`; worker `manual_pull` enqueue child `translate`, không gọi AI trong HTTP. Worker và các manual Translation entry point dùng cùng active-job gate theo `translation_queue_id`.
- Candidate Sync + Translate + Jira enqueue/promote thành job `sync_translate_jira`. Một worker xử lý tuần tự Backlog ingest -> direct translation -> staged Jira dry-run -> atomic approve/apply -> direct Jira delivery; không có child queue. Snapshot translation/canonical được khôi phục khi handler lỗi, và job chỉ success sau khi Jira delivery hoàn tất.

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
