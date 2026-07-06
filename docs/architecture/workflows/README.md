# Workflows

Folder này gom các workflow hiện tại của `task_transportor`.

Mỗi file `.md` trong folder mô tả đúng một workflow ở mức kiến trúc áp dụng cho repo hiện tại, kèm use case và biểu đồ tương ứng.

## Danh sách workflow

1. [usecase-map.md](usecase-map.md) - bản đồ use case tổng hợp của dự án hiện tại.
2. [backlog-manual-pull.md](backlog-manual-pull.md) - kéo một issue Backlog vào CIS bằng manual pull.
3. [backlog-project-pull.md](backlog-project-pull.md) - quét một project Backlog và enqueue ingest theo project.
4. [backlog-scheduled-pull.md](backlog-scheduled-pull.md) - scheduled pull theo project config.
5. [translation-review.md](translation-review.md) - tạo draft dịch, review, approve hoặc manual edit.
6. [issue-editor-canonical-edit.md](issue-editor-canonical-edit.md) - chỉnh canonical data trong Issue Editor.
7. [jira-dry-run.md](jira-dry-run.md) - build payload preview và validate trước khi sync Jira.
8. [cis-to-jira-sync.md](cis-to-jira-sync.md) - sync issue từ CIS sang Jira sau khi pass pre-check.

## Ghi chú

- Folder này chỉ mô tả workflow hiện tại của dự án.
- Webhook inbound là scope phase sau, nên chưa được ghi thành workflow chính tại đây.
- Pattern generic để thiết kế workflow vẫn nằm ở [../custom_modular_monolith_theory/flow_template.md](../custom_modular_monolith_theory/flow_template.md).
