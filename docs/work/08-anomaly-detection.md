# Anomaly Detection — Phát hiện bất thường

## Vai trò

Anomaly detection là lớp bảo vệ thay thế cho guardrails ở thiết kế cũ. Thay vì kiểm tra cứng (hard rules), anomaly detection dùng cả rule-based + AI để phát hiện vấn đề.

---

## Các loại anomaly

### 1. Batch operation — Nhiều issue cùng lúc

**Phát hiện**:
```
Trong vòng 5 phút, có > 5 webhook events cho cùng project
  và cùng event_type ('issue_updated')
```
hoặc:
```
Translation queue nhận > 10 item cùng lúc từ cùng project
```

**Xử lý**:
- Không auto-translate
- `issues.sync_status` giữ nguyên `'ingested'`
- Anomaly log: severity = 'warning'
- Notification: "Phát hiện 15 issue cùng lúc từ Backlog. Cần duyệt thủ công?"

**Khi nào là dương tính giả?**: Khách hàng import hàng loạt issue qua CSV — vẫn là batch, nhưng cần xử lý. Cho phép user "approve batch này" để bypass một lần.

---

### 2. Duplicate content — Issue trùng lặp

**Phát hiện**:
```
SELECT backlog_issue_key FROM issues
JOIN issue_revisions r
  ON r.issue_id = issues.id
 AND r.revision = issues.current_revision
WHERE project_id = ?
  AND r.summary = ?  -- Cùng summary hiện tại
  AND source = 'backlog'
  AND status NOT IN ('archived')
```

hoặc dùng **text similarity** (fuzzy match):
```
summary của issue mới giống > 90% với issue đã tồn tại
(có thể khác issue key nếu ai đó tạo lại)
```

**Xử lý**:
- Anomaly log: severity = 'warning'
- Gợi ý: "Issue này có nội dung tương tự ONE_KYORITSU-456 đã sync. Có phải duplicate?"
- User decision: skip hoặc vẫn tạo

---

### 3. Unusual field change — Field thay đổi bất thường

**Phát hiện**:

- **Content thay đổi đột ngột**: Diff giữa 2 revision > 70% content khác
  ```
  Revision 1: "ログイン画面でエラーが発生します"
  Revision 2: "APIの仕様変更に伴い、エンドポイントを/v2/に変更"
  → Diff ratio cao + topic khác hẳn → có thể user edit nhầm issue
  ```

- **Status jump**: Backlog status nhảy từ "Open" → "Closed" mà không qua "In Progress"
  ```
  Có thể khách hàng đóng nhầm, hoặc bot tự động đóng
  → Warning + chờ confirm trước khi sync lên Jira
  ```

- **Assignee thay đổi nhiều lần**: Cùng issue, assignee thay đổi 5 lần trong 1 ngày
  ```
  → Có thể team đang phân công lại, không phải anomaly thực sự
  → Chỉ log info, không block
  ```

**Xử lý**:
- severity tuỳ mức độ: status jump → warning, content thay đổi lớn → critical
- Với critical: block sync, chờ manual review

---

### 4. Routing mismatch — Issue không thuộc project nào

**Phát hiện**:
```
Backlog webhook đến với projectKey không có trong projects table
hoặc issueKey prefix không khớp bất kỳ project nào
```

**Xử lý**:
- Không ingest vào CIS
- Anomaly log: severity = 'warning'
- "Issue ONE_KYORITSU-999 không thuộc project nào đã config. Tạo project mới hay bỏ qua?"

---

### 5. Translation low confidence — AI không tự tin

**Phát hiện**:
```
translation_queue.ai_confidence < 0.5
```

**Xử lý**:
- Anomaly log: severity = 'info'
- Ưu tiên hiển thị trong review queue
- Không block — nhưng warning reviewer

**Nguyên nhân thường gặp**:
- Content chứa nhiều thuật ngữ kỹ thuật mới
- Content viết tắt, không rõ nghĩa
- Code-mixed (tiếng Nhật + tiếng Anh + code)

---

### 6. Mapping gap — Thiếu mapping

**Phát hiện**:
```
Backlog issue mới có issueType/status chưa có trong mapping_rules
```

**Xử lý**:
- Tự động kích hoạt AI propose mapping (xem mapping-learning.md)
- Anomaly log: severity = 'warning'
- Block sync cho đến khi có mapping confirmed

---

### 7. Sync failure chain — Nhiều lỗi liên tiếp

**Phát hiện**:
```
SELECT COUNT(*) FROM sync_journal
WHERE status = 'failed'
  AND created_at > datetime('now', '-1 hour')
  AND project_id = ?
```
hoặc:
```
Cùng issue, sync fail 3 lần liên tiếp
```

**Xử lý**:
- severity = 'critical' nếu > 5 failures trong 1 giờ
- Tạm dừng sync cho project đó
- Notification + cần người xử lý

---

## Response matrix

| Anomaly | Severity | Auto-block? | Cần xử lý |
|---------|----------|-------------|-----------|
| Batch operation | warning | ⚠️ Pause auto-translate | User confirm batch |
| Duplicate content | warning | ❌ Không block | Gợi ý, user quyết định |
| Content changed drastically | critical | ✅ Block sync | User review |
| Status jump | warning | ⚠️ Pause sync status | User confirm |
| Routing mismatch | warning | ✅ Không ingest | Tạo project hoặc ignore |
| Translation low confidence | info | ❌ Không block | Warning trong UI |
| Mapping gap | warning | ✅ Block sync | User confirm mapping |
| Sync failure chain | critical | ✅ Pause project | Admin investigation |

---

## Phân tích AI cho anomaly

Khi anomaly xảy ra, AI tự động phân tích và ghi vào `anomaly_log.ai_analysis`:

```json
{
  "anomaly_type": "batch_operation",
  "analysis": {
    "count": 15,
    "time_window_minutes": 3,
    "all_same_type": true,
    "all_same_project": true,
    "likely_cause": "Bulk import từ Backlog admin",
    "recommendation": "Kiểm tra với khách hàng trước khi duyệt toàn bộ"
  }
}
```

```json
{
  "anomaly_type": "unusual_field_change",
  "analysis": {
    "field": "status",
    "from": "Open",
    "to": "Closed",
    "time_in_open": "2 phút",
    "expected_flow": ["Open", "In Progress", "Resolved", "Closed"],
    "likely_cause": "User đóng nhầm issue",
    "recommendation": "Xác nhận với người tạo trước khi sync"
  }
}
```

---

## Tắt/bật anomaly detection

Cho phép cấu hình per project:

```json
{
  "anomaly_detection": {
    "enabled": true,
    "batch_operation": { "enabled": true, "threshold": 5, "window_minutes": 5 },
    "duplicate_content": { "enabled": true, "similarity_threshold": 0.9 },
    "unusual_field_change": { "enabled": true, "content_diff_threshold": 0.7 },
    "routing_mismatch": { "enabled": true },
    "translation_low_confidence": { "enabled": true, "threshold": 0.5 },
    "mapping_gap": { "enabled": true },
    "sync_failure_chain": { "enabled": true, "threshold": 5, "window_hours": 1 }
  }
}
```
