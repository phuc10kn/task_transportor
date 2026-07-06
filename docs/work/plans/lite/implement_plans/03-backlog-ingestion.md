# Phase 03 - Backlog ingestion

## Mục tiêu

Kéo dữ liệu Backlog chủ động vào CIS bằng manual pull. Scheduled pull được thêm sau khi manual pull ổn và phải dùng lại cùng normalizer/job path.

## Làm trong phase này

- Tạo module `Backlog`.
- Tạo Backlog API client đọc credential từ env name trong project config.
- Tạo endpoint pull một issue trong phạm vi project: `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull`.
- Tạo endpoint pull theo project: `POST /api/v1/projects/:projectId/backlog/pull`.
- Tạo scheduled pull optional sau khi manual pull ổn.
- Scheduled pull dùng project config, `pull_state`, filter JSON và Backlog API issue list để tìm issue candidate.
- Tạo Backlog normalizer chung cho issue/comment/attachment metadata.
- Tạo dedupe theo project, issue key, updated timestamp và payload hash.
- Worker xử lý job `manual_pull`.
- Upsert `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`.
- Download file attachment thật từ Backlog về storage CIS khi credential/API cho phép.
- Ghi `sync_journal`.

## Scheduled pull detail

Scheduled pull là trigger tự động thay cho webhook, không sync trực tiếp sang Jira.

Nguồn dữ liệu:

- `projects` để lấy config Backlog, credential env name và filter.
- `pull_state` để lấy `last_successful_pull_at`, cursor/page state và lỗi gần nhất.
- Backlog API để query danh sách issue updated theo project.

Project đủ điều kiện scheduled pull khi:

- `enabled = true`
- `sync_enabled = true`
- `scheduled_pull_enabled = true`
- `backlog_project_key` có cấu hình
- `backlog_api_key` được lưu trong DB project config
- đã đến `scheduled_pull_interval_minutes`

Window:

```text
updated_since = last_successful_pull_at - pull_updated_since_window_minutes
```

Backlog query filter mặc định:

- Project: `backlog_project_key`.
- Updated since: `updated_since`.
- Sort: `updated`.
- Order: `asc`.
- Page size: từ `scheduled_pull_filter_json.page_size`, mặc định 100.
- `include_closed = true`.
- Attachment: metadata only.

Filter nâng cao từ `scheduled_pull_filter_json`:

- `statuses`
- `issue_types`
- `priorities`
- `include_closed`
- `include_attachments`
- `page_size`

Flow:

```text
scheduled tick
  -> lọc project đủ điều kiện
  -> tính updated_since với overlap window
  -> query Backlog issue list theo project + updated_since + filter
  -> paginate
  -> enqueue từng issue candidate vào sync_jobs
  -> worker manual_pull lấy full issue/comment/attachment metadata
  -> dedupe/upsert CIS
  -> update pull_state sau page/pull thành công
```

Scheduled pull không tạo translation/sync Jira trực tiếp. Nó chỉ enqueue issue candidate để worker ingest bằng cùng normalizer với manual pull.

## Deliverables

- Module `Backlog` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Backlog API client đọc credential qua env name.
- Endpoint pull issue trong phạm vi project.
- Endpoint pull project bắt buộc.
- Backlog fixture/fake client để test không cần API thật.
- Backlog normalizer.
- Handler `manual_pull` đăng ký vào worker phase 02.
- Dedupe helper cho pull snapshot/payload hash.
- Scheduled pull scanner dùng `projects`, `pull_state` và Backlog issue list.
- Scheduled pull filter parser.
- Upsert CIS cho issue/revision/comment/attachment metadata.
- Attachment download thật Backlog -> CIS storage:
  - Download chạy inline trong worker `manual_pull` ngay sau khi issue/comment/attachment metadata được upsert vào CIS.
  - Không tạo job queue riêng cho download Backlog -> CIS ở Phase 03.
  - Lưu file dưới `storage/attachments/<project_id>/<issue_id>/<attachment_id>/`.
  - Tính `sha256`.
  - Cập nhật `stored_path`, `download_status`, `sha256`, `size_bytes`.
  - `download_status` mô tả trạng thái tải file từ Backlog về CIS.
  - `sync_status` mô tả trạng thái đẩy attachment từ CIS sang Jira, nên sau Phase 03 vẫn giữ `pending`.
  - Download fail không làm fail toàn bộ issue ingest; ghi `download_status = failed` và `error_message`.
  - Có API retry để tải lại attachment bị fail/pending: `POST /api/v1/attachments/:attachmentId/retry-download`.
- Backlog `externalFileLinks` không phải attachment file thật:
  - Không download về `storage/attachments`.
  - Không dùng `issue_attachments.download_status`.
  - Nếu cần giữ link để hiển thị/sync description, lưu dạng metadata trong `fields_json.external_file_links.backlog` khi normalizer hỗ trợ.
- Test script tự động ingest fixture Backlog vào CIS.

## Chốt chặn

Phase này đạt khi một Backlog issue thật hoặc fixture có thể đi vào CIS đầy đủ, duplicate pull không tạo dữ liệu trùng, và issue mới đi tới `ingested`. Translation là option riêng sau khi dữ liệu đã vào CIS, không tham gia vào quá trình `System -> CIS`.

Không đi phase 04 nếu:

- Pull duplicate tạo revision/comment/outbound job trùng.
- Normalizer trộn logic Backlog riêng vào CIS quá sâu.
- Attachment metadata chưa lưu được.
- Attachment file thật chưa download được về CIS storage bằng fake/fixture hoặc API thật khi có credential.
- Nhầm `issue_attachments.sync_status = pending` là lỗi của Phase 03. Phase 03 chỉ hoàn tất Backlog -> CIS khi `download_status = downloaded`; `sync_status` chờ Phase 06 CIS -> Jira.
- Pull job không có journal.
- Worker xử lý lỗi không retry/fail rõ.
- Scheduled pull không dùng `pull_state` hoặc không có overlap window.
- Scheduled pull bỏ qua filter project/config và quét quá rộng.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [x] Test script tự động của phase 03 pass với Backlog fixture/fake client, ví dụ `npm run verify:phase03`.
- [x] Test `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull` tạo job `backlog -> cis` cho đúng project.
- [x] Test `POST /api/v1/projects/:projectId/backlog/pull` enqueue issue/page candidates cho đúng project.
- [x] Test worker chạy job và tạo issue nội bộ.
- [x] Test issue có `backlog_issue_key`, `fields_json`, revision hiện tại.
- [x] Test comment Backlog được lưu vào `issue_comments`.
- [x] Test attachment metadata được lưu vào `issue_attachments`.
- [x] Test attachment file thật được download vào `storage/attachments` và có `sha256`.
- [x] Test attachment download fail không làm fail toàn bộ issue ingest.
- [x] Test retry API download attachment fail/pending thành công mà không cần enqueue job riêng.
- [x] Test `manual_pull` không tự tạo `translation_queue` hoặc job `translate`.
- [x] Test pull cùng issue lần hai khi không đổi dữ liệu không tạo revision/comment trùng.
- [x] Test Backlog credential thiếu thì job fail có journal, không làm app crash.
- [x] Test scheduled pull chỉ chọn project đủ điều kiện.
- [x] Test scheduled pull query theo `updated_since` và enqueue issue candidate.
- [x] Test scheduled pull update `pull_state` sau khi page/pull thành công.

### Manual check (Người review)

- [x] Gọi endpoint pull một issue theo project từ API và thấy job được tạo.
- [x] Chạy worker local và thấy issue xuất hiện trong CIS.
- [x] Gọi endpoint pull project và thấy các issue/page candidate được enqueue đúng project.
- [x] Pull lại cùng issue để xác nhận không sinh revision/comment trùng.
- [x] Kiểm tra journal của job pull có đủ trạng thái và lỗi nếu có.
- [x] Thêm attachment thật vào Backlog issue, pull lại issue và xác nhận file được download về `storage/attachments`.
- [x] Kiểm tra DB `issue_attachments` có `download_status = downloaded`, `stored_path`, `sha256`, `size_bytes`.
- [x] Tạo hoặc mô phỏng attachment download fail, gọi `POST /api/v1/attachments/:attachmentId/retry-download` và xác nhận retry không tạo thêm `sync_jobs`.

## Ghi chú thiết kế

- Lite không bật webhook bắt buộc.
- Scheduled pull có thể làm sau manual pull, nhưng phải dùng lại normalizer và job path.
- Translation là capability tùy chọn sau ingest; Phase 03 chỉ chịu trách nhiệm đưa dữ liệu nguồn vào CIS.
