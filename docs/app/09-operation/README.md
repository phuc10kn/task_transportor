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
- SQLite mặc định ở `storage/db/cis.sqlite`.
- Attachment/local files nằm trong storage path do project quản lý.
- Không commit DB thật, backup thật, attachment thật, credential thật.

Runtime env tối thiểu:

- `ADMIN_EMAIL`, `ADMIN_PASSWORD` dùng cho bootstrap/admin create.
- `JWT_SECRET` phải đặt cho môi trường thật.
- `DATABASE_PATH` chỉ rõ DB runtime khi không dùng default.
- `DEEPSEEK_API_KEY` cần khi project dùng translation AI default DeepSeek.
- Backlog/Jira credential thật không commit; project config hiện lưu credential trong DB, env compat chỉ dùng cho import/migration.

Worker operation:

- Worker nền bật bằng `WORKER_ENABLED`.
- Chạy một lượt worker bằng `npm run sync:worker-once`.
- Job failed được admin retry qua API/UI.
- Pending job được cancel khi flow cho phép.
- Stale running jobs cần recovery theo timeout worker; không sửa DB tay nếu chưa có backup.

Operator flow Lite:

- Backlog inbound vận hành chính là `Pull one issue` và resync từ Backlog.
- Translation review vận hành trong Issue Editor modal và Translation Queue.
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

Deployment profile hiện có:

- Legacy Lightsail guide mô tả profile triển khai cụ thể: API port `3001`, Admin UI static port `8001`, deploy path riêng máy.
- Profile này là runbook môi trường hiện tại, phải kiểm tra lại trước khi thao tác vì credential/path không được hard-code vào repo.

Incident/recovery rule:

- Không chạy destructive command như reset hard, xóa storage, ghi đè DB nếu chưa có backup rõ.
- Nếu sync lỗi do config/credential, sửa config trước rồi retry job.
- Không bypass dry-run/mapping/anomaly gate để publish Jira.
- Khi có lỗi không rõ, xem dashboard, sync job, sync journal, anomaly và log trước khi retry.

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
