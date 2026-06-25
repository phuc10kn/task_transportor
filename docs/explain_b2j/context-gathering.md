# backlog2jira — Lấy context dịch

## Vấn đề

backlog2jira CLI chỉ map các field kỹ thuật: issueKey, projectKey, issueType, status, priority, summary, description. Nhưng việc **dịch nội dung** (đặc biệt từ tiếng Nhật sang tiếng Việt) và **làm giàu description** với context domain đòi hỏi hiểu biết về project — đó là việc của **Codex**, không phải của CLI.

## Vai trò của sourceRoots, wikiRoots, instructionFiles

3 field trong project config quyết định Codex lấy context từ đâu:

```
projects/wecsy-main.json
├── sourceRoots       → source code repos (để hiểu business logic)
├── wikiRoots         → LLM wiki (để tra cứu thuật ngữ, spec)
└── instructionFiles  → file hướng dẫn riêng cho project này
```

### sourceRoots — Source code repos

**Mục đích**: Codex đọc source code để hiểu context kỹ thuật và business của issue.

```json
"sourceRoots": [
  "/Users/giang/Documents/Projects/wecsy/Code/wecsy_webapp",
  "/Users/giang/Documents/Projects/wecsy/Code/wecsy-front-API",
  "/Users/giang/Documents/Projects/wecsy/Code/wecsy-front"
]
```

**Codex dùng source code để**:
- Tra cứu tên hàm, class, module liên quan đến issue
- Hiểu business logic để dịch chính xác
- Tìm UI text, error message để tham khảo
- Xác định phạm vi ảnh hưởng của issue

**Ví dụ**: Backlog issue báo lỗi "ログイン画面でエラー" → Codex đọc code để biết:
- File login controller xử lý ở đâu
- Error message thực tế là gì
- Flow login gồm những bước nào

### wikiRoots — LLM Wiki

**Mục đích**: Wiki chứa kiến thức domain, thuật ngữ, spec, và quyết định thiết kế.

```json
"wikiRoots": [
  "/Users/giang/Documents/Projects/wecsy/Code/Wecsy_LLM_Wiki"
]
```

**Codex dùng wiki để**:
- Tra cứu thuật ngữ tiếng Nhật ↔ tiếng Việt (từ vocabulary list)
- Hiểu business domain của project
- Tra spec của tính năng liên quan
- Kiểm tra quyết định thiết kế đã có

**Ví dụ**: Gặp từ "予約" → wiki có vocabulary list cho biết đó là "reservation"

### instructionFiles — Hướng dẫn riêng cho project

```json
"instructionFiles": [
  "project-instructions/wecsy-main.md"
]
```

File hướng dẫn chứa:

**1. Scope** — Codex chỉ được dùng context từ sourceRoots và wikiRoots đã chỉ định. Không tự ý lấy từ repo khác.

**2. Quy tắc xử lý wiki** — Trước khi đọc wiki:
```
git status → clean? → git pull --ff-only origin master
                          ↓
                    dirty/not master/diverged? → stop, báo user
```

**3. Quy tắc Jira** — Dùng Jira project nào, issue type nào, field nào cần set, template description ra sao.

**4. Quy tắc dịch** — Giữ tiếng Nhật gốc trong description, dịch sang tiếng Việt cho dev, không thêm acceptance criteria, không thêm AI context.

**5. Vocabulary list** — Tra cứu thuật ngữ đặc thù của project:
```
予約       → reservation
クーポン    → coupon
施設/ホテル → facility/hotel (tuỳ UI)
管理画面   → CMS admin
プッシュ通知 → push notification
```

---

## Luồng context gathering

Bước này xảy ra **trước khi** backlog2jira CLI chạy:

```
Người dùng: "Đồng bộ issue ONE_KYORITSU-456"

Codex:
│
├── 1. Đọc project config: projects/wecsy-main.json
│     ├── sourceRoots → biết repo nào cần tra
│     ├── wikiRoots   → biết wiki nào cần đọc
│     └── instructionFiles → biết luật dịch
│
├── 2. Đọc file hướng dẫn: project-instructions/wecsy-main.md
│     ├── Biết phải git pull wiki trước khi dùng
│     ├── Biết template description (tiếng Việt + tiếng Nhật)
│     └── Biết vocabulary: 予約 = reservation, クーポン = coupon...
│
├── 3. Kiểm tra & pull wiki
│     ├── git status → clean?
│     ├── git pull --ff-only origin master
│     └── (Nếu dirty → báo user, không tự động fix)
│
├── 4. Fetch Backlog issue ONE_KYORITSU-456
│     └── Lưu thành file JSON tạm
│
├── 5. Đọc source code liên quan (nếu cần)
│     └── Tra cứu UI text, error message, business logic
│
├── 6. Đọc wiki liên quan (nếu cần)
│     └── Tra cứu thuật ngữ, spec, decision records
│
├── 7. Dịch nội dung (Codex tự làm, không phải CLI)
│     ├── Dịch summary từ tiếng Nhật → giữ nguyên (theo config)
│     ├── Dịch description: tiếng Việt cho dev + giữ tiếng Nhật gốc
│     └── Dùng vocabulary từ wiki để đảm bảo đúng thuật ngữ
│
├── 8. Chạy backlog2jira CLI để validate
│     └── node src/cli.js --project ... --backlog-json ...
│         (CLI chỉ map field kỹ thuật, không dịch nội dung)
│
├── 9. Gửi lên Jira
│     └── Dùng jiraPayload từ CLI + description đã dịch ở bước 7
│
└── 10. Ghi state
      └── map-issue, mark-comment, log-event
```

---

## Ai làm gì?

| Bước | Làm bởi | Mô tả |
|------|----------|-------|
| Đọc config | Codex | Load projects/wecsy-main.json |
| Đọc instruction | Codex | Load project-instructions/wecsy-main.md |
| Git pull wiki | Codex | Chạy git command theo hướng dẫn |
| Fetch Backlog issue | Codex | Gọi Backlog API |
| Tra source code | Codex | Đọc code để hiểu context |
| Tra wiki | Codex | Đọc wiki để tra thuật ngữ, spec |
| **Dịch nội dung** | **Codex** | Dùng LLM để dịch Nhật → Việt, giữ bản gốc |
| Map field kỹ thuật | **backlog2jira CLI** | Guardrails + mapper → jiraPayload |
| Tạo Jira issue | Codex | Gọi Jira API với payload + description đã dịch |
| Ghi state | Codex / CLI | state-cli map-issue, mark-comment |

---

## Ví dụ cụ thể: Wecsy issue 456

**Backlog gốc** (tiếng Nhật):
```
summary: "ログイン画面でエラーが発生する"
description: "IDとパスワードを入力後、ログインボタンを押すと500エラーが発生します。"
```

**Codex gathering context**:
1. Đọc instruction → biết cần dịch Nhật → Việt, giữ bản gốc
2. Pull wiki → tra vocabulary → không có từ đặc biệt
3. Tra source code → tìm file login controller → thấy error trả về từ API
4. Dịch nội dung:
   - Giữ Nhật gốc trong description
   - Thêm bản dịch Việt: "Xảy ra lỗi 500 sau khi nhập ID và mật khẩu và bấm nút đăng nhập."
5. Chạy CLI → jiraPayload với summary/description gốc
6. Gửi lên Jira → **kết hợp** jiraPayload (field kỹ thuật) + description đã dịch (nội dung)

---

## Tổng kết

**backlog2jira CLI** không tự lấy context — nó là công cụ validate và map field kỹ thuật. **Codex** là người gathering context từ source repos và wiki, rồi dùng context đó để:

- Dịch nội dung issue một cách chính xác (đúng thuật ngữ, đúng business domain)
- Làm giàu description với thông tin từ code và wiki
- Quyết định issue type dựa trên nội dung (ví dụ: bug → Bug, operational → Task)
- Phát hiện conflict: issue nói về module A nhưng config chỉ scope module B

`sourceRoots` và `wikiRoots` trong config chỉ định **phạm vi** Codez được phép đọc — không cho phép đọc lung tung ngoài project.
