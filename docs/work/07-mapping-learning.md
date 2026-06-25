# Mapping Learning — AI học mapping từ dữ liệu

## Vấn đề

Hiện tại, mapping là config tĩnh dạng B→J trực tiếp. Với CIS là trung tâm, mapping phải là **hệ thống ↔ CIS** — mỗi hệ thống chỉ cần biết giá trị của nó tương ứng với giá trị chuẩn nào trong CIS. Thêm hệ thống mới không cần học mapping với tất cả hệ thống cũ.

## CIS canonical values

CIS định nghĩa bộ giá trị chuẩn (canonical) cho mỗi loại mapping. Các hệ thống map vào/ra từ bộ này:

**Status**:
| CIS canonical | Backlog | Jira | Slack |
|--------------|---------|------|-------|
| `open` | Open, 着手OK | To Do | :new: |
| `in_progress` | In Progress | In Progress | :running: |
| `resolved` | Resolved | Resolved | :white_check_mark: |
| `done` | Closed, 完了 | Done | :closed: |
| `deployed_prd` | — | Deployed PRD | :rocket: |

**Issue type**:
| CIS canonical | Backlog | Jira |
|--------------|---------|------|
| `bug` | バグ修正, 障害 | Bug |
| `feature` | 新規機能, 機能改修 | Task |
| `task` | その他要望, 調査 | Task |
| `story` | Story | Story |

## 3 nguồn mapping

| Nguồn | Cách tạo | Confidence |
|-------|---------|-----------|
| `manual` | User nhập tay | 1.0 |
| `config_initial` | Từ config cũ (B→J) => sinh ra 2 dòng: B→CIS + CIS→J | 1.0 |
| `ai_auto` | AI propose lần đầu từ tên + context | 0.5-0.8 |
| `ai_learned` | AI học từ history | 0.7-0.95 |
| `auto_synced` | Phát hiện từ dữ liệu sync thực tế | 0.6-0.9 |

---

## AI auto-detect mapping mới

### Issue type — Backlog → CIS

Khi Backlog issue mới có type chưa có trong `mapping_rules`:

```
Input:
  - Tên type: "機能改善" (improvement)
  - CIS canonical values đã có: bug, feature, task, story
  - Các mapping Backlog→CIS hiện có: バグ修正→bug, 新規機能→feature
  - Content của issue đầu tiên (để hiểu context)

AI reasoning:
  "機能改善" = "improvement" — không phải bug, không phải feature mới
  → Các type tương tự (改善, 改修) đều map vào "feature"
  → Suggest: 機能改善 → feature (system_to_cis)
  → Từ đó CIS→Jira: feature → Task (đã có sẵn)
  → Confidence: 0.75

insert into mapping_rules:
  project_id = 'wecsy-main'
  mapping_type = 'issue_type'
  direction_from = 'backlog'
  direction_to = 'cis'
  from_value = '機能改善'
  to_value = 'feature'
  source_type = 'ai_auto'
  confidence = 0.75
```

Chỉ cần học 1 mapping mới (B→CIS). Mapping CIS→Jira (direction_from='cis', direction_to='jira', from_value='feature', to_value='Task') đã có sẵn, không cần học lại.

### Status — Jira → CIS

Khi dev thay đổi status trên Jira và CIS chưa có mapping cho giá trị đó:

```
Jira issue được set status "Deployed PRD"
CIS chưa có mapping cho "Deployed PRD"

AI detect:
  → Đây là status sau "Resolved", trước khi đóng hẳn
  → Có thể map vào canonical "deployed_prd"
  → Suggest: direction_from='jira', direction_to='cis', from_value='Deployed PRD', to_value='deployed_prd'
  → Confidence: 0.85

insert into mapping_rules:
  direction_from = 'jira'
  direction_to = 'cis'
  from_value = 'Deployed PRD'
  to_value = 'deployed_prd'
```

### Sync ngược — CIS → Backlog

Khi sync status từ CIS về Backlog, cần mapping chiều ngược lại:

```
CIS status = "done"
Cần tìm mapping CIS→Backlog:
  SELECT * FROM mapping_rules
  WHERE direction_from = 'cis'
    AND direction_to = 'backlog'
    AND from_value = 'done'
  → to_value = 'Closed'
```

Đây là mapping riêng, khác với chiều Backlog→CIS. Có thể 1 CIS value map ra nhiều Backlog values khác nhau tuỳ ngữ cảnh.

---

## Học từ confirm/reject

### User approve mapping

```
AI propose: 機能改善 → feature (direction_from='backlog', direction_to='cis', confidence: 0.75)
User confirm: ✅
  → mapping_rules.confidence = 1.0
  → mapping_rules.source_type = 'ai_learned'
  → Lần sau AI học pattern: type có prefix "機能" → feature
  → CIS→Jira (feature→Task) đã có → issue sẽ ra Task
```

### User reject mapping

```
AI propose: 機能改善 → bug (direction_from='backlog', direction_to='cis', confidence: 0.6)
User reject: ❌, chọn "feature" thay vì "bug"
  → mapping_rules ghi nhận: negative example
  → AI học: "機能" prefix không map vào bug
  → Lần sau propose khác
```

### User tự nhập mapping mới

```
User tạo mapping thủ công:
  (backlog→cis):    from_value='機能改善', to_value='feature'
  (cis→jira):       from_value='feature', to_value='Task'
  → Cả 2 dòng đều source_type = 'manual', confidence = 1.0
  → AI không propose lại cho các cặp này nữa
```

### Batch propose query

```sql
SELECT DISTINCT i.issue_type
FROM issues i
WHERE i.project_id = 'new-project'
  AND i.source = 'backlog'
  AND i.issue_type NOT IN (
    SELECT mr.from_value
    FROM mapping_rules mr
    WHERE mr.project_id = 'new-project'
      AND mr.mapping_type = 'issue_type'
      AND mr.direction_from = 'backlog'
      AND mr.direction_to = 'cis'
  )
```

Với mỗi issue type chưa có mapping:
  AI propose mapping vào CIS canonical value
  Batch insert vào mapping_rules
  Kèm CIS→Jira mapping (nếu chưa có)
  Notification: "Có 5 mapping mới cần xác nhận"

---

## Mapping health dashboard

| Metric | Ý nghĩa | Cảnh báo nếu |
|--------|---------|--------------|
| Mapping coverage | % issue type có mapping | < 90% |
| Auto-propose rate | % mapping mới do AI propose | < 50% |
| Approval rate | % propose được user OK | < 60% |
| Stale mappings | Mapping không được dùng > 90 ngày | > 10% |
| Conflict rate | % issue bị conflict do mapping sai | > 5% |

---

## Mapping rules lifecycle

```
1. AI propose (confidence: 0.5-0.8)    → chờ confirm
2. User confirm                         → confidence: 1.0
3. Dùng trong sync, tracking usage_count
4. Nếu usage_count = 0 sau 90 ngày     → stale, đề nghị xoá
5. Nếu conflict xảy ra với mapping này  → giảm confidence, cần re-confirm
```

## Kết hợp với translation

Mapping không chỉ là issue type. Vocabulary list cũng có thể học từ dữ liệu:

```
Nhiều lần user sửa bản dịch "クーポン" → "coupon" trong translation review
  → Tự động thêm vào vocabulary list cho project đó
  → Lần sau AI translate sẽ dùng đúng thuật ngữ
```
