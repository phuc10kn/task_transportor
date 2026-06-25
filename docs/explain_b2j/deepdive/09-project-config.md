# Deepdive: Project Configuration

## Vai trò

Mỗi dự án (Backlog space/project) cần một file config JSON để định nghĩa cách mapping. Config files nằm trong `projects/` và được validate bởi `src/config.js`.

## File structure

```
projects/
├── example.json          # Example/demo project
└── wecsy-main.json       # Real project: Wecsy (ONE_KYORITSU → WEC1)
```

## Config fields

### Top-level

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `id` | string (slug) | Yes | ID duy nhất, pattern: `^[a-z0-9][a-z0-9-]*$` |
| `name` | string | Yes | Tên hiển thị |
| `sourceRoots` | string[] | Yes | Danh sách thư mục source code trong project |
| `wikiRoots` | string[] | Yes | Danh sách thư mục wiki |
| `instructionFiles` | string[] | Yes | Per-project AI instruction files (path relative đến repo root) |
| `backlog` | object | Yes | Backlog project config |
| `jira` | object | Yes | Jira project config |
| `mapping` | object | Yes | Mapping rules |
| `rules` | object | Yes | Business rules |

### `backlog` object

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `projectKey` | string | Yes | Backlog project key |
| `issueKeyPrefix` | string | Yes | Phải bắt đầu bằng `{projectKey}-` |
| `allowedIssueTypes` | string[] | Yes | Backlog issue types được phép xử lý |

### `jira` object

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `projectKey` | string | Yes | Jira project key |
| `defaultIssueType` | string | Yes | Fallback nếu không có mapping |
| `allowedIssueTypes` | string[] | Yes | Jira issue types được phép tạo |

### `mapping` object

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `issueType` | object | Yes | Backlog issue type → Jira issue type |
| `status` | object | Yes | Backlog status → Jira status |
| `priority` | object | Yes | Backlog priority → Jira priority |

### `rules` object

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `requireBacklogKeyInSummary` | boolean | Yes | Thêm `[KEY-N]` vào đầu summary |
| `requireBacklogUrlInDescription` | boolean | Yes | Thêm Backlog URL vào description |
| `maxSummaryLength` | integer (50-255) | Yes | Độ dài tối đa của summary |

## Ví dụ: `example.json` (Demo)

```json
{
  "id": "example",
  "name": "Example Project",
  "sourceRoots": ["src", "lib"],
  "wikiRoots": ["docs/wiki"],
  "instructionFiles": ["project-instructions/example.md"],
  "backlog": {
    "projectKey": "EXAMPLE",
    "issueKeyPrefix": "EXAMPLE-",
    "allowedIssueTypes": ["Task", "Bug", "Story"]
  },
  "jira": {
    "projectKey": "EXJ",
    "defaultIssueType": "Task",
    "allowedIssueTypes": ["Task", "Bug", "Story"]
  },
  "mapping": {
    "issueType": { "Task": "Task", "Bug": "Bug", "Story": "Story" },
    "status": {
      "Open": "To Do",
      "In Progress": "In Progress",
      "Resolved": "Done",
      "Closed": "Done"
    },
    "priority": { "High": "High", "Normal": "Medium", "Low": "Low" }
  },
  "rules": {
    "requireBacklogKeyInSummary": true,
    "requireBacklogUrlInDescription": true,
    "maxSummaryLength": 255
  }
}
```

**Đặc điểm**: 1-1 mapping đơn giản, dùng để test/demo.

## Ví dụ: `wecsy-main.json` (Production)

```json
{
  "id": "wecsy-main",
  "name": "Wecsy Main",
  "backlog": {
    "projectKey": "ONE_KYORITSU",
    "issueKeyPrefix": "ONE_KYORITSU-",
    "allowedIssueTypes": ["その他要望", "調査", "新規機能", "機能改修", "バグ修正", "障害"]
  },
  "jira": {
    "projectKey": "WEC1",
    "defaultIssueType": "Task",
    "allowedIssueTypes": ["Task"]
  },
  "mapping": {
    "issueType": {
      "その他要望": "Task",
      "調査": "Task",
      "新規機能": "Task",
      "機能改修": "Task",
      "バグ修正": "Task",
      "障害": "Task"
    },
    "status": {
      "Open": "To Do",
      "着手OK": "To Do",
      "In Progress": "In Progress",
      "Resolved": "Resolved",
      "Closed": "Deployed PRD"
    },
    "priority": { "High": "High", "Normal": "Medium", "Low": "Low" }
  }
}
```

**Đặc điểm nổi bật**:
- **6 Japanese issue types → tất cả đều map thành `Task`** (Jira chỉ dùng 1 type)
- **Backlog `着手OK` → Jira `To Do`**: Có status mapping không 1-1
- **Backlog `Closed` → Jira `Deployed PRD`**: Status name khác biệt hoàn toàn

## Project instructions

Mỗi project có instruction file riêng trong `project-instructions/`:

- **`example.md`**: Vocabulary mapping (Japanese→English), field rules, translation rules
- **`wecsy-main.md`**: Scope definition, wiki handling, Jira field config, Vietnamese translation requirement, vocabulary list

## JSON Schema validation

`schema/project-config.schema.json` (Draft 2020-12) enforce:
- `id` pattern: `^[a-z0-9][a-z0-9-]*$`
- `instructionFiles` items không được bắt đầu bằng `/`
- `maxSummaryLength`: 50-255
- `additionalProperties: false` — không cho phép field lạ
- `required` cho tất cả mandatory fields

## Thiết kế

- **Per-project isolation**: Mỗi dự án một file config riêng, không shared state
- **Flexible mapping**: Không yêu cầu 1-1 mapping, support N-1 (nhiều Backlog type → 1 Jira type)
- **Self-documenting**: Config là JSON thuần, dễ đọc và maintain
- **Version-controlled**: Config files trong git, track lịch sử thay đổi
