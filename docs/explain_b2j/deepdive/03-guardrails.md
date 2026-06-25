# Deepdive: `src/guardrails.js` — Safety Validation

## Vai trò

Guardrails là lớp bảo vệ thứ hai (sau config validation). Nó kiểm tra từng Backlog issue trước khi mapping, và kiểm tra quyền tạo issue trên Jira.

## Public API

| Function | Input | Output | Mô tả |
|----------|-------|--------|-------|
| `validateBacklogIssueForProject(issue, project)` | Backlog issue object + ProjectConfig | `string[]` | Trả về array error messages (empty = hợp lệ) |
| `validateCreateIntent({project, allowCreate, confirmJiraProject})` | Object | `{ok: boolean, errors: string[]}` | Kiểm tra quyền tạo |
| `assertNoGuardrailErrors(errors)` | `string[]` | `void` (throws nếu có lỗi) | Throw formatted error message |

## Issue validation rules

`validateBacklogIssueForProject()` kiểm tra 7 điều kiện:

```
1. Issue phải là object
   └── Nếu không → ["Backlog issue must be an object"]

2. issueKey phải tồn tại và bắt đầu bằng backlog.issueKeyPrefix
   └── Nếu không → ["Missing or invalid issueKey"]

3. projectKey phải khớp với backlog.projectKey
   └── Nếu không → ["Backlog projectKey mismatch"]

4. issueType phải có trong backlog.allowedIssueTypes
   └── Nếu không → ["Unsupported issue type: '<type>'"]

5. issueType phải có mapping trong mapping.issueType
   └── Nếu không → ["No issue type mapping for '<type>'"]

6. status phải có mapping trong mapping.status
   └── Nếu không → ["No status mapping for '<status>'"]

7. Nếu priority tồn tại và không empty → phải có mapping trong mapping.priority
   └── Nếu không → ["No priority mapping for '<priority>'"]
```

## Create intent validation

`validateCreateIntent()` kiểm tra:

```
allowCreate == false?
  └── errors: ["Dry-run only mode"]

confirmJiraProject != project.jira.projectKey?
  └── errors: ["Jira project mismatch: expected '<key>', got '<key>'"]

Cả hai OK?
  └── ok: true, errors: []
```

## Thiết kế

- **Error-first**: Return array of errors thay vì throw — caller quyết định xử lý thế nào
- **Granular checks**: Mỗi lỗi là một string riêng, không gộp chung
- **Priority optional**: Priority mapping chỉ kiểm tra nếu priority có giá trị — Backlog issue không có priority vẫn pass
- **assertNoGuardrailErrors()**: Format errors thành message dễ đọc trước khi throw, phù hợp cho CLI output
- **Safety by default**: Không có `--allow-create` = không thể tạo issue thật
