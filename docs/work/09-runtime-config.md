# Runtime Config — Cấu hình chạy MVP

## Mục tiêu

File này chốt cách app Central Sync Hub chạy trong môi trường MVP nội bộ: process runtime, biến môi trường, đường dẫn database/storage, credential policy, bootstrap admin và migration.

## Runtime

MVP chạy như một Node.js service bằng PM2 hoặc process manager tương đương.

```text
npm start
pm2 start npm --name task-transportor -- start
```

Lý do:

- Phù hợp app Node/Express CommonJS hiện tại.
- Có auto restart và log process.
- Nhẹ hơn Docker/Windows service cho giai đoạn đầu.

Docker hoặc Windows service có thể bổ sung sau nếu môi trường triển khai yêu cầu.

## Biến môi trường

### Core bắt buộc

App phải fail fast nếu thiếu các biến core này trong runtime production:

| Biến | Mặc định | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | Có | `development`, `test`, `production`. |
| `PORT` | `3000` | Không | Port HTTP server. |
| `DATABASE_PATH` | `storage/db/cis.sqlite` | Có | SQLite database path. |
| `STORAGE_ROOT` | `storage` | Có | Runtime data root. |
| `ATTACHMENT_STORAGE_PATH` | `storage/attachments` | Có | Nơi lưu attachment thật. |
| `JWT_SECRET` | Không có | Có | Secret ký JWT admin token. |
| `WEBHOOK_VERIFY` | `true` | Không | Cho phép tắt verify khi dev/local. |

### Admin bootstrap

| Biến | Mặc định | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `ADMIN_EMAIL` | Không có | Khi DB chưa có admin | Email admin đầu tiên. |
| `ADMIN_PASSWORD` | Không có | Khi DB chưa có admin | Password admin đầu tiên, hash trước khi lưu. |

Nếu database chưa có admin user:

- Nếu có `ADMIN_EMAIL` và `ADMIN_PASSWORD`: tự tạo admin user.
- Nếu thiếu một trong hai biến: app fail fast trong production, warning trong development.

Ngoài bootstrap tự động, app cần có command riêng để tạo admin:

```text
npm run admin:create
```

### AI translation

| Biến | Mặc định | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Không có | Khi dùng `openai_api` | Secret thật lưu trong `.env`. |
| `OPENAI_TRANSLATION_MODEL` | Không chốt cứng | Không | Model mặc định nếu project không override. |

Nếu project bật `translation_provider = "openai_api"` nhưng thiếu `OPENAI_API_KEY`, translation job phải fail có kiểm soát, ghi lỗi vào job/journal và hiển thị trên Admin UI.

### Backlog/Jira credentials

Secret thật lưu trong `.env`. Project config trong SQLite có thể giữ tên biến env để tham chiếu token theo project.

Ví dụ:

```env
BACKLOG_WEC_API_KEY=...
JIRA_WEC_EMAIL=dev@example.com
JIRA_WEC_API_TOKEN=...
```

Project config lưu reference:

```json
{
  "backlog_api_key_env": "BACKLOG_WEC_API_KEY",
  "jira_email_env": "JIRA_WEC_EMAIL",
  "jira_api_token_env": "JIRA_WEC_API_TOKEN"
}
```

Lý do chọn cách này:

- Secret không nằm trong SQLite export thông thường.
- Admin UI có thể quản lý project config mà không cần hiển thị token.
- Dễ rotate token bằng cách đổi `.env` và restart service.

## Đường dẫn runtime

Mặc định:

```text
storage/
  db/
    cis.sqlite
  attachments/
    <project_id>/
      <issue_id>/
        <attachment_id>/
          original_filename.ext
  backups/
  logs/
```

Trong MVP:

- `storage/db/cis.sqlite` là database chính.
- `storage/attachments` là nơi lưu file thật.
- `storage/backups` dành cho backup SQLite thủ công/tài liệu vận hành.
- `storage/logs` optional nếu app ghi log file; nếu dùng PM2 logs thì không bắt buộc.

App phải tự tạo các directory cần thiết khi start.

## Project seed config

Seed config dùng JSON.

Ví dụ:

```json
{
  "projects": [
    {
      "id": "wecsy-main",
      "name": "WECSY Main",
      "enabled": true,
      "backlog_space_url": "https://example.backlog.com",
      "backlog_project_key": "ONE_KYORITSU",
      "backlog_issue_key_prefix": "ONE_KYORITSU-",
      "backlog_api_key_env": "BACKLOG_WEC_API_KEY",
      "jira_site_url": "https://example.atlassian.net",
      "jira_project_key": "WEC1",
      "jira_email_env": "JIRA_WEC_EMAIL",
      "jira_api_token_env": "JIRA_WEC_API_TOKEN",
      "translation_provider": "openai_api",
      "translation_model": "default",
      "source_language": "ja",
      "target_language": "vi"
    }
  ]
}
```

Seed config chỉ dùng để bootstrap/import ban đầu. Khi app chạy, SQLite là nguồn chính.

## Migration

MVP dùng `better-sqlite3` và migration SQL file tự quản.

Yêu cầu:

- Auto migrate khi app start.
- Có command riêng:

```text
npm run migrate
```

- Lưu migration đã chạy vào bảng:

```sql
CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Nếu migration fail:

- App không start trong production.
- Ghi log rõ version migration fail.
- Không chạy worker loop khi schema chưa sẵn sàng.

## Fail-fast policy

App phải fail fast khi thiếu config core:

- `DATABASE_PATH`
- `STORAGE_ROOT`
- `ATTACHMENT_STORAGE_PATH`
- `JWT_SECRET`

Các integration token như Backlog/Jira/OpenAI không làm toàn app fail nếu chưa có project nào cần dùng. Khi một project/job cần credential nhưng thiếu:

- Job fail có kiểm soát.
- Ghi `sync_journal` hoặc job error.
- Admin UI hiển thị lỗi cấu hình.

## Không commit

Không commit các file/đường dẫn sau:

- `.env`
- `.codex/config.toml`
- `storage/`
- database SQLite thật
- attachment thật
- backup thật
- API token, JWT secret, OpenAI API key, Backlog/Jira credential
