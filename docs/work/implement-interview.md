# Phỏng vấn trước khi implement

Tài liệu này ghi lại các quyết định cần chốt trước khi bắt đầu implement hệ thống theo thiết kế trong `docs/work`.

Phạm vi: chỉ dựa trên thiết kế Central Sync Hub/CIS trong `docs/work`. Bỏ qua hệ thống `backlog2jira` cũ.

## Trạng thái

- Ngày tạo: 2026-06-24
- Trạng thái: Đang phỏng vấn
- Mục tiêu: thu đủ dữ liệu để chuyển từ tài liệu thiết kế sang implementation plan và code.

## 1. Phạm vi MVP

### Câu hỏi

1. MVP cần hỗ trợ những luồng nào trước?
   - Backlog -> CIS
   - CIS -> Jira
   - Jira -> CIS
   - CIS -> Backlog

2. Trong MVP có cần sync hai chiều đầy đủ không, hay chỉ cần Backlog -> CIS -> Jira trước?

3. MVP cần xử lý issue, comment, attachment, hay chỉ issue/comment?

4. Có cần UI review ngay trong MVP không, hay dùng API/CLI/admin endpoint trước?

### Câu trả lời

- MVP cần hỗ trợ 3 luồng trước:
  - Backlog -> CIS
  - CIS -> Jira
  - Jira -> CIS
- Chưa làm luồng CIS -> Backlog trong MVP.
- Object cần xử lý: issue + comment + attachment.
- MVP cần có UI review/admin.

## 2. Runtime và kiến trúc triển khai

### Câu hỏi

1. Hệ thống sẽ chạy như một service duy nhất hay tách API server và worker?

2. Webhook receiver, translation worker, sync worker và anomaly worker có chạy chung process không?

3. Môi trường deploy dự kiến là local server, VPS, Docker, Windows service, hay nền tảng khác?

4. Có cần multi-project ngay từ đầu không?

### Câu trả lời

- MVP chạy một service duy nhất: API + webhook + worker chung một app.
- Môi trường deploy dự kiến: server nội bộ công ty.
- MVP cần hỗ trợ multiple project ngay từ đầu.
- Quyết định worker MVP: một service duy nhất, nhưng webhook receiver chỉ verify + lưu event + trả response nhanh; translation/sync/anomaly chạy async bằng worker loop/module nội bộ trong cùng process/app.
- Webhook volume dự kiến: vài trăm event/ngày.
- Translation được phép xử lý async.
- Nếu AI/Jira API chậm hoặc lỗi, admin UI vẫn phải hoạt động bình thường và cần hiển thị/báo lỗi.
- Tạm thời không tính đến scale riêng worker trong 6-12 tháng đầu.

### Chi tiết cần hỏi thêm

Đã chốt theo hướng worker async nội bộ. Các tiêu chí đã dùng:

1. Lưu lượng webhook chỉ ở mức vài trăm event/ngày.
2. Translation có thể chạy async.
3. Webhook receiver nên trả response nhanh.
4. Worker lỗi không được làm admin UI mất khả dụng.
5. Chưa cần scale worker riêng trong giai đoạn đầu.

## 3. Central Issue Store

### Câu hỏi

1. Database muốn dùng là gì?
   - SQLite
   - PostgreSQL
   - MySQL/MariaDB
   - Khác

2. Có cần migrate dữ liệu giữa các môi trường không?

3. Có cần lưu raw webhook payload lâu dài không?

4. Chính sách retention cho `webhook_events`, `sync_journal`, `anomaly_log` là gì?

5. Có cần full-text search issue/comment không?

### Câu trả lời

- Database CIS cho MVP: SQLite.
- Server nội bộ chưa có DB riêng bắt buộc phải dùng.
- Cần lưu raw webhook payload để audit/replay/debug.
- Retention cho `webhook_events`, `sync_journal`, `anomaly_log`: giữ 3 tháng.
- MVP cần search issue bằng text.

## 4. Project config

### Câu hỏi

1. Project config sẽ lưu trong database, file config, hay cả hai?

2. Mỗi project cần những thông tin bắt buộc nào?
   - Backlog space/project/key prefix
   - Jira project key
   - Webhook secrets
   - Mapping rules
   - Source roots/wiki roots/instruction files
   - Sync direction

3. Ai được phép chỉnh project config?

4. Có cần bật/tắt sync theo từng project không?

### Câu trả lời

- Project config dùng cả hai:
  - File config để seed/bootstrap ban đầu.
  - SQLite database là nguồn chính khi hệ thống chạy.
- Người được phép chỉnh project config: admin qua UI.
- Cần bật/tắt sync theo từng project.
- Các thông tin bắt buộc của project config cần được đề xuất/chốt thêm.
- Mapping scope chốt: `global_with_project_override`.

### Đề xuất project config tối thiểu

Mỗi project nên có các nhóm thông tin sau:

1. Identity
   - `id`
   - `name`
   - `enabled`

2. Backlog
   - `backlog_space_url`
   - `backlog_space_key`
   - `backlog_project_key`
   - `backlog_issue_key_prefix`
   - `backlog_webhook_secret`

3. Jira
   - `jira_site_url`
   - `jira_project_key`
   - `jira_webhook_secret`

4. Sync behavior
   - `sync_enabled`
   - `sync_direction`
   - `auto_translate`
   - `require_translation_review`
   - `require_mapping_approval`
   - `conflict_resolution_policy`

5. AI/context
   - `source_roots`
   - `wiki_roots`
   - `instruction_files`
   - `default_source_language`
   - `default_target_language`

6. Safety
   - `anomaly_detection_enabled`
   - `block_on_critical_anomaly`

7. Mapping scope
   - `mapping_scope`: `project` hoặc `global_with_project_override`

### Quyết định

- Config seed bằng file, khi chạy thì lưu/chỉnh trong SQLite.
- Admin chỉnh project config qua UI.
- Có bật/tắt sync theo từng project.
- Mapping dùng mô hình global rule + project override.

## 5. Webhook và internal event payload

### Câu hỏi

1. Backlog webhook và Jira webhook có public endpoint riêng hay dùng chung endpoint rồi route theo source?

2. Có bắt buộc verify webhook signature/secret trong MVP không?

3. Internal webhook payload cần chuẩn hóa tối thiểu các field nào?

4. Khi webhook đến mà project chưa được config thì xử lý thế nào?

5. Có cần chống duplicate webhook event không?

### Câu trả lời

- Endpoint webhook chốt: dùng endpoint riêng theo source.
- Verify webhook secret/signature: cho phép tắt bằng config, ví dụ `WEBHOOK_VERIFY=false`.
- Project chưa config: lưu raw payload, không ingest, đánh dấu `unmatched_project`, tạo anomaly `routing_mismatch`.
- Cần chống duplicate webhook event.
- Internal webhook payload: chốt theo field tối thiểu được đề xuất bên dưới.

### Đề xuất endpoint webhook

Chốt dùng endpoint riêng theo source:

- `POST /webhooks/backlog`
- `POST /webhooks/jira`

Lý do:

- Dễ verify secret/signature theo từng hệ thống.
- Dễ log, route, debug và rate limit riêng.
- Tránh phải đoán source từ payload.
- Code normalize rõ ràng hơn: Backlog normalizer và Jira normalizer tách biệt.

Endpoint chung `/webhooks/:source` vẫn được, nhưng ít lợi ích trong MVP vì hiện chỉ có Backlog/Jira.

### Verify webhook secret/signature

Cho phép bật/tắt verify bằng config. Khuyến nghị bật khi chạy thật trên server nội bộ, cho phép tắt trong môi trường dev/local.

Lý do nên bắt buộc:

- Ngăn request giả tạo issue/comment/sync.
- Tránh người ngoài spam webhook làm đầy queue/database.
- Bảo vệ attachment/raw payload có thể chứa dữ liệu khách hàng.
- Khi có nhiều project, secret giúp xác định đúng project/source an toàn hơn.

Lý do có thể chưa bắt buộc:

- Nếu MVP chỉ chạy local/internal network, chưa public endpoint.
- Nếu Backlog/Jira webhook setup ban đầu chưa có signature rõ ràng, verify có thể làm chậm implement.
- Có thể cần thời gian kiểm tra format signature thực tế của từng hệ thống.

Quyết định:

- Production/internal server thật: khuyến nghị bật verify secret.
- Dev/local: cho phép bypass bằng config `WEBHOOK_VERIFY=false`.
- Raw payload vẫn được lưu với trạng thái `rejected` nếu verify fail.

### Project chưa config

Về nguyên tắc admin phải tạo project config trước, sau đó mới lấy webhook URL/secret để cấu hình trên Backlog/Jira. Vì vậy project chưa config mà webhook vẫn đến thường là:

- URL/secret bị dùng nhầm.
- Project key/prefix chưa được khai báo.
- Webhook từ project không thuộc phạm vi hệ thống.
- Cấu hình bị xóa/tắt nhưng webhook bên ngoài vẫn còn bật.

Chốt xử lý:

- Lưu raw payload vào `webhook_events`.
- Không ingest vào `issues`.
- Đánh trạng thái `unmatched_project`.
- Tạo anomaly `routing_mismatch` để admin xem.
- Trả HTTP 202 hoặc 200 để tránh hệ thống ngoài retry liên tục, trừ khi verify fail thì trả 401/403.

### Chống duplicate webhook event

MVP cần idempotency theo thứ tự ưu tiên:

1. Dùng event id/header id từ Backlog/Jira nếu có.
2. Nếu không có, tạo `dedupe_key` từ `source_system + event_type + external_issue_key + external_comment_id + occurred_at + payload_hash`.
3. Lưu unique index trên `webhook_events.dedupe_key`.
4. Nếu duplicate thì không enqueue lại worker, chỉ tăng `duplicate_count` hoặc ghi log nhẹ.

### Đề xuất internal webhook payload tối thiểu

```json
{
  "event_id": "string",
  "source_system": "backlog|jira",
  "event_type": "issue_created|issue_updated|comment_created|comment_updated|attachment_added",
  "project_id": "string|null",
  "external_project_key": "string",
  "external_issue_key": "string",
  "external_comment_id": "string|null",
  "external_attachment_id": "string|null",
  "actor": {
    "external_id": "string|null",
    "display_name": "string|null",
    "email": "string|null"
  },
  "changed_fields": ["summary", "description", "status"],
  "occurred_at": "ISO-8601 string",
  "received_at": "ISO-8601 string",
  "raw_payload_id": "string",
  "dedupe_key": "string",
  "payload_hash": "string",
  "normalized_payload": {}
}
```

`normalized_payload` giữ phần dữ liệu đã chuẩn hóa theo loại event, ví dụ issue fields, comment body hoặc attachment metadata.

## 6. Translation pipeline

### Câu hỏi

1. MVP có dùng AI translate thật ngay không?

2. Ngôn ngữ chính là Nhật -> Việt, Nhật -> Anh, hay Nhật -> ngôn ngữ khác?

3. Field nào cần dịch?
   - Summary
   - Description
   - Comment
   - Attachment text

4. Có bắt buộc human review trước khi sync lên Jira không?

5. Khi AI confidence thấp thì block sync hay chỉ cảnh báo?

### Câu trả lời

- MVP cần dùng AI translate thật.
- Ngôn ngữ dịch chính: Nhật -> Việt.
- Field cần dịch: summary, description, comment. Không dịch attachment text trong MVP.
- Bắt buộc human review trước khi sync lên Jira.
- Nếu AI confidence thấp: đưa lên đầu review queue nhưng không block sync sau khi đã được review.
- Attachment không dịch nội dung, nhưng cần tải về/lưu lại để sync sang Jira.

## 7. Mapping

### Câu hỏi

1. Các canonical value trong CIS cần chốt ngay gồm những field nào?
   - Issue type
   - Status
   - Priority
   - Assignee
   - Labels/components

2. Mapping ban đầu sẽ nhập tay hay để AI propose?

3. Mapping mới có cần approval trước khi dùng không?

4. Khi thiếu mapping thì block issue hay đưa vào review queue?

### Câu trả lời

- MVP cần mapping tất cả field liên quan: issue type, status, priority, assignee, component/category, labels, milestone/version và các field phát sinh cần chuẩn hóa.
- Mapping ban đầu: AI propose từ dữ liệu, admin có thể chỉnh sửa, sau đó admin approve.
- Mapping mới bắt buộc cần approval trước khi dùng chính thức.
- Khi thiếu mapping: đưa cho admin chọn/sửa/approve trong mapping review.
- Status canonical: CIS là nguồn chính, nhưng bộ status/workflow của CIS sẽ align theo Jira vì Jira là nơi dev làm việc chính.

## 8. Sync engine

### Câu hỏi

1. Sync sẽ chạy theo scheduler poll database hay theo queue event?

2. Retry policy mong muốn là gì?

3. Khi sync Jira/Backlog API lỗi 4xx thì xử lý thế nào?

4. Khi sync API lỗi 5xx/rate limit thì xử lý thế nào?

5. Có cần batch sync trong MVP không?

### Câu trả lời

- Sync engine dùng mô hình kết hợp: webhook tạo event/job, scheduler/worker poll job pending trong SQLite để đảm bảo không mất job.
- Retry policy cơ bản: retry 3 lần với delay tăng dần, ví dụ `1m -> 5m -> 15m`, sau đó đưa job sang trạng thái `failed`.
- Với lỗi API `4xx`: không retry mặc định, trừ một số mã cụ thể như `429`.
- Với `429`: retry theo backoff/rate limit.
- Với lỗi `5xx` hoặc network timeout: retry tự động tối đa 3 lần theo backoff `1m -> 5m -> 15m`, sau đó đưa job sang `failed` để admin xử lý.
- MVP không cần batch sync; sync theo từng issue/comment/job.
- Attachment sync: copy file thật từ Backlog về CIS, sau đó upload/copy sang Jira.

## 9. Conflict và anomaly

### Câu hỏi

1. Conflict resolution mặc định là gì?
   - Jira thắng
   - Backlog thắng
   - Last writer wins
   - Manual review

2. Loại anomaly nào cần block sync trong MVP?

3. Loại anomaly nào chỉ cần log/cảnh báo?

4. Notification gửi qua đâu?
   - UI
   - Email
   - Slack/Teams
   - Log only

### Câu trả lời

- Conflict resolution mặc định: manual review. Với một số field vận hành theo Jira, có thể dùng chính sách Jira thắng.
- Anomaly phải block sync trong MVP:
  - Mapping gap
  - Duplicate issue nghi ngờ
  - Content thay đổi quá lớn
- Anomaly chỉ log/cảnh báo: chưa chốt.
- Notification trong MVP: Admin UI.
- Blocking conflict/anomaly chưa cần tách queue riêng; admin UI filter theo status/type là đủ.

### Quyết định conflict policy

MVP dùng policy theo field:

- `status`: Jira thắng, vì Jira là nơi dev làm việc chính.
- `assignee`: Jira thắng, vì phân công dev nằm ở Jira.
- `summary`: manual review nếu cả hai phía cùng sửa.
- `description`: manual review nếu cả hai phía cùng sửa.
- `priority`: manual review hoặc Backlog thắng tùy project, vì priority có thể đến từ khách hàng.
- `comment`: không merge tự động nếu cùng comment bị sửa; đưa vào review.
- `attachment`: nếu trùng tên/hash thì bỏ qua duplicate, nếu khác thì sync như attachment mới.
- Default: manual review.

### Quyết định anomaly chỉ cảnh báo, không block

- Translation low confidence: đưa lên đầu review queue, không block sau khi human review.
- Status jump bất thường: cảnh báo trước, chỉ block nếu project config yêu cầu hoặc status jump quá nhạy cảm.
- Batch operation: cảnh báo/admin confirm nếu số lượng lớn, nhưng không nhất thiết block từng issue.
- Sync failure chain: cảnh báo và giữ job lỗi ở trạng thái `failed`, không block toàn bộ project trừ khi lỗi vượt ngưỡng.
- Routing mismatch: không ingest vào issue vì không có project khớp; lưu raw payload + anomaly.

## 10. API/UI/Admin

### Câu hỏi

1. MVP cần những endpoint nào?

2. Có cần UI quản lý không?

3. Các màn hình cần có nếu làm UI:
   - Issue list
   - Translation review
   - Mapping approval
   - Anomaly queue
   - Sync journal
   - Project config

4. Có cần auth/user permission ngay từ đầu không?

### Câu trả lời

- MVP UI cần các màn hình:
  - Dashboard
  - Project page, bao gồm issue list/detail và filter issue theo project
  - Issue list/detail
  - Translation review
  - Mapping approval
  - Anomaly list/detail
  - Sync journal
  - Project config
- Auth MVP: simple login admin.
- Review flow: admin có thể sửa trực tiếp từ bản dịch AI rồi approve, hoặc reject và yêu cầu AI dịch lại.
- Mapping approval: hỗ trợ cả approve từng mapping và approve hàng loạt.
- Issue detail cần hiển thị song song Backlog original và bản dịch tiếng Việt.
- Cần manual actions như retry sync, force approve, mark duplicate, ignore anomaly.

## 11. Quan sát và vận hành

### Câu hỏi

1. Log format mong muốn là gì?

2. Có cần dashboard health/status không?

3. Có cần export/import dữ liệu không?

4. Có cần dry-run mode trước khi sync thật không?

### Câu trả lời

- Log cần có correlation id theo webhook/job/issue.
- Cần dashboard health/status, ví dụ số webhook pending, translation pending, sync failed, anomaly open.
- Dry-run mode: MVP cần có ít nhất cho luồng CIS -> Jira.
- Cần backup SQLite.
- Notification trong Admin UI: badge trên menu và dashboard alerts.
- Backup/retention SQLite MVP: chỉ document hướng dẫn backup, chưa cần tự động backup định kỳ.

### Giải thích dry-run mode

Dry-run mode là chế độ chạy thử sync mà không ghi dữ liệu sang hệ thống đích.

Ví dụ với CIS -> Jira:

1. Lấy issue đã approved trong CIS.
2. Build Jira payload như khi sync thật.
3. Validate mapping, attachment, required field.
4. Ghi sync journal kiểu `dry_run`.
5. Hiển thị payload/diff/lỗi trong Admin UI.
6. Không gọi Jira API tạo/cập nhật issue thật.

Lợi ích:

- Kiểm tra mapping và payload trước khi bật sync thật.
- Giảm nguy cơ tạo nhầm issue/comment trên Jira.
- Hữu ích khi cấu hình project mới.

Chi phí:

- Cần thêm trạng thái/action trong sync engine.
- Cần UI hoặc API để xem kết quả dry-run.

## 12. Quyết định đã chốt

- MVP hỗ trợ các luồng: Backlog -> CIS, CIS -> Jira, Jira -> CIS. Chưa làm CIS -> Backlog.
- MVP xử lý issue + comment + attachment.
- MVP cần Admin UI.
- Runtime: một service duy nhất, API + webhook + worker chung app.
- Worker: webhook receiver lưu event và trả response nhanh; translation/sync/anomaly xử lý async bằng worker nội bộ.
- Deploy: server nội bộ công ty.
- Multiple project: cần hỗ trợ ngay từ đầu.
- Database: SQLite.
- Raw webhook payload: cần lưu để audit/replay/debug.
- Retention log: giữ `webhook_events`, `sync_journal`, `anomaly_log` trong 3 tháng.
- Search: MVP cần search issue bằng text.
- Project config: seed bằng file, runtime lưu/chỉnh trong SQLite.
- Project config admin: chỉnh qua UI.
- Sync theo project: có bật/tắt từng project.
- Mapping scope: global rule + project override.
- Webhook endpoint: riêng theo source, gồm `/webhooks/backlog` và `/webhooks/jira`.
- Webhook verify: cho phép bật/tắt bằng config, ví dụ `WEBHOOK_VERIFY=false`.
- Project chưa config: lưu raw payload, không ingest, đánh dấu `unmatched_project`, tạo anomaly `routing_mismatch`.
- Duplicate webhook: cần chống duplicate bằng event id hoặc dedupe key/hash.
- Internal webhook payload: dùng field tối thiểu đã đề xuất trong nhóm 5.
- Translation: dùng AI translate thật.
- Ngôn ngữ dịch: Nhật -> Việt.
- Field dịch: summary, description, comment. Không dịch attachment text trong MVP.
- Translation review: bắt buộc human review trước khi sync lên Jira.
- AI confidence thấp: đưa lên đầu review queue, không block sau khi human review.
- Attachment: không dịch nội dung, nhưng tải/copy file thật từ Backlog về CIS rồi upload/copy sang Jira.
- Mapping field: tất cả field cần chuẩn hóa, gồm issue type, status, priority, assignee, component/category, labels, milestone/version.
- Mapping flow: AI propose từ dữ liệu, admin chỉnh sửa và approve.
- Mapping mới: bắt buộc approval trước khi dùng chính thức.
- Thiếu mapping: đưa admin chọn/sửa/approve trong mapping review.
- Status canonical: CIS là nguồn chính, nhưng align theo Jira workflow.
- Sync engine: webhook tạo event/job, worker poll pending job trong SQLite.
- Retry: mặc định retry 3 lần với delay tăng dần `1m -> 5m -> 15m`; `4xx` không retry trừ mã cụ thể như `429`; `429` retry theo `Retry-After` nếu có, nếu không dùng backoff; `5xx/network timeout` retry đủ 3 lần rồi chuyển job sang `failed`.
- Batch sync: không cần trong MVP; sync từng issue/comment/job.
- Conflict policy: default manual review, một số field như status/assignee Jira thắng.
- Blocking anomaly: mapping gap, duplicate issue nghi ngờ, content thay đổi quá lớn.
- Warning anomaly: translation low confidence, status jump, batch operation, sync failure chain; routing mismatch lưu raw + anomaly.
- Notification: Admin UI.
- Queue UI: chưa cần tách queue riêng; admin UI filter theo status/type.
- UI màn hình: Dashboard, Project page, Issue list/detail, Translation review, Mapping approval, Anomaly list/detail, Sync journal, Project config.
- Auth: simple login admin.
- Review flow: admin sửa bản dịch AI rồi approve, hoặc reject và yêu cầu AI dịch lại.
- Mapping approval: approve từng mapping và approve hàng loạt.
- Issue detail: hiển thị song song Backlog original và bản dịch tiếng Việt.
- Manual actions: retry sync, force approve, mark duplicate, ignore anomaly.
- Logging: cần correlation id theo webhook/job/issue.
- Health/status dashboard: cần có.
- Dry-run: MVP cần có ít nhất cho CIS -> Jira.
- Backup: cần backup SQLite; MVP chỉ document hướng dẫn backup, chưa cần tự động backup.
- Notification UI: badge trên menu và dashboard alerts.

## 13. Câu hỏi còn mở

- Chọn model cụ thể cho từng AI provider.
- Chọn thư viện SQLite/migration trong Node app.
- Chốt schema implementation chi tiết từ `02-central-issue-store.md`.
- Chốt endpoint/API contract chi tiết cho Admin UI.

## 14. AI provider cho translation

### Quyết định

- Provider mặc định: OpenAI API qua Platform API key.
- Mỗi project có thể chọn một provider/model translation riêng.
- Có thể thêm option dùng Codex subscription/Codex auth để dịch, nhưng chỉ là adapter phụ/experimental cho môi trường trusted internal.
- API key vẫn là mặc định cho production vì ổn định, rõ billing, dễ gọi trực tiếp từ app server và đúng với kiểu "general OpenAI API calls".

### Các option

1. `openai_api`
   - App gọi OpenAI API trực tiếp bằng API key.
   - Phù hợp production/default.
   - Dễ kiểm soát model, timeout, retry, structured output và logging.

2. `codex_exec`
   - App gọi `codex exec` như một command nội bộ để dịch.
   - Codex CLI có thể dùng ChatGPT sign-in/subscription access hoặc API key tùy máy đã login.
   - Chỉ nên dùng trên server nội bộ/trusted runner.
   - Không nên dùng cho public/untrusted environment.
   - Cần kiểm soát prompt, sandbox, timeout, output schema và lỗi CLI.

3. `manual`
   - Không gọi AI, admin tự nhập bản dịch.
   - Dùng làm fallback khi AI provider lỗi.

### Cấu hình theo project

Mỗi project nên có nhóm config translation riêng:

```json
{
  "translation_provider": "openai_api",
  "translation_model": "model-name",
  "source_language": "ja",
  "target_language": "vi",
  "require_review": true,
  "fallback_provider": "manual"
}
```

Provider/model có thể khác nhau theo project để tối ưu chi phí, tốc độ hoặc chất lượng dịch theo khách hàng/domain.

### Ghi chú bảo mật/vận hành

- Không lưu `~/.codex/auth.json` vào repo, ticket hoặc chat.
- Nếu dùng Codex auth trên server, cần xem nó như credential nhạy cảm.
- Codex auth phù hợp cho workflow Codex local/trusted automation; với app gọi AI thông thường, Platform API key vẫn là đường chính.

## 15. Attachment storage

### Quyết định

- MVP lưu attachment vào disk trên server nội bộ.
- Luồng attachment: tải file thật từ Backlog -> lưu vào disk/CIS metadata -> upload/copy sang Jira.
- Không dịch nội dung attachment trong MVP.

### Đề xuất cấu trúc lưu trữ

```text
storage/
  attachments/
    <project_id>/
      <issue_id>/
        <attachment_id>/
          original_filename.ext
```

Metadata nên lưu trong database:

- `project_id`
- `issue_id`
- `source_system`
- `external_attachment_id`
- `original_filename`
- `stored_path`
- `mime_type`
- `size_bytes`
- `sha256`
- `download_status`
- `jira_attachment_id`
- `created_at`

Schema chính dùng bảng `issue_attachments` trong `02-central-issue-store.md`; `issue_revisions.attachments` chỉ là snapshot tham khảo nếu cần hiển thị lại content tại revision.

## 16. SQLite và migration

### Đề xuất

Khuyến nghị cho MVP: **better-sqlite3 + migration SQL file tự quản**.

Lý do:

- App hiện là Node/Express CommonJS, `better-sqlite3` dễ dùng và ổn định cho SQLite local.
- Workload vài trăm webhook/ngày phù hợp SQLite.
- Transaction sync dễ viết.
- Migration bằng file SQL tuần tự dễ review, ví dụ `migrations/001_init.sql`, `002_add_attachments.sql`.

### Option khác

1. `better-sqlite3` + SQL migration tự quản
   - Đơn giản, ít abstraction.
   - Phù hợp MVP.
   - Cần tự viết helper migration.

2. `knex` + SQLite
   - Có migration framework sẵn.
   - Query builder tiện hơn khi schema lớn.
   - Thêm abstraction, code dài hơn.

3. `drizzle-orm` + SQLite
   - Type/schema tốt hơn nếu sau này dùng TypeScript.
   - MVP CommonJS hiện tại có thể hơi nặng.

4. `sqlite3`
   - Async API.
   - Callback/Promise wrapper dễ làm code rối hơn `better-sqlite3`.

### Migration table đề xuất

```sql
CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## 17. Admin UI API contract

### Nguyên tắc

API Admin UI phải đi theo model **System -> CIS -> System**:

1. Inbound: kéo/nhận dữ liệu từ hệ thống ngoài vào CIS.
   - Backlog -> CIS qua webhook hoặc manual pull.
   - Jira -> CIS qua webhook hoặc manual pull.
2. Processing trong CIS: translation, review, mapping, anomaly, approval.
3. Outbound: đẩy dữ liệu đã được CIS xử lý ra hệ thống đích.
   - CIS -> Jira trong MVP.
   - CIS -> Backlog để sau MVP.
4. Sync job và sync journal dùng để audit, retry và debug cả inbound lẫn outbound.

### Đề xuất nhóm endpoint MVP

Ghi chú: danh sách dưới đây là nhóm endpoint được đề xuất trong quá trình phỏng vấn. Contract chính thức khi implement dùng prefix `/api/v1` theo `11-api-contract.md`.

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/alerts`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `POST /api/projects/:projectId/sync/enable`
- `POST /api/projects/:projectId/sync/disable`

Issues:

- `GET /api/issues`
- `GET /api/issues/:issueId`
- `GET /api/projects/:projectId/issues`
- `POST /api/issues/:issueId/force-approve`
- `POST /api/issues/:issueId/mark-duplicate`

Translation review:

- `GET /api/translation-queue`
- `GET /api/translation-queue/:queueId`
- `POST /api/translation-queue/:queueId/approve`
- `POST /api/translation-queue/:queueId/reject`
- `POST /api/translation-queue/:queueId/retranslate`

Mapping approval:

- `GET /api/mapping-rules`
- `POST /api/mapping-rules/:ruleId/approve`
- `POST /api/mapping-rules/:ruleId/reject`
- `POST /api/mapping-rules/bulk-approve`

Anomalies:

- `GET /api/anomalies`
- `GET /api/anomalies/:anomalyId`
- `POST /api/anomalies/:anomalyId/ignore`
- `POST /api/anomalies/:anomalyId/resolve`

CIS inbound / Pull into CIS:

- `POST /api/projects/:projectId/backlog/pull`
- `POST /api/projects/:projectId/backlog/issues/:backlogIssueKey/pull`
- `POST /api/projects/:projectId/jira/pull`
- `POST /api/projects/:projectId/jira/issues/:jiraIssueKey/pull`

CIS outbound / Push from CIS:

- `POST /api/issues/:issueId/dry-run/jira`
- `POST /api/issues/:issueId/sync/jira`
- `POST /api/sync-jobs/:jobId/retry`

Sync jobs / journal:

- `GET /api/sync-jobs`
- `GET /api/sync-jobs/:jobId`
- `GET /api/sync-journal`
- `GET /api/issues/:issueId/sync-journal`

Attachments:

- `GET /api/issues/:issueId/attachments`
- `GET /api/attachments/:attachmentId/download`

Webhooks:

- `POST /webhooks/backlog`
- `POST /webhooks/jira`

## 18. Admin auth

### Quyết định

- MVP dùng simple JWT auth với email + password.
- Chỉ cần admin login trong MVP, chưa cần role phức tạp.

### Đề xuất tối thiểu

- Lưu admin user trong SQLite.
- Password hash bằng bcrypt/argon2, không lưu plain text.
- JWT access token thời hạn ngắn-vừa, ví dụ 8-12 giờ.
- JWT dùng Bearer token trong `Authorization` header theo quyết định API contract ở nhóm 19.
- Có biến môi trường `JWT_SECRET`.

## 19. Interview bổ sung trước khi tạo implementation spec

Mục tiêu của nhóm câu hỏi này là lấy đủ context để tạo 4 file spec trước khi code sâu:

- `docs/work/09-runtime-config.md`
- `docs/work/10-state-machine.md`
- `docs/work/11-api-contract.md`
- `docs/work/12-webhook-verification.md`

### 19.1. Runtime config

File đích: `09-runtime-config.md`

Cần chốt:

1. Danh sách biến môi trường bắt buộc cho app:
   - server port
   - database path
   - storage path
   - JWT secret
   - webhook verify flag
   - OpenAI API key/model default

2. Cách lưu credential cho Backlog/Jira:
   - lưu trực tiếp encrypted trong SQLite
   - lưu trong `.env` rồi project config chỉ giữ key tham chiếu
   - lưu trong file config local không commit

3. Project seed config cần format nào:
   - JSON
   - TOML
   - JS/CommonJS config

4. Khi app start lần đầu:
   - có tự tạo admin user từ env không
   - có tự chạy migration không
   - có tự tạo storage directory không
   - nếu thiếu config bắt buộc thì fail fast hay warning

5. Cấu trúc storage chính thức:
   - attachment root
   - log root nếu có
   - backup root nếu có

### Câu trả lời đã chốt

| Mục | Quyết định |
| --- | --- |
| Cách chạy service | Dùng PM2/process manager cho MVP trên server nội bộ. |
| SQLite path mặc định | `storage/db/cis.sqlite`. |
| Attachment storage root | `storage/attachments`. |
| Lưu credential Backlog/Jira/OpenAI | Secret thật lưu trong `.env`. |
| Admin user lần đầu | Tự tạo admin user từ env, đồng thời có CLI tạo admin riêng. |
| Migration | Auto migrate khi app start, đồng thời có command migrate riêng. |
| Thiếu config bắt buộc | Fail fast nếu thiếu config critical. |
| Project seed config | JSON. |

Ghi chú triển khai:

- Các secret thật không lưu trong git.
- Project config trong SQLite có thể tham chiếu tên biến env nếu cần nhiều project/token.
- App nên tự tạo storage directory cần thiết khi start.

### 19.2. State machine

File đích: `10-state-machine.md`

Cần chốt:

1. Transition chính của `issues.status`:
   - `ingested`
   - `pending_translate`
   - `pending_review`
   - `approved`
   - `syncing`
   - `synced`
   - `update_pending`
   - `conflict`
   - `archived`

2. Transition của `translation_queue.review_status`:
   - `pending`
   - `ai_draft`
   - `approved`
   - `rejected`
   - `edited`

3. Transition của `sync_jobs.status`:
   - `pending`
   - `running`
   - `success`
   - `failed`
   - `cancelled`

4. Transition của comment/attachment:
   - khi nào `pending`
   - khi nào `synced`
   - khi nào `skipped`
   - khi nào `failed`

5. Rule block/unblock:
   - mapping gap block tới khi nào
   - anomaly critical block tới khi nào
   - translation rejected có quay lại AI draft không
   - attachment failed có block issue sync không

6. Action nào được phép force:
   - force approve issue
   - ignore anomaly
   - retry job
   - cancel job

### Câu trả lời đã chốt

| Mục | Quyết định |
| --- | --- |
| Issue status model | `issues.status` là trạng thái nghiệp vụ chính; translation/sync dùng bảng riêng. |
| Backlog issue mới | Flow chính: `ingested` -> `pending_translate` -> `pending_review` -> `approved` -> `synced`. |
| Translation reject | Reject giữ trạng thái `rejected`, admin nhập note, sau đó bấm `retranslate`; có cơ chế chuyển sang manual. |
| Mapping gap | Block toàn bộ issue cho đến khi mapping được approve. |
| Attachment failure | Không block issue sync; issue vẫn sync, attachment retry riêng, Jira description ghi attachment pending. |
| Critical anomaly | Không đổi issue status; worker check `anomaly_log` còn open/blocking trước outbound sync. |
| Retry failed job | Retry bằng cách set job `failed` về `pending`, audit bằng `sync_journal`. |
| Cancel job | MVP chỉ cancel job `pending`, không cancel job `running`. |
| Force approve | Cho phép force approve nhưng không bypass missing required mapping; ghi audit/journal. |

Ghi chú reconcile với API contract:

- API contract đã chốt không bắt buộc `reason` cho action ghi. Vì vậy `reason` cho force/ignore/reject là optional trong MVP, nhưng endpoint vẫn nên nhận nếu UI/Codex gửi lên để tăng audit.

### 19.3. API contract

File đích: `11-api-contract.md`

Cần chốt:

1. Response envelope chuẩn:
   - `{ "data": ... }`
   - `{ "data": ..., "meta": ... }`
   - format lỗi `{ "error": { "code", "message", "details" } }`

2. Pagination/filter/sort cho list API:
   - issues
   - translation queue
   - mapping rules
   - anomalies
   - sync jobs
   - sync journal

3. Request/response chi tiết cho các action ghi:
   - approve translation
   - reject/retranslate
   - approve/reject mapping
   - dry-run Jira
   - sync Jira thật
   - retry job
   - ignore/resolve anomaly
   - force approve issue

4. Auth behavior:
   - cookie hay bearer token
   - CSRF có cần không nếu dùng cookie
   - session expire response code

5. Audit behavior:
   - action nào bắt buộc ghi `sync_journal`
   - action nào ghi `executed_by`
   - có cần `reason` khi force/ignore/reject không

6. Codex operation:
   - endpoint nào Codex có thể gọi chỉ đọc không cần confirm
   - endpoint nào Codex phải hỏi user confirm trước khi gọi
   - response nào cần đủ thông tin để Codex giải thích lý do lỗi

### Câu trả lời đã chốt

| Mục | Quyết định |
| --- | --- |
| Response envelope | Detail/action trả `{ "data": ... }`; list trả `{ "data": [...], "meta": ... }`. |
| Error format | `{ "error": { "code", "message", "details", "correlation_id" } }`. |
| API versioning | Dùng `/api/v1/...`; webhook giữ `/webhooks/backlog`, `/webhooks/jira`. |
| Pagination | Dùng `page` + `page_size`. |
| Filter/sort | Dùng query params phẳng, ví dụ `project_id`, `status`, `q`, `sort`. |
| Auth API | Dùng Bearer token header. |
| Reason cho action ghi | Không action nào bắt buộc `reason` trong MVP; có thể nhận optional reason. |
| Idempotency action ghi | Backend tự dedupe theo issue/action, không bắt buộc client gửi `Idempotency-Key`. |
| Codex operation safety | Read-only gọi thẳng nếu đã auth; write/sync/approve cần user confirm. |
| Dry-run response | Trả payload + validation + missing mapping/attachment + warnings. |
| Audit action ghi | Action ghi quan trọng ghi `sync_journal` hoặc audit tương đương. |
| Endpoint granularity | Dùng endpoint action rõ như `/approve`, `/reject`, `/retry`. |
| Endpoint groups MVP | Giữ đủ các nhóm endpoint MVP đã đề xuất: auth, dashboard, projects, issues, translation, mapping, anomaly, inbound pull, outbound sync, jobs/journal, attachments. |

Ghi chú triển khai:

- Vì auth dùng Bearer token, UI cần lưu token cẩn thận. MVP có thể dùng memory/local secure pattern tùy frontend; không dùng cookie/httpOnly trong quyết định hiện tại.
- Backend vẫn nên tạo `correlation_id` cho mọi request để log, journal và API error cùng trace được.

### 19.4. Webhook verification

File đích: `12-webhook-verification.md`

Cần chốt:

1. Backlog webhook verification:
   - dùng header nào
   - dùng shared secret hay signature HMAC
   - payload nào dùng để tính hash/signature

2. Jira webhook verification:
   - dùng secret URL/token
   - dùng basic auth/header
   - có signature native không

3. Express raw body handling:
   - route webhook cần giữ raw body như thế nào
   - verify chạy trước JSON parse hay sau JSON parse

4. Response code:
   - verify fail trả `401` hay `403`
   - duplicate trả `200` hay `202`
   - unmatched project trả `200`/`202` nhưng không ingest
   - internal error trả gì để hệ thống ngoài retry hợp lý

5. Dedupe:
   - ưu tiên event id/header id nào
   - fallback `payload_hash` gồm những field nào
   - duplicate có ghi journal không hay chỉ update `webhook_events`

6. Security log:
   - có lưu raw payload khi verify fail không
   - có mask secret/header nhạy cảm không
   - retention cho rejected webhook

### Câu trả lời đã chốt

| Mục | Quyết định |
| --- | --- |
| Backlog verification | Dùng header secret, ví dụ `X-Webhook-Token`. |
| Jira verification | Dùng secret trong URL. |
| Express raw body handling | Lưu cả raw string và parsed body bằng verify callback/body parser phù hợp. |
| Verify fail payload | Vẫn lưu raw payload với status `rejected`. |
| Response code | Theo recommend: verify fail `401/403`; duplicate `200`; unmatched project `202`; lỗi trước khi lưu raw `500`; lỗi sau khi đã lưu raw/enqueue nội bộ `202`. |
| Dedupe chính | Ưu tiên event id/header id nếu có. |
| Duplicate journal | Duplicate chỉ update `webhook_events`, không ghi `sync_journal`. |
| Secret/header logging | Không log headers webhook trong MVP. |

Ghi chú còn cần cẩn thận khi viết spec:

- Vì Jira dùng secret trong URL, logger/proxy phải tránh log full URL hoặc phải mask query token.
- Dedupe fallback khi không có event id/header id chưa được chốt sâu; khi viết `12-webhook-verification.md`, nên đề xuất fallback bằng payload hash/normalized dedupe key nhưng ghi rõ đây là fallback kỹ thuật.
- Raw payload bị rejected có thể chứa dữ liệu không tin cậy; vẫn áp dụng retention và không hiển thị tràn lan trong UI.

### Kết quả mong muốn

Sau khi trả lời các câu hỏi trên, tạo 4 file spec theo thứ tự:

1. `09-runtime-config.md`
2. `10-state-machine.md`
3. `12-webhook-verification.md`
4. `11-api-contract.md`

Thứ tự này giúp chốt nền runtime và trạng thái trước, sau đó mới viết webhook/API contract chi tiết.
