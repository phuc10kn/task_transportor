# Sync Engine — Job xử lý System ↔ CIS

## Nguyên tắc

1. **System -> CIS -> System**: Inbound job kéo/nhận dữ liệu vào CIS; outbound job đẩy dữ liệu đã duyệt từ CIS ra hệ thống đích.
2. **Idempotent**: Chạy cùng job/dữ liệu nhiều lần không tạo duplicate.
3. **Transactional**: Mỗi job là một transaction — nếu fail, rollback state.
4. **Retry**: Tự động retry theo policy, sau đó đưa job sang trạng thái `failed` để admin xử lý.
5. **Audit**: Mọi inbound/outbound job đều ghi sync_journal.

---

## Components

```
┌─────────────────────────────┐
│      Sync Engine            │
│                             │
│  ┌─────────────────────┐   │
│  │  Job Scheduler      │   │  ← Poll pending inbound/outbound jobs
│  └──────────┬──────────┘   │
│             │              │
│  ┌──────────▼──────────┐   │
│  │  Conflict Detector  │   │  ← Kiểm tra conflict trước outbound push
│  └──────────┬──────────┘   │
│             │              │
│  ┌──────────▼──────────┐   │
│  │  API Gateway        │   │  ← Gọi Backlog API / Jira API cho pull/push
│  └──────────┬──────────┘   │
│             │              │
│  ┌──────────▼──────────┐   │
│  │  State Updater      │   │  ← Cập nhật CIS sau job
│  └──────────┬──────────┘   │
│             │              │
│  ┌──────────▼──────────┐   │
│  │  Retry Handler      │   │  ← Retry queue
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## Job scheduler

```
Poll every N seconds:
  SELECT * FROM sync_jobs
  WHERE status = 'pending'
    AND project_id IN (SELECT id FROM projects WHERE sync_enabled = 1)
    AND run_after <= datetime('now')
  ORDER BY priority ASC, run_after ASC, created_at ASC
  LIMIT 50

Với mỗi job:
  1. Xác định hướng bằng direction_from/direction_to
     - backlog -> cis: pull/ingest Backlog issue/comment/attachment vào CIS
     - jira -> cis: pull/ingest Jira issue/comment/attachment vào CIS
     - cis -> jira: push issue/comment/attachment đã duyệt sang Jira
     - cis -> backlog: phase sau MVP
  2. Nếu inbound:
     - Gọi API hệ thống nguồn nếu là manual pull
     - Normalize payload
     - Upsert vào CIS
  3. Nếu outbound:
     - Gọi Conflict Detector
     - Build payload hệ thống đích
     - Dry-run nếu job yêu cầu
     - Gọi API hệ thống đích nếu sync thật
  4. Cập nhật state
  5. Ghi sync_journal
```

---

## Conflict detection

Conflict xảy ra khi cả Backlog và Jira cùng thay đổi một field giữa hai lần sync.

```
Trước khi sync, kiểm tra:

  fields_json['status'] = {
    "backlog": "Resolved",       ← Khách hàng đã đóng issue
    "jira": "In Progress",       ← Dev đang làm
    "jira_updated_at": "2026-06-23T10:00:00",
    "backlog_updated_at": "2026-06-23T09:00:00"
  }
  
  → CONFLICT: status thay đổi ở cả 2 phía
  → Resolution strategy:
      1. "jira_wins": Status từ Jira được giữ (vì Jira là nơi làm việc chính)
      2. "last_writer_wins": Phía cập nhật sau cùng thắng
      3. "manual": Không sync, đưa vào conflict queue chờ người xử lý
```

**Config per project**:
```json
{
  "conflict_resolution": {
    "status": "jira_wins",
    "assignee": "jira_wins",
    "priority": "backlog_wins",
    "default": "manual"
  }
}
```

**Khi conflict xảy ra**:
```
1. issues.status = 'conflict'
2. sync_journal: action = 'status_change', status = 'failed', error = 'Conflict detected'
3. anomaly_log: type = 'unusual_field_change', severity = 'warning'
4. Notification đến admin
```

---

## API Gateway — Retry & Error handling

Retry scheduling nằm trên `sync_jobs`, còn `sync_journal` chỉ dùng để audit từng lần chạy. Khi một job lỗi có thể retry, worker cập nhật chính job đó về `pending`, tăng `retry_count` và đặt `run_after` cho lần chạy tiếp theo. Khi hết retry, job chuyển sang `failed` để Admin UI hiển thị và cho phép retry thủ công.

```
Call API:
  ├── Success → status = 'success'
  ├── 429 Too Many Requests
  │   └── Retry theo Retry-After nếu có, nếu không dùng backoff 1m → 5m → 15m
  ├── 4xx (bad request)
  │   └── Không retry → status = 'failed', error = response body
  │   └── anomaly_log: severity = 'critical', cần người xử lý
  └── 5xx (server error)
      └── Retry tối đa 3 lần với backoff 1m → 5m → 15m
      └── Sau 3 lần → status = 'failed'
```

**Retry update**:
```sql
-- Retryable failure
UPDATE sync_jobs
SET status = 'pending',
    retry_count = retry_count + 1,
    run_after = datetime('now', '+5 minutes'),
    error_message = :error_message,
    updated_at = datetime('now')
WHERE id = :job_id
  AND retry_count < 3;

-- Exhausted failure
UPDATE sync_jobs
SET status = 'failed',
    error_message = :error_message,
    updated_at = datetime('now')
WHERE id = :job_id
  AND retry_count >= 3;
```

Mỗi attempt vẫn ghi một dòng `sync_journal` với `sync_job_id`, `status`, `retry_count` hiện tại và `error_message` nếu có.

---

## Sync comment

```
Với mỗi issue_comments có sync_status = 'pending':

  1. Xác định hướng:
     - source = 'backlog' AND content_translated ≠ NULL → sync lên Jira
     - source = 'jira' AND content_translated ≠ NULL → sync lên Backlog
     - source = 'backlog' AND content_translated = NULL → chưa dịch, skip

  2. Gọi API:
     - Jira: POST /rest/api/3/issue/WEC1-789/comment
     - Backlog: POST /api/v2/issues/ONE_KYORITSU-123/comments

  3. Cập nhật:
     - issue_comments.sync_status = 'synced'
     - issue_comments.jira_comment_id / backlog_comment_id

  4. sync_journal: direction_from = 'cis', direction_to = 'jira' | 'backlog', action = 'comment_added', status = 'success'
```

---

## Batch handling

MVP không dùng batch API. Khi có nhiều job pending cùng lúc:

```
1. Collect tối đa 50 job
2. Group by project (mỗi project có Jira/Backlog khác nhau)
3. Sort by priority:
   - Ưu tiên inbound trước outbound nếu cùng issue chưa có dữ liệu mới nhất
   - Ưu tiên create trước update (issue mới cần tạo trước)
   - Ưu tiên issue có translation đã review lâu nhất
4. Chạy từng job, mỗi issue/comment/attachment là một request riêng
5. Nếu một job fail → các job khác vẫn tiếp tục
```

---

## Sync Journal — Sau mỗi lần sync

```json
{
  "issue_id": "uuid-xxx",
  "project_id": "wecsy-main",
  "direction_from": "cis",
  "direction_to": "jira",
  "action": "create",
  "status": "success",
  "field_name": null,
  "old_value": null,
  "new_value": "WEC1-789",
  "trigger": "auto",
  "created_at": "2026-06-23T10:00:01"
}
```

Dùng để:
- Trace lịch sử của một issue
- Tính số lượng inbound/outbound job thành công / thất bại
- Phát hiện failure chain (5+ failures liên tiếp → anomaly)
- Dashboard thống kê
