# Deepdive: `src/config.js` — Config Loading & Validation

## Vai trò

Module chịu trách nhiệm đọc, parse, và validate project configuration từ file JSON. Đây là điểm đầu tiên mọi luồng dữ liệu đi qua.

## Public API

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `readJsonFile(filePath)` | `string` | `object` | Đọc và parse JSON từ disk |
| `loadProjectConfig(filePath)` | `string` | `ProjectConfig` | Load + validate + resolve instruction paths |
| `validateProjectConfig(config, filePath?)` | `object` | `void` (throws nếu invalid) | Validate toàn bộ cấu trúc |
| `resolveInstructionFiles(files, repoRoot)` | `string[]`, `string` | `string[]` | Resolve relative paths, kiểm tra tồn tại, chống path traversal |

## Validation rules

### Required fields
Yêu cầu tất cả các field sau phải có giá trị (không undefined, null, empty string):
- `id`, `name`, `sourceRoots[]`, `wikiRoots[]`, `instructionFiles[]`
- `backlog.projectKey`, `backlog.issueKeyPrefix`, `backlog.allowedIssueTypes[]`
- `jira.projectKey`, `jira.defaultIssueType`, `jira.allowedIssueTypes[]`
- `mapping.issueType`, `mapping.status`, `mapping.priority`
- `rules.maxSummaryLength`

### Cross-field validation

```
backlog.issueKeyPrefix === backlog.projectKey + "-"
│
├── Nếu không → throw "issueKeyPrefix must start with '<projectKey>-'"
│
backlog.allowedIssueTypes mỗi type
│
├── Phải có key trong mapping.issueType
│   └── Nếu không → throw "'<type>' has no issue type mapping"
│
└── Giá trị map đến phải có trong jira.allowedIssueTypes
    └── Nếu không → throw "Mapped issue type '<mappedType>' is not in jira.allowedIssueTypes"
```

### Type checks

| Field | Kiểm tra |
|-------|----------|
| `sourceRoots`, `wikiRoots`, `instructionFiles` | Non-empty array |
| `mapping.issueType`, `mapping.status`, `mapping.priority` | Plain object (không phải array, null, Date) |
| `rules.maxSummaryLength` | Integer >= 50 |

### Instruction file resolution

`resolveInstructionFiles()` làm 3 việc:
1. **Không cho path absolute**: Nếu file path bắt đầu bằng `/` → throw
2. **Không cho path traversal**: Nếu resolved path chứa `..` vượt ra ngoài repo root → throw
3. **Kiểm tra tồn tại**: Nếu file không tồn tại trên disk → throw

## Private helpers

| Helper | Mô tả |
|--------|-------|
| `requireValue(value, label)` | Throw nếu value là undefined/null/empty string |
| `requireNonEmptyArray(value, label)` | Throw nếu không phải array hoặc empty |
| `requireArray(value, label)` | Throw nếu không phải array |
| `requirePlainObject(value, label)` | Throw nếu không phải plain object |

## Error handling

Mọi lỗi validation đều throw `Error` với message mô tả chi tiết, bao gồm file path nếu có. Không có lỗi silently ignored.

## Thiết kế

- **Fail fast**: Validation ngay khi load config, không chờ đến lúc dùng
- **Descriptive errors**: Mỗi lỗi nói rõ field nào, giá trị gì, cần thế nào
- **Security**: Chống path traversal trong instruction files — agent không thể đọc file ngoài repo
