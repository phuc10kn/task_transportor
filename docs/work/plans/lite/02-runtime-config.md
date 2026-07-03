# Lite - Runtime và config

## Runtime

Lite dùng đúng runtime đã chốt cho MVP:

- Node.js CommonJS + Express.
- Một service duy nhất gồm API và worker loop nội bộ.
- Webhook receiver không bắt buộc trong Lite; nếu tạo sẵn route thì chỉ là optional/reserved cho Medium.
- SQLite bằng `better-sqlite3`.
- Migration SQL file tự quản.
- Auto migrate khi app start.
- Command riêng `npm run migrate`.
- Command migrate một lần để sync credential project từ tên biến env cũ sang DB mới: `npm run migrate:credentials-from-env`.
- Command hoặc script tạo admin `npm run admin:create`.
- App tự tạo các thư mục runtime cần thiết khi start.

## Storage

Path mặc định:

```text
storage/
  db/
    cis.sqlite
  attachments/
  backups/
  logs/
```

Lite phải tự tạo `storage/db`, `storage/attachments`, `storage/backups` và `storage/logs` nếu chưa tồn tại.

## Env bắt buộc

Core production:

- `NODE_ENV`
- `DATABASE_PATH`
- `STORAGE_ROOT`
- `ATTACHMENT_STORAGE_PATH`
- `JWT_SECRET`

Bootstrap/admin:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Integration:

- `WEBHOOK_VERIFY` để dành cho Medium hoặc bật nếu triển khai webhook optional.
- `CODEX_EXEC_COMMAND` cho translation provider chính, ví dụ command gọi Codex exec nội bộ.
- `CODEX_EXEC_TIMEOUT_SECONDS`
- `CODEX_EXEC_WORKDIR` nếu cần cố định thư mục chạy.
- `WORKER_ID`
- `WORKER_POLL_INTERVAL_MS`
- `WORKER_LOCK_TIMEOUT_SECONDS`
- `OPENAI_API_KEY` optional nếu bật provider fallback `openai_api`.
- `OPENAI_TRANSLATION_MODEL` optional nếu bật provider fallback `openai_api`.
- Backlog/Jira credential lưu bằng env riêng, được project config tham chiếu bằng tên biến env.

## Credential policy

- Core/app secret như `JWT_SECRET` vẫn lưu trong `.env`; credential Backlog/Jira theo project lưu trong DB project config.
- Project config trong SQLite lưu trực tiếp credential theo project: `backlog_api_key`, `jira_email`, `jira_api_token`. Các field cũ `*_env` chỉ còn là alias tương thích khi import/payload cũ gửi lên.
- Khi nâng cấp từ DB cũ đã lưu `backlog_api_key_env`, `jira_email_env`, `jira_api_token_env`, chạy `npm run migrate:credentials-from-env` trên server sau `npm run migrate` để copy giá trị thật từ `.env` vào cột DB mới. Command này không ghi đè credential đã có trong DB.
- Không commit `.env`, `storage/`, SQLite database thật, attachment thật, backup thật hoặc token.
- Thiếu config core thì app fail fast.
- Thiếu credential chỉ dùng cho project/job cụ thể thì job fail có kiểm soát, ghi lỗi vào job/journal và hiển thị trong UI.

## Project config Lite

Nguồn config:

- JSON seed để bootstrap/import ban đầu.
- SQLite là nguồn chính khi app chạy.
- Admin chỉnh config qua UI.

Field tối thiểu:

- `id`
- `name`
- `enabled`
- `sync_enabled`
- `backlog_space_url`
- `backlog_space_key`
- `backlog_project_key`
- `backlog_issue_key_prefix`
- `backlog_webhook_secret` optional/reserved cho Medium.
- `backlog_api_key`
- `jira_site_url`
- `jira_project_key`
- `jira_email`
- `jira_api_token`
- `jira_webhook_secret` optional/reserved cho Medium.
- `translation_ai_provider`, mặc định Lite là `deepseek`.
- `translation_ai_transport`, mặc định Lite là `openai_compatible`.
- `translation_ai_model` hoặc `translation_command_profile`, tùy provider.
- `source_language = "ja"`
- `target_language = "vi"`
- `translation_glossary_json` optional nhưng khuyến nghị có cho từng project để giữ ổn định thuật ngữ dịch Nhật -> Việt.
- `auto_translate`, mặc định Lite là `false`
- `require_translation_review`, mặc định Lite là `false`
- `require_mapping_approval`
- `mapping_scope = "global_with_project_override"`

`translation_glossary_json` là glossary riêng theo project. Mục tiêu:

- tránh LLM dịch lệch các thuật ngữ domain tiếng Nhật,
- giữ consistency giữa issue/comment cùng project,
- ưu tiên cách dịch đã được business chấp nhận.

Shape gợi ý:

```json
[
  { "source": "予約", "target": "đặt chỗ" },
  { "source": "管理画面", "target": "màn hình quản trị" },
  { "source": "施設", "target": "cơ sở" }
]
```

Glossary này không thay thế review của con người, nhưng phải được `collectTranslationContext()` nạp vào `context_bundle.glossary` trước khi gọi provider dịch.

Lite phải có action bật/tắt sync theo project. Khi `sync_enabled = false`, worker không chạy outbound sync thật cho project đó.

## Pull config

Vì Lite không bắt buộc dùng webhook, project cần cấu hình pull chủ động:

- `manual_pull_enabled`
- `scheduled_pull_enabled`
- `scheduled_pull_interval_minutes`, ví dụ 5-15 phút nếu bật.
- `last_backlog_pull_at` hoặc bảng trạng thái pull tương đương.
- `pull_updated_since_window_minutes` để tránh miss update do lệch thời gian.
- `scheduled_pull_filter_json` để filter issue list khi scheduled pull.

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

Scheduled pull là optional trong Lite. Nếu chưa bật scheduler, admin vẫn phải pull theo issue hoặc theo project từ UI.

`include_attachments = "metadata_only"` trong filter là cấu hình cho bước scan/list candidate. Nó không có nghĩa là worker không được tải file; khi full issue được pull, Phase 03 có thể download attachment thật từ Backlog về CIS storage. Upload attachment sang Jira vẫn thuộc Phase 06/Medium.
