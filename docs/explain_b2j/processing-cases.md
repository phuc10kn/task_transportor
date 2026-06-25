# backlog2jira — Processing Cases

Mỗi case mô tả một tình huống từ lúc **người dùng yêu cầu Codex** đến **output cuối cùng**, đi qua tất cả các lớp xử lý.

---

## Case 1: Happy path — Đồng bộ issue lần đầu

> **Người dùng**: "Đồng bộ issue ONE_KYORITSU-123 từ Backlog sang Jira"
>
> **Codex**:
> 1. Đọc project config `projects/wecsy-main.json` → loadProjectConfig() ✅
> 2. Fetch Backlog API issue ONE_KYORITSU-123 → lưu thành file JSON tạm
> 3. Chạy CLI: `node src/cli.js --project projects/wecsy-main.json --backlog-json backlog-issue.json`
>
> **backlog2jira xử lý**:
> - Guardrails check: issueKey ✅, projectKey ✅, issueType ✅ (バグ修正), status ✅ (Open), priority ✅
> - Map thành Jira payload (summary, description, labels, priority, metadata)
> - `validateCreateIntent()`: allowCreate = false → dry-run
>
> **Output**: `{ mode: "dry-run", jiraPayload: {...}, createGuard: {ok: false} }`
>
> **Codex nhận output**: Kiểm tra dry-run → thấy jiraPayload OK → chạy với `--allow-create --confirm-jira-project WEC1`
>
> **Lần 2**:
> - `validateCreateIntent()`: allowCreate = true, confirmJiraProject === "WEC1" → ✅
> - Output: `{ mode: "create-ready", jiraPayload: {...}, nextMcpTool: "create_jira_issue" }`
>
> **Codex**: Gọi Jira API create issue → nhận WEC1-789 → ghi state:
> ```
> node src/state-cli.js map-issue \
>   --project-id wecsy-main \
>   --backlog-issue-key ONE_KYORITSU-123 \
>   --jira-issue-key WEC1-789
> ```
>
> **Kết quả**: Issue được tạo trên Jira, mapping lưu trong state DB. Lần sau không tạo trùng.

---

## Case 2: Issue từ project khác bị gửi nhầm

> **Người dùng**: "Đồng bộ issue OTHER-456"
>
> **Codex**: Fetch Backlog issue OTHER-456 → chạy backlog2jira
>
> **backlog2jira**:
> - `validateBacklogIssueForProject()`:
>   - issueKey "OTHER-456" không bắt đầu bằng prefix "ONE_KYORITSU-" → ❌
>   - projectKey "OTHER" !== "ONE_KYORITSU" → ❌
> - `assertNoGuardrailErrors()` throw: `"Missing or invalid issueKey\nBacklog projectKey mismatch"`
>
> **Codex nhận error**: Báo lại cho người dùng "Issue OTHER-456 không thuộc project ONE_KYORITSU, không thể xử lý với config wecsy-main"
>
> **Kết quả**: Không tạo issue, không lãng phí Jira resource.

---

## Case 3: Issue type không được support

> **Người dùng**: "Đồng bộ issue ONE_KYORITSU-789"
>
> **Codex**: Fetch issue → run backlog2jira
>
> **backlog2jira**: `validateBacklogIssueForProject()` thấy `issueType = "障害"` (đã có trong allowedIssueTypes ✅), nhưng cần kiểm tra mapping...
>
> Giả sử config **không** có mapping cho "障害":
>
> **Output**: `"Unsupported issue type: '障害'"`
>
> **Codex**: Báo người dùng "Issue type '障害' chưa được cấu hình mapping. Cần thêm vào project config."
>
> **Kết quả**: Không silent skip — báo lỗi rõ ràng để người dùng cập nhật config.

---

## Case 4: Status chưa có mapping

> **Người dùng**: "Đồng bộ ONE_KYORITSU-456"
>
> **Codex**: Fetch → run backlog2jira
>
> **backlog2jira**: Issue có status "着手OK" nhưng config thiếu mapping cho status này → ❌
>
> **Output**: `"No status mapping for '着手OK'"`
>
> **Codex**: Báo người dùng "Cần thêm mapping status '着手OK' vào config"
>
> **Kết quả**: Không tạo issue, yêu cầu cập nhật config.

---

## Case 5: Priority optional — không có priority thì skip

> **Người dùng**: "Đồng bộ ONE_KYORITSU-333"
>
> **Codex**: Fetch → run backlog2jira
>
> **backlog2jira**: Issue có `issueType: "新規機能"`, `status: "Open"`, nhưng **không có field priority**
>
> - issueType ✅ → map thành "Task"
> - status ✅ → map thành "To Do"
> - priority: không có → **bỏ qua**, không check
>
> **Output**: `{ mode: "dry-run", jiraPayload: { ..., priority: undefined } }`
>
> **Kết quả**: Map thành công, payload Jira không có priority — Jira sẽ dùng default.

---

## Case 6: Summary quá dài bị truncate

> **Người dùng**: "Đồng bộ ONE_KYORITSU-555, summary dài quá"
>
> **Codex**: Fetch issue với summary = 300 ký tự → run backlog2jira
>
> **backlog2jira**:
> - `buildSummary()`: Prepends `[ONE_KYORITSU-555] ` → 317 ký tự
> - Cắt tại `maxSummaryLength: 255`
> - Output summary: `"[ONE_KYORITSU-555] "` + 237 ký tự đầu của summary gốc
>
> **Codex**: Nhận payload với summary đã cắt — không cần xử lý gì thêm
>
> **Kết quả**: Summary được truncate an toàn, không fail.

---

## Case 7: Jira project key sai khi create

> **Người dùng**: "Tạo issue này trên Jira luôn"
>
> **Codex**: Chạy với `--allow-create --confirm-jira-project ABC`
>
> **backlog2jira**:
> - Guardrails ✅
> - `validateCreateIntent()`: confirmJiraProject "ABC" !== jira.projectKey "WEC1" → ❌
>
> **Output**: `{ mode: "dry-run", createGuard: { errors: ["Jira project mismatch: expected 'WEC1', got 'ABC'"] } }`
>
> **Codex**: Nhận dry-run + error → báo lỗi
>
> **Kết quả**: Không tạo issue — fallback về dry-run an toàn.

---

## Case 8: Issue đã sync — không tạo trùng

> **Người dùng**: "Đồng bộ ONE_KYORITSU-123" (issue đã sync ở Case 1)
>
> **Codex**:
> 1. Kiểm tra state: `node src/state-cli.js get-issue --project-id wecsy-main --backlog-issue-key ONE_KYORITSU-123`
> 2. State DB trả về: `{ jiraIssueKey: "WEC1-789", lastSyncedAt: "2026-06-23T10:00:00.000Z" }`
> 3. So sánh `backlog_updated_at` — nếu Backlog issue không thay đổi → **skip**, báo user "Issue đã sync tại WEC1-789"
>
> **backlog2jira CLI không chạy** — Codex tự quyết định dựa trên state.
>
> **Kết quả**: Không tạo duplicate issue.

---

## Case 9: Comment mới — chỉ sync comment chưa có

> **Người dùng**: "Đồng bộ comments cho ONE_KYORITSU-123"
>
> **Codex**:
> 1. Fetch Backlog comments → lưu file JSON (3 comments: id 1001, 1002, 1003)
> 2. `node src/state-cli.js comments-to-sync --project-id wecsy-main --backlog-issue-key ONE_KYORITSU-123 --comments-json comments.json`
> 3. State DB diff: đã có 1001, 1002 → trả về `[{ id: 1003 }]`
> 4. Codex sync comment 1003 lên Jira → ghi state:
> ```
> node src/state-cli.js mark-comment \
>   --project-id wecsy-main \
>   --backlog-issue-key ONE_KYORITSU-123 \
>   --backlog-comment-id 1003
> ```
>
> **Kết quả**: Chỉ sync comment mới, không chạm vào comment cũ.

---

## Case 10: Không có comment mới — bỏ qua

> **Người dùng**: "Kiểm tra comments mới cho ONE_KYORITSU-123"
>
> **Codex**: Fetch comments → run comments-to-sync
>
> **backlog2jira**: `findUnsyncedBacklogComments()` so sánh — tất cả comments đã có trong state DB → trả về `[]`
>
> **Codex**: Thấy empty → báo "Không có comment mới để sync"
>
> **Kết quả**: Không gọi Jira API, không ghi state.

---

## Case 11: Nhiều lỗi cùng lúc

> **Người dùng**: "Đồng bộ issue BAD-999"
>
> **Codex**: Fetch Backlog issue → run backlog2jira
>
> **backlog2jira**: Issue sai tất cả:
> - issueKey "BAD-999" ❌
> - projectKey "WRONG" ❌
> - issueType "Epic" ❌
> - status "Unknown" ❌
> - priority "Critical" ❌
>
> `validateBacklogIssueForProject()` trả về 5 errors
> `assertNoGuardrailErrors()` throw tất cả cùng lúc
>
> **Codex nhận error**: Báo user tất cả vấn đề cùng lúc
>
> **Kết quả**: Không tạo issue, user biết chính xác 5 điểm cần fix.

---

## Case 12: Config sai — thiếu field

> **Người dùng**: "Thêm project mới example2 vào backlog2jira"
>
> **Codex**: Tạo `projects/example2.json` nhưng quên field `backlog.allowedIssueTypes`
>
> **backlog2jira**: `validateProjectConfig()` chạy ngay khi load config → throw
>
> **Output**: `"Validation error in ... : 'backlog.allowedIssueTypes' is required"`
>
> **Codex**: Nhận error → fix config → chạy lại
>
> **Kết quả**: Config không hợp lệ thì không xử lý issue nào — fail fast.

---

## Case 13: Path traversal — instruction file vượt repo

> **Người dùng**: Yêu cầu Codex thêm instruction file vào config
>
> **Codex**: Ghi `instructionFiles: ["../../.env"]` vào config → chạy loadProjectConfig()
>
> **backlog2jira**: `resolveInstructionFiles()` phát hiện path chứa `..` vượt ra ngoài repo root → throw
>
> **Output**: `"Instruction file '...' escapes the repo root"`
>
> **Kết quả**: Chống path traversal — không cho đọc file ngoài repo.
