# backlog2jira — Dịch comment

## Tổng quan

Sau khi issue được tạo trên Jira, các comment trên Backlog cũng cần được đồng bộ. Quá trình dịch comment tương tự dịch issue, nhưng có điểm khác biệt: **comment là đoạn hội thoại**, không phải mô tả kỹ thuật.

## Dữ liệu đầu vào: comment JSON từ Backlog API

```json
[
  {
    "id": 1001,
    "content": "追加仕様: クーポン再計算は予約確認画面で必須です。",
    "created": "2026-06-19T10:00:00+07:00"
  },
  {
    "id": 1002,
    "content": "補足: 既存予約には影響しません。",
    "created": "2026-06-19T10:05:00+07:00"
  }
]
```

Mỗi comment có: `id` (định danh), `content` (nội dung tiếng Nhật), `created` (thời gian).

---

## Luồng dịch comment

```
Người dùng: "Đồng bộ comments cho ONE_KYORITSU-123"

Codex:
│
├── 1. Fetch tất cả comments từ Backlog API
│     └── Lưu vào file JSON tạm
│
├── 2. Diff với state DB: comments nào chưa sync?
│     └── node src/state-cli.js comments-to-sync \
│           --project-id wecsy-main \
│           --backlog-issue-key ONE_KYORITSU-123 \
│           --comments-json tmp-comments.json
│     └── Output: [{ id: 1002 }]  ← chỉ comment mới
│
├── 3. Với mỗi comment chưa sync, Codex dịch
│     ├── Đọc instruction → biết quy tắc dịch
│     ├── Tra wiki → vocabulary lookup (予約 = reservation...)
│     └── Dịch: Nhật → Việt, giữ bản gốc
│
├── 4. Gửi comment đã dịch lên Jira
│     └── Gọi Jira API add_comment cho issue WEC1-789
│
├── 5. Ghi state
│     └── node src/state-cli.js mark-comment \
│           --project-id wecsy-main \
│           --backlog-issue-key ONE_KYORITSU-123 \
│           --backlog-comment-id 1002
│
└── 6. Log event
      └── node src/state-cli.js log-event \
            --project-id wecsy-main \
            --action sync_comment \
            --status success
```

---

## Cấu trúc comment sau khi dịch

Codex dùng cùng template với issue description nhưng gọn hơn:

```markdown
**Backlog comment #1002** (2026-06-19 10:05)

> 補足: 既存予約には影響しません。

**Dịch**: Bổ sung: Không ảnh hưởng đến các đặt phòng hiện tại.
```

Hoặc với format chuẩn của instruction Wecsy:

```markdown
## Comment từ Backlog (1002 | 2026-06-19 10:05)

**Tiếng Nhật gốc:**
補足: 既存予約には影響しません。

**Tiếng Việt:**
Bổ sung: Không ảnh hưởng đến các đặt phòng hiện tại.
```

---

## Quy tắc dịch comment

Lấy từ `project-instructions/wecsy-main.md` và `SKILL.md`:

| Quy tắc | Áp dụng cho comment |
|---------|---------------------|
| Dịch Nhật → Việt | ✅ Có — cho dev đọc được |
| Giữ bản gốc tiếng Nhật | ✅ Có — traceability |
| Dùng vocabulary từ wiki | ✅ Có — 予約 = reservation, クーポン = coupon |
| Ghi rõ ID + thời gian gốc | ✅ Có — biết comment từ đâu, khi nào |
| Không thêm acceptance criteria | ✅ Có — comment là hội thoại, không phải spec |
| Không thêm AI context | ✅ Có — trừ khi instruction cho phép |
| Giữ nguyên product terms | ✅ Có — tên khách sạn, mã coupon, mã đặt phòng |

---

## Ví dụ đầy đủ: Wecsy comment

**Backlog gốc** (3 comment, trong đó 1 comment mới):

```json
[
  { "id": 1001, "content": "このバグは優先度をHighに上げてください。", "created": "2026-06-20T09:00:00+07:00" },
  { "id": 1002, "content": "調査結果: 問題は決済APIのタイムアウトにありました。", "created": "2026-06-20T11:00:00+07:00" },
  { "id": 1003, "content": "修正完了。クーポン適用後の再計算も正常に動作しています。", "created": "2026-06-21T14:00:00+07:00" }
]
```

**Codex xử lý**:

1. Chạy `comments-to-sync` → state DB đã có 1001, 1002 → output: `[{ id: 1003 }]`

2. Đọc instruction → biết phải dịch Nhật → Việt, giữ gốc, tra vocabulary:
   - クーポン → coupon
   - 再計算 → recalculate

3. Dịch comment 1003:
```markdown
## Comment từ Backlog (1003 | 2026-06-21 14:00)

**Tiếng Nhật gốc:**
修正完了。クーポン適用後の再計算も正常に動作しています。

**Tiếng Việt:**
Đã sửa xong. Việc tính toán lại sau khi áp dụng coupon cũng hoạt động bình thường.
```

4. Gọi Jira API add comment → nhận comment ID 20005

5. Ghi state:
```
node src/state-cli.js mark-comment \
  --project-id wecsy-main \
  --backlog-issue-key ONE_KYORITSU-123 \
  --backlog-comment-id 1003 \
  --jira-comment-id 20005
```

---

## So sánh: dịch issue vs dịch comment

| Khía cạnh | Dịch issue | Dịch comment |
|-----------|-----------|--------------|
| **Validate bằng CLI?** | ✅ Có — guardrails + mapper | ❌ Không — CLI không kiểm tra comment |
| **Dùng state DB?** | ✅ Có — issue_mappings | ✅ Có — comment_mappings |
| **Diff trước khi sync?** | ✅ getIssueMapping() | ✅ findUnsyncedBacklogComments() |
| **Dịch nội dung** | Codex (Nhật → Việt + giữ gốc) | Codex (Nhật → Việt + giữ gốc) |
| **Cấu trúc output** | Template chuẩn (Backlog key, URL, Việt, Nhật) | Gọn hơn (ID, thời gian, Việt, Nhật) |
| **Dùng vocabulary?** | ✅ Có | ✅ Có — cùng vocabulary list |
| **Tần suất** | Một lần khi tạo issue | Mỗi lần có comment mới |
| **Context cần** | Source code + wiki | Chủ yếu wiki (vocabulary), ít source code |
| **Rủi ro nếu sai** | Tạo issue sai type, sai project | Comment sai nghĩa, dev hiểu nhầm |

---

## Tình huống đặc biệt

### Comment đã bị xóa trên Backlog

State DB vẫn giữ mapping cũ. Codex không phát hiện vì diff chỉ tìm comment **có trong Backlog mà chưa có trong DB** — không phát hiện comment **có trong DB mà không còn trên Backlog**.

→ Không xóa comment trên Jira. Comment cũ vẫn giữ nguyên.

### Comment bị sửa trên Backlog

Backlog comment ID không đổi, content thay đổi. State DB đã có mapping → `findUnsyncedBacklogComments()` bỏ qua.

→ Hiện tại không có cơ chế phát hiện comment đã sửa. Nếu cần, phải thêm `source_hash` vào `comment_mappings` (tương tự issue_mappings).

### Nhiều comment mới cùng lúc

`findUnsyncedBacklogComments()` trả về mảng. Codex lặp qua từng comment, dịch, sync, ghi state. Nếu một comment fail → các comment khác vẫn được sync (không rollback toàn bộ).

### Comment có mention user Backlog

Backlog comment có thể chứa mention như `@tanaka` hoặc `[user:123]`. Codex cần:
- Giữ nguyên mention text trong bản gốc
- Nếu có mapping user Backlog → Jira, thay mention tương ứng trong bản dịch

---

## Tổng kết

Dịch comment cũng dùng cùng pipeline context (source + wiki + instruction) như dịch issue, nhưng khác ở chỗ:

- **Không qua CLI validate** — comment không cần guardrails
- **Có bước diff state DB** — chỉ sync comment mới, không sync lại comment cũ
- **Cấu trúc gọn hơn** — kèm ID và thời gian gốc để trace
- **Tần suất cao hơn** — mỗi ngày có thể có nhiều comment mới trên nhiều issue
