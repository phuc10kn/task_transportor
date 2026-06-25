# Deepdive: `src/state-cli.js` — State DB Command-Line Router

## Vai trò

CLI interface để tương tác với state database. Cho phép AI agent query và manage state trực tiếp từ command line, mà không cần import JS module.

## Usage

```
node src/state-cli.js <command> [options]
```

Mọi output đều là JSON để agent dễ parse.

## Commands

### `init`

Initialize state database (chạy migration).

```
node src/state-cli.js init
→ { "ok": true, "message": "State DB initialized: <path>" }
```

### `upsert-project`

Load project config và upsert vào DB.

```
node src/state-cli.js upsert-project --project projects/example.json
→ { "ok": true, "project": { "id": "example", ... } }
```

### `projects`

List tất cả projects.

```
node src/state-cli.js projects
→ { "ok": true, "projects": [...] }
```

### `map-issue`

Ghi nhận một issue đã được tạo trên Jira.

```
node src/state-cli.js map-issue \
    --project-id example \
    --backlog-issue-key EXAMPLE-123 \
    --jira-issue-key EXJ-456
→ { "ok": true, "mapping": { ... } }
```

### `get-issue`

Lấy thông tin mapping của một issue.

```
node src/state-cli.js get-issue \
    --project-id example \
    --backlog-issue-key EXAMPLE-123
→ { "ok": true, "mapping": { ... } }  // hoặc { "ok": true, "mapping": null }
```

### `list-issues`

List issue mappings, optionally filter by project.

```
node src/state-cli.js list-issues --project-id example
→ { "ok": true, "mappings": [...] }
```

### `mark-comment`

Đánh dấu một comment đã sync.

```
node src/state-cli.js mark-comment \
    --project-id example \
    --backlog-issue-key EXAMPLE-123 \
    --backlog-comment-id 1001
→ { "ok": true, "mapping": { ... } }
```

### `list-comments`

List comment mappings với optional filters.

```
node src/state-cli.js list-comments \
    --project-id example \
    --backlog-issue-key EXAMPLE-123
→ { "ok": true, "mappings": [...] }
```

### `comments-to-sync`

Tìm comments chưa sync bằng cách diff với file JSON.

```
node src/state-cli.js comments-to-sync \
    --project-id example \
    --backlog-issue-key EXAMPLE-123 \
    --comments-json examples/backlog-comments.example.json
→ { "ok": true, "unsynced": [...] }
```

### `log-event`

Ghi một sync event.

```
node src/state-cli.js log-event \
    --project-id example \
    --action create_jira_issue \
    --status success
→ { "ok": true, "event": { ... } }
```

### `events`

List sync events.

```
node src/state-cli.js events \
    --project-id example \
    --limit 10
→ { "ok": true, "events": [...] }
```

### `help`

In usage text.

```
node src/state-cli.js help
```

## Global options

| Option | Mô tả |
|--------|-------|
| `--db <path>` | Custom DB path (mặc định: `state/backlog2jira.sqlite`) |

## Command routing

`state-cli.js` là một command router đơn giản:

```
1. Parse --db nếu có
2. Lấy command từ process.argv[2]
3. Match command với handler tương ứng
4. Parse args specific cho command
5. Gọi function từ state-db.js
6. Output JSON (hoặc error message)
```

Không dùng Commander.js hay yargs — tự parse argv để giữ zero dependencies.
