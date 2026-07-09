# 08 - Quality

`08-quality/` mô tả cách project xác định, kiểm tra và duy trì chất lượng sản phẩm. File này giữ acceptance Lite, verification command và release gate hiện tại. Giải thích generic về quality layer nằm ở `docs/guide/`.

## Nguồn hướng dẫn

- Validation/lifecycle: `docs/guide/concepts/validation-and-lifecycle.md`
- Cách trace impact: `docs/guide/workflows/trace-impact.md`
- Folder structure chuẩn: `docs/guide/reference/folder-structure.md#08-quality`
- Status và note: `docs/guide/reference/status-and-notes.md`
- Product scope: `docs/app/02-product/README.md`
- Generic taxonomy: `docs/guide/reference/entity-maps/08-quality.md` → `docs/app_variants/raw_app_original/08-quality/`

## Acceptance Lite Hiện Tại

Lite được coi là đạt ở mức product khi:

- Backlog manual pull tạo inbound job `backlog -> cis`.
- Project pull enqueue candidate issue, không sync Jira trực tiếp.
- CIS lưu raw/source snapshot, canonical issue, comments, attachments metadata, job và journal.
- Translation option tạo draft Nhật -> Việt và có human review/edit/approve/reject.
- Mapping required có approve path.
- Dry-run Jira trả payload, validation, warning và `can_sync`.
- Sync thật không gọi Jira nếu pre-check fail.
- Sync thật create/update Jira khi pre-check pass.
- Attachment download failure không block issue ingest/sync, nhưng hiển thị trạng thái lỗi và có retry riêng.
- Job lỗi retry theo policy, hết retry chuyển `failed`, admin retry được.
- Dashboard/Admin UI hiển thị pending review, missing mapping, failed job và open anomaly.

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
- `npm run verify:phase07`: Admin UI acceptance.
- `npm run verify:issue-editor`: Issue Editor API và dry-run/sync.
- `npm test`: toàn bộ phase00-07.

Manual acceptance Lite còn sống:

- Admin login được.
- Admin trigger `Pull one issue` và resync issue từ Backlog.
- Issue Editor hiển thị canonical CIS, source Backlog/CIS/Jira và trạng thái issue.
- Translation modal translate/retranslate, edit text, `Approve + save`, reject được.
- Jira sync modal tự chạy dry-run, hiển thị `can_sync`, warning và payload preview.
- Sync Jira thật chỉ chạy sau khi dry-run hợp lệ.
- Dashboard hiển thị pending review, missing mapping, failed job và open anomaly.
- SQLite backup được chạy theo operation runbook trước khi coi demo/release an toàn.
- Issue Editor gate: dry-run dùng canonical effective values mới nhất; stale queue item không fill nội dung dịch; attachment warning chưa là gate v1; manual acceptance ưu tiên `Pull one issue` và `Resync from Backlog`.

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
