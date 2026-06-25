# backlog2jira — Tổng quan

## backlog2jira là gì?

**backlog2jira** là một bộ công cụ CLI (zero npm dependencies) được thiết kế để đồng bộ issue từ **Backlog** (Nulab) sang **Jira** (Atlassian) với trọng tâm là **an toàn, kiểm soát và truy xuất nguồn gốc**.

Nó không phải là một connector real-time hay một service chạy nền. Nó là một **toolkit cho AI agent (Codex)** — cung cấp các building blocks để agent có thể đọc config, validate issue, build payload Jira, quản lý trạng thái đồng bộ qua SQLite, và ghi lại audit trail cho mọi hành động.

## Tại sao lại có tool này?

Dự án sử dụng **Backlog** làm hệ thống quản lý issue chính (của khách hàng Nhật), nhưng team phát triển lại làm việc trên **Jira**. Mỗi ngày có một lượng issue mới được tạo trên Backlog cần được đồng bộ sang Jira để team dev tracking. Làm thủ công thì mất thời gian và dễ sai sót.

**backlog2jira** ra đời để tự động hóa quy trình đó, với một số nguyên tắc:

- **Dry-run mặc định**: Không bao giờ tạo issue thật trên Jira nếu không có flag `--allow-create` + xác nhận Jira project key
- **Guardrails**: Mọi issue đều được kiểm tra tính hợp lệ trước khi mapping — project key, issue type, status, priority phải khớp với config
- **Mapping linh hoạt**: Backlog issue type → Jira issue type không nhất thiết phải 1-1. Có thể map nhiều Backlog type vào cùng một Jira type (VD: tất cả các type của dự án Wecsy đều map thành `Task`)
- **State tracking**: SQLite database lưu vết từng issue đã tạo, comment đã sync, và mọi sự kiện đồng bộ — tránh tạo trùng lặp
- **Per-project isolation**: Mỗi dự án có config JSON riêng, instruction file riêng, và state được phân tách bằng `project_id`

## Kiến trúc tổng quan

```
[Backlog Issues JSON]  ──►  src/cli.js  ──►  [Jira Payload JSON]
                                   │
                          src/config.js (đọc & validate config)
                          src/guardrails.js (kiểm tra an toàn)
                          src/mapper.js (build payload)
                                   │
                          src/state-cli.js ──► src/state-db.js ──► src/sqlite.js ──► SQLite DB
                                                                                         │
                                                                              migrations/001_init.sql
```

## Các module chính

| Module | Vai trò |
|--------|---------|
| `src/config.js` | Đọc và validate project config JSON |
| `src/guardrails.js` | Kiểm tra issue có hợp lệ để mapping không |
| `src/mapper.js` | Build Jira payload từ Backlog issue |
| `src/cli.js` | CLI entry point, orchestrate luồng chính |
| `src/sqlite.js` | Wrapper low-level cho sqlite3 CLI |
| `src/state-db.js` | CRUD + queries cho state database |
| `src/state-cli.js` | CLI để tương tác với state DB |

## Nguyên tắc thiết kế

1. **Zero dependencies**: Chỉ dùng Node.js built-in modules + sqlite3 CLI system binary
2. **Safety-first**: Dry-run default, guardrails, confirm Jira project trước khi tạo
3. **Truy xuất được**: Backlog key trong summary, Backlog URL trong description, metadata trong mọi payload
4. **Idempotent**: SQLite tracking giúp không tạo duplicate issue hay comment
5. **AI-agent friendly**: Toàn bộ tool được thiết kế cho Codex agent dùng, không phải cho người dùng cuối
