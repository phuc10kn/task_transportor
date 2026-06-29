# Phase 01 - Auth và Projects

## Mục tiêu

Có admin login bằng JWT và quản lý project config đủ để các phase sau biết pull Backlog, dịch, mapping và sync Jira theo project nào.

## Làm trong phase này

- Tạo module `Auth`.
- Tạo bảng admin user hoặc tương đương.
- Tạo bootstrap admin từ `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Tạo login/logout/me API.
- Tạo JWT middleware.
- Tạo module `Projects`.
- Tạo bảng `projects`.
- Tạo seed/import project JSON.
- Tạo CRUD project config cơ bản.
- Tạo action bật/tắt `sync_enabled`.
- Tạo config pull chủ động cho project: manual pull, scheduled pull, overlap window và filter JSON.

## Project config cần có

Các field pull/sync bắt buộc để phase 03 dùng được:

- `manual_pull_enabled`
- `scheduled_pull_enabled`
- `scheduled_pull_interval_minutes`
- `pull_updated_since_window_minutes`
- `scheduled_pull_filter_json`

`scheduled_pull_filter_json` mặc định:

```json
{
  "statuses": [],
  "issue_types": [],
  "priorities": [],
  "include_closed": true,
  "include_attachments": "metadata_only",
  "page_size": 100
}
```

Ý nghĩa:

- Mảng rỗng nghĩa là không filter thêm theo field đó.
- `include_closed = true` để không miss issue đã đóng nhưng vẫn có update cần sync.
- `include_attachments = "metadata_only"` vì Lite chưa bắt buộc upload attachment thật sang Jira.
- `page_size` giới hạn số issue mỗi request/page khi scheduled pull.

## Deliverables

- Module `Auth` với API boundary.
- Module `Projects` với API boundary.
- Migration cho admin user và projects.
- Admin bootstrap/CLI.
- Auth middleware Bearer JWT.
- Project seed/import JSON mẫu.
- API CRUD project và bật/tắt sync.
- Config pull chủ động trong project CRUD/seed.
- Test script tự động cho login, protected route và project CRUD tối thiểu.

## Chốt chặn

Phase này đạt khi admin đăng nhập được, token bảo vệ API đúng, project config lưu trong SQLite và không lưu secret thật vào DB.

Không đi phase 02 nếu:

- Password còn lưu plain text.
- Project config lưu Backlog/Jira token thật thay vì tên biến env.
- API protected vẫn truy cập được khi thiếu token.
- Chưa có cách tạo/import project đầu tiên.
- Project config chưa có field pull chủ động tối thiểu cho phase 03.

## Checklist hoàn thành phase

### Unit test check (Agent)

- [ ] Test script tự động của phase 01 pass, ví dụ `npm run verify:phase01`.
- [ ] Test bootstrap/CLI tạo được admin.
- [ ] Test `POST /api/v1/auth/login` trả JWT hợp lệ.
- [ ] Test `GET /api/v1/auth/me` trả admin hiện tại khi có Bearer token.
- [ ] Test API project khi thiếu token trả `401`.
- [ ] Test tạo project với `translation_provider = codex_exec`.
- [ ] Test tạo project với `manual_pull_enabled`, `scheduled_pull_enabled`, `scheduled_pull_interval_minutes`, `pull_updated_since_window_minutes`.
- [ ] Test tạo project với `scheduled_pull_filter_json` mặc định và đọc lại đúng.
- [ ] Test bật/tắt sync project bằng API.
- [ ] Test DB chỉ lưu `backlog_api_key_env`, `jira_email_env`, `jira_api_token_env`, không lưu secret thật.

### Manual check (Người review)

- [ ] Tạo admin bằng bootstrap/CLI trên máy local.
- [ ] Login bằng API và nhận JWT.
- [ ] Gọi `/auth/me` bằng Bearer token và thấy đúng admin.
- [ ] Tạo project từ API với pull config đầy đủ.
- [ ] Bật/tắt sync project từ API và đọc lại đúng trạng thái.
- [ ] Kiểm tra nhanh DB/config để xác nhận không có secret thật bị lưu.

## Ghi chú thiết kế

- Lite chỉ cần admin, chưa cần role phức tạp.
- `translation_provider` mặc định là `codex_exec`.
- Webhook secret chỉ là field optional/reserved cho Medium.
