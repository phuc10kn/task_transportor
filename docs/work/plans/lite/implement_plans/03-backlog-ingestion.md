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
- Tạo `translation_queue` cho summary, description, comment cần dịch.
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
- `backlog_api_key_env` tồn tại trong env
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

- Module `Backlog` với API boundary.
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
- Test script tự động ingest fixture Backlog vào CIS.

## Chốt chặn

Phase này đạt khi một Backlog issue thật hoặc fixture có thể đi vào CIS đầy đủ, duplicate pull không tạo dữ liệu trùng, và issue mới đi tới `pending_translate`.

Không đi phase 04 nếu:

- Pull duplicate tạo revision/comment/outbound job trùng.
- Normalizer trộn logic Backlog riêng vào CIS quá sâu.
- Attachment metadata chưa lưu được.
- Pull job không có journal.
- Worker xử lý lỗi không retry/fail rõ.
- Scheduled pull không dùng `pull_state` hoặc không có overlap window.
- Scheduled pull bỏ qua filter project/config và quét quá rộng.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động của phase 03 pass với Backlog fixture/fake client, ví dụ `npm run verify:phase03`.
- [ ] Test `POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/pull` tạo job `backlog -> cis` cho đúng project.
- [ ] Test `POST /api/v1/projects/:projectId/backlog/pull` enqueue issue/page candidates cho đúng project.
- [ ] Test worker chạy job và tạo issue nội bộ.
- [ ] Test issue có `backlog_issue_key`, `fields_json`, revision hiện tại.
- [ ] Test comment Backlog được lưu vào `issue_comments`.
- [ ] Test attachment metadata được lưu vào `issue_attachments`.
- [ ] Test `translation_queue` có item cho summary, description, comment.
- [ ] Test pull cùng issue lần hai khi không đổi dữ liệu không tạo revision/comment trùng.
- [ ] Test Backlog credential thiếu thì job fail có journal, không làm app crash.
- [ ] Test scheduled pull chỉ chọn project đủ điều kiện.
- [ ] Test scheduled pull query theo `updated_since` và enqueue issue candidate.
- [ ] Test scheduled pull update `pull_state` sau khi page/pull thành công.

### Manual check (Người review)

- [ ] Gọi endpoint pull một issue theo project từ API và thấy job được tạo.
- [ ] Chạy worker local và thấy issue xuất hiện trong CIS.
- [ ] Gọi endpoint pull project và thấy các issue/page candidate được enqueue đúng project.
- [ ] Pull lại cùng issue để xác nhận không sinh revision/comment trùng.
- [ ] Kiểm tra journal của job pull có đủ trạng thái và lỗi nếu có.

## Ghi chú thiết kế

- Lite không bật webhook bắt buộc.
- Scheduled pull có thể làm sau manual pull, nhưng phải dùng lại normalizer và job path.
