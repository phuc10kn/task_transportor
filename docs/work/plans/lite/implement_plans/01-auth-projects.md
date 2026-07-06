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
- `translation_glossary_json` để lưu glossary dịch riêng theo project

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
- `include_attachments = "metadata_only"` là cấu hình cho bước scan/list candidate; khi worker pull full issue, Phase 03 vẫn có thể download file Backlog -> CIS. Upload attachment sang Jira chưa bắt buộc trong Lite.
- `page_size` giới hạn số issue mỗi request/page khi scheduled pull.

`translation_glossary_json` mặc định là mảng rỗng. Khi có cấu hình, mỗi entry phải có `source` và `target`; `notes` là optional:

```json
[
  { "source": "予約", "target": "đặt chỗ" },
  { "source": "管理画面", "target": "màn hình quản trị", "notes": "Dùng cho admin UI" }
]
```

Project CRUD chỉ lưu glossary này như config. Module `Translation` sẽ nạp nó vào `context_bundle.glossary` khi chạy job dịch.

## Deliverables

- Module `Auth` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Module `Projects` theo [module_structure.md](../../../../architecture/custom_modular_monolith_theory/module_structure.md) và [implement_rules.md](../../../../architecture/custom_modular_monolith_theory/implement_rules.md).
- Migration cho admin user và projects.
- Admin bootstrap/CLI.
- Auth middleware Bearer JWT.
- Project seed/import JSON mẫu.
- API CRUD project và bật/tắt sync.
- Config pull chủ động trong project CRUD/seed.
- Test script tự động theo capability cho login, protected route và project CRUD tối thiểu.

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

- [x] Test script tự động của phase 01 pass, ví dụ `npm run verify:phase01` (alias tới `npm run verify:auth` và `npm run verify:projects`).
- [x] Test bootstrap/CLI tạo được admin.
- [x] Test `POST /api/v1/auth/login` trả JWT hợp lệ.
- [x] Test `GET /api/v1/auth/me` trả admin hiện tại khi có Bearer token.
- [x] Test API project khi thiếu token trả `401`.
- [x] Test tạo project mặc định với `translation_ai_provider = deepseek`, `translation_ai_transport = openai_compatible`, `translation_ai_model = deepseek-v4-flash`, và vẫn tạo được project explicit `codex_exec`.
- [x] Test tạo project với `manual_pull_enabled`, `scheduled_pull_enabled`, `scheduled_pull_interval_minutes`, `pull_updated_since_window_minutes`.
- [x] Test tạo project với `scheduled_pull_filter_json` mặc định và đọc lại đúng.
- [x] Test tạo project với `translation_glossary_json` và đọc lại đúng.
- [x] Test bật/tắt sync project bằng API.
- [x] Test DB lưu trực tiếp `backlog_api_key`, `jira_email`, `jira_api_token`; các field `*_env` chỉ còn alias tương thích đầu vào cũ.

### Manual check (Người review)

- [x] Tạo admin bằng bootstrap/CLI trên máy local.
- [x] Login bằng API và nhận JWT.
- [x] Gọi `/auth/me` bằng Bearer token và thấy đúng admin.
- [x] Tạo project từ API với pull config đầy đủ.
- [x] Bật/tắt sync project từ API và đọc lại đúng trạng thái.
- [x] Kiểm tra nhanh DB/config để xác nhận không có secret thật bị lưu.

## Ghi chú thiết kế

- Lite chỉ cần admin, chưa cần role phức tạp.
- `translation_ai_provider` mặc định là `deepseek`, `translation_ai_transport` mặc định là `openai_compatible`, `translation_ai_model` mặc định là `deepseek-v4-flash`.
- Webhook secret chỉ là field optional/reserved cho Medium.
