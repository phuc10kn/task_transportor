# 09 - Operation

`09-operation/` mô tả cách hệ thống được chạy, quan sát, duy trì và phục hồi trong môi trường thực tế. File này giữ runtime truth, operator action và recovery rule cho Lite. Giải thích generic về operation layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Validation/lifecycle: `docs/guide/concepts/validation-and-lifecycle.md`
- Cách đọc theo task: `docs/guide/workflows/read-for-task.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#09-operation`
- Quality gate: `docs/app/08-quality/README.md`
- Technical config: `docs/app/06-technical/README.md`
- Generic taxonomy source: `docs/guide/reference/entity-maps/09-operation.md` → `docs/guide/reference/entity-maps/packs/universal/09-operation/`

## Operation Truth Hiện Tại

Local/demo runtime:

- API chạy bằng `npm start` trong runtime thường và `npm run dev` trong dev runtime.
- Dev server dùng Node.js CommonJS và Express.
- Admin Web chạy riêng bằng Node client-rendered MPA trong `apps/admin-web`: local dev dùng `npm run admin:dev`, production dùng `npm run admin:start -- --port 8001` với `CIS_API_ORIGIN` chỉ tới API nội bộ. Listener mặc định bind `127.0.0.1`; deployment phục vụ trực tiếp qua public port phải đặt `ADMIN_WEB_HOST=0.0.0.0`. Browser gọi relative `/api/v1/*`; MPA server proxy same-origin tới Express.
- SQLite mặc định ở `storage/db/cis.sqlite`.
- Attachment/local files nằm trong storage path do project quản lý.
- Không commit DB thật, backup thật, attachment thật, credential thật.

Runtime env tối thiểu:

- `ADMIN_EMAIL`, `ADMIN_PASSWORD` dùng cho bootstrap/admin create.
- `JWT_SECRET` phải đặt cho môi trường thật.
- `DATABASE_PATH` chỉ rõ DB runtime khi không dùng default.
- `DEEPSEEK_API_KEY` cần khi project dùng translation AI default DeepSeek.
- Project dùng OpenAI cần `OPENAI_API_KEY`; local dev có thể đặt thêm `OPENAI_BASE_URL=https://api.openai.com/v1` và `OPENAI_REQUEST_TIMEOUT_SECONDS=60` trong `.env`. Operator chọn model theo nhu cầu: `gpt-5.6-luna` ưu tiên chi phí, `gpt-5.6-terra` cân bằng, `gpt-5.6-sol` ưu tiên chất lượng; `gpt-5.4-mini` và default tương thích `gpt-4.1-mini` là lựa chọn nhẹ hơn. Key không được nhập vào Project UI hoặc commit vào repository.
- Backlog/Jira credential thật không commit; project config hiện lưu credential trong DB, env compat chỉ dùng cho import/migration.
- Log mặc định ở `storage/logs`; có thể đổi bằng `LOG_STORAGE_PATH`. `LOG_LEVEL`, `LOG_RETENTION_DAYS` (mặc định 7 ngày) và `LOG_STDOUT_ENABLED` điều khiển verbosity, retention và stdout. Vì event lifecycle có body JSON/text sau redaction, môi trường triển khai phải áp dụng quyền truy cập và policy dữ liệu phù hợp cho thư mục log.

Log và trace vận hành:

- App/API: `storage/logs/app/cis-api-YYYY-MM-DD.ndjson`; Admin proxy: `storage/logs/app/admin-web-YYYY-MM-DD.ndjson`.
- Provider: `storage/logs/external/{backlog|jira|deepseek|openai}/<provider>-YYYY-MM-DD.ndjson`.
- Bắt đầu từ `correlation_id` hoặc `trace_id`, tìm `request.start`, `request.body`, `request.resolved`, các event `job.*`, rồi ghép external `request`/`response` bằng `external_request_id`. Nếu provider không trả HTTP response, tìm event `error` cùng ID.
- `request.body` là client → CIS; `request.end.body` là CIS → client. External `request.body` là CIS → provider; external `response.body` là provider → CIS. Binary chỉ có `binary_omitted=true`.
- File cũ quá retention được cleanup lúc channel log khởi tạo; shutdown SIGINT/SIGTERM chờ worker tick hiện tại và đóng Pino destination. Backup/restore business state vẫn dựa vào SQLite/storage, không dựa vào log.

Worker operation:

- Worker nền bật bằng `WORKER_ENABLED`.
- Chạy một lượt worker bằng `npm run sync:worker-once`.
- Job failed được admin retry qua API/UI.
- Pending job được cancel khi flow cho phép.
- Stale running jobs cần recovery theo timeout worker; không sửa DB tay nếu chưa có backup.

Operator flow Lite:

- Backlog inbound vận hành chính là `Pull one issue` và resync từ Backlog.
- Mappings là nơi duy nhất operator chạy Pull Backlog fields hoặc Pull Jira fields; giữ cả mảng text legacy cho Mapping và directory provider ID đã refresh, không tự sửa JSON để thay text bằng ID. Trước khi dùng Status/người được gán ở Backlog Issues lần đầu hoặc khi Backlog thay đổi, operator chạy `Pull Backlog fields` trong Mappings. Backlog Issues chỉ browse không lưu DB khi operator bấm `Find issues`, theo ngày tạo và Status/Not closed/người được gán từ snapshot đó, rồi dùng ID để query Backlog và Sync to CIS từng candidate. Per-row Sync chỉ bật khi `WORKER_ENABLED=true`; khi worker tắt, operator dùng Pull one inline hoặc bật/chạy consumer phù hợp.
- HTTP 202 của candidate chỉ nghĩa là queued; theo dõi trạng thái tại row/Sync Jobs, không coi là ingest đã hoàn thành.
- `Sync to CIS + Translate` cũng trả HTTP 202 cho parent queued; sau terminal success, chờ child `translate` worker rồi review Translation Queue. Nếu nhận `BACKLOG_SYNC_RUNNING_WITHOUT_TRANSLATION`, theo dõi job evidence và dùng Issue Editor > Translate sau khi parent thành công.
- Khi retry parent sau lỗi SQLite/Sync transient, worker quét lại pending current-source queue item; không tạo job translate thứ hai theo cùng `translation_queue_id`. Provider failure chỉ retry child translate job.
- Translation review vận hành trong Issue Editor modal và Translation Queue.
- Operator mở Translation Glossary, chọn Project rồi thêm/sửa/xóa concept, language và variant; chọn canonical cho từng language. Thay đổi chỉ áp dụng cho pending translation execution tiếp theo, không tự retranslate draft đã tạo. Khi API lỗi dùng Retry hoặc giữ form để sửa payload.
- Mapping/anomaly xử lý trước Jira sync thật.
- Jira outbound luôn đi qua dry-run rồi mới sync thật.
- Attachment download failure xử lý bằng retry riêng, không mặc định làm fail toàn issue flow.
- Dashboard, Sync Jobs, Journal và Anomalies là màn quan sát vận hành chính.

Backup/recovery Lite:

- SQLite chính nằm ở `DATABASE_PATH`, mặc định `storage/db/cis.sqlite`.
- Trước backup thủ công, dừng API/worker và xác nhận không có writer đang chạy.
- Backup DB vào `storage/backups/cis-YYYYMMDD-HHMMSS.sqlite`.
- Khi cần khôi phục attachment đầy đủ, backup thêm `storage/attachments`.
- Restore bằng cách dừng API/worker, đổi tên DB hiện tại, copy backup về đúng `DATABASE_PATH`, start lại và kiểm tra health.

Deployment/cutover runbook canonical:

1. Từ exact release SHA, chạy `npm ci`, `npm --prefix apps/admin-web ci`, `npm run admin:ci`, `npm test`, `npm run verify:admin-ui-e2e` và `npm run verify:docs`.
2. Dừng API/worker/Admin Web và xác nhận không còn writer. Copy `DATABASE_PATH` sang `storage/backups/cis-YYYYMMDD-HHMMSS.sqlite`, ghi SHA-256 và giữ nguyên artifact cũ.
3. Deploy Backend + Admin Web từ cùng một artifact; không đổi riêng một phía của Project-scoped API contract.
4. Start API tại `3001`, rồi start Tabler MPA với `NODE_ENV=production`, `CIS_API_ORIGIN=http://127.0.0.1:3001` và `npm run admin:start -- --port 8001`.
5. Smoke test qua MPA proxy: health, login, chọn Project A/B, Dashboard counts/links, Issue Save, Mapping Save, ba mapping pull/sync buttons, job retry và protected deep-link sai Project. Xác nhận Project disabled bị chặn và route workspace legacy trả 404.
6. Nếu smoke fail, dừng toàn bộ release mới, giữ DB lỗi để điều tra, restore SQLite backup, rollback cả Backend + Admin Web về cùng artifact cũ rồi kiểm tra `/api/v1/health`; không rollback riêng một phía hoặc hot-fix trực tiếp production.

Path, account, service unit, credential và backup destination cụ thể là inventory môi trường ngoài repo; xác nhận chúng trong maintenance window trước cutover.

Incident/recovery rule:

- Không chạy destructive command như reset hard, xóa storage, ghi đè DB nếu chưa có backup rõ.
- Nếu sync lỗi do config/credential, sửa config trước rồi retry job.
- Không bypass dry-run/mapping/anomaly gate để publish Jira.
- Khi có lỗi không rõ, lấy `correlation_id` từ response/API proxy error, trace qua app/provider log, rồi đối chiếu dashboard, sync job, sync journal và anomaly trước khi retry.

## Folder Structure

Structure chuẩn của layer này được giải thích ở `docs/guide/reference/folder-structure.md#09-operation`.

README này không lặp lại lý do tồn tại của từng concern; nó chỉ giữ runtime truth, operator action và recovery rule hiện tại.

Chỉ mục nhanh:

- `01-operating-context/`
- `02-release-and-change/`
- `03-signals/`
- `04-reliability/`
- `05-operational-events/`
- `06-continuity/`
- `07-resources/`
- `08-maintenance/`

## Theory Routing

- `TH-OPS-TRACE`: monitoring, retry handling, recovery, audit và journal reasoning.
- `TH-AI-GOV`: review workload, operator accountability và AI-assisted operation.
- `TH-SYNC-SAFE`: publish gate, dry-run và recovery sau stale preview.

## Rule Riêng Hiện Tại

- Recovery thao tác với DB/storage phải bắt đầu bằng backup.
- Không bypass dry-run/mapping/anomaly gate để publish Jira trong vận hành.
- Runbook không hard-code credential/path riêng máy vào repo.
- Operation feedback tạo input ngược cho Quality, Product và Decision khi behavior thực tế lệch expectation.
