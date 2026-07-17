# Kế hoạch Pull nhiều Backlog issue vào CIS

> Trạng thái: Đã triển khai — chờ manual review  
> Ngày cập nhật: 2026-07-17

## 1. Mục tiêu

Thêm một nút mới trên màn Backlog Issues để:

1. Dùng bộ lọc đang nhập để đếm tổng issue trên Backlog.
2. Lấy issue từ Backlog theo từng page, tối đa 100 issue/page.
3. Với mỗi issue chưa có trong CIS, tạo một job `manual_pull` riêng.
4. Hiển thị tiến độ `Page N/Total · X queued`.

Giữ nguyên toàn bộ UI và flow hiện tại:

- `Find candidates`;
- `Result limit`;
- bảng candidate;
- ba action trên từng row;
- `Pull one`;
- Project pull và scheduled pull vẫn disabled.

## 2. Những gì không làm

- Không tạo `batch_run`.
- Không tạo discovery/coordinator job.
- Không thêm job type mới.
- Không thêm bảng hoặc migration cho batch.
- Không sửa worker polling, retry hoặc concurrency.
- Không thêm checkpoint/resume scan sau refresh.
- Không chạy Translation hoặc Jira từ nút mới.
- Không redesign màn Backlog Issues.

Nút mới chỉ enqueue/reuse các job `manual_pull` giống flow hiện tại.

## 3. Luồng xử lý

```text
Operator nhập filter
  -> bấm Pull all matching issues
  -> FE gọi API count
  -> Backend gọi Backlog Count Issue
  -> trả source_count và total_pages
  -> FE gọi page 1
  -> Backend lấy tối đa 100 issue từ Backlog
  -> bỏ qua issue đã có trong CIS
  -> mỗi issue còn lại enqueue/reuse một manual_pull
  -> Backend trả newly_queued của page
  -> FE cộng queuedTotal và hiển thị Page 1/Total · X queued
  -> lặp tới total_pages
```

Ví dụ Count trả `2.943` issue:

```text
page_size   = 100
total_pages = 30
```

UI khi đang chạy:

```text
Page 7/30 · 126 queued
```

`queuedTotal` chỉ tồn tại ở FE trong lần chạy hiện tại:

```javascript
queuedTotal += response.newly_queued;
```

## 4. Bộ lọc

Count và Page dùng cùng một payload đã được FE chụp lại tại thời điểm bấm nút:

```json
{
  "created_from": "2026-07-01",
  "created_to": "2026-07-17",
  "status_ids": [1, 2],
  "assignee_ids": [123],
  "not_closed": true
}
```

Quy tắc:

- `created_from` và `created_to` bắt buộc, định dạng `YYYY-MM-DD`;
- Status, Assignee và Not closed giữ semantics của `Find candidates` hiện tại;
- `Result limit` không được gửi cho Count/Page;
- FE dùng đúng một bản payload cho Count và mọi Page của lần chạy đó.

## 5. API Backend

### 5.1 Count

```http
POST /api/v1/projects/:projectId/backlog/manual-pulls/count
```

Backend:

1. Validate Project, Backlog read gate và filter.
2. Resolve numeric Backlog Project ID từ `backlog_project_key`.
3. Gọi `GET /api/v2/issues/count` với `projectId[]` và filter.
4. Trả:

```json
{
  "source_count": 2943,
  "page_size": 100,
  "total_pages": 30
}
```

Count không enqueue job và không trả issue data.

### 5.2 Enqueue một page

```http
POST /api/v1/projects/:projectId/backlog/manual-pulls/pages/:page
```

Backend:

1. Validate Project, `manual_pull`, sync/worker readiness và filter.
2. Resolve numeric Backlog Project ID.
3. Gọi Backlog Issue List:

```text
projectId[]=<remote project id>
sort=created
order=asc
count=100
offset=(page - 1) * 100
```

4. Bulk lookup các Backlog issue key đã có trong CIS.
5. Với mỗi issue chưa có trong CIS, gọi cơ chế enqueue/reuse `manual_pull` hiện tại.
6. Trả kết quả của page:

```json
{
  "page": 7,
  "source_rows": 100,
  "newly_queued": 18,
  "reused_active": 2,
  "already_in_cis": 80,
  "invalid_rows": 0
}
```

Không trả source issue data về FE.

Các counter của page phải thỏa:

```text
source_rows = newly_queued + reused_active + already_in_cis + invalid_rows
```

`invalid_rows` là số source row thiếu issue key, sai remote Project hoặc thiếu dữ liệu bắt buộc nên không được enqueue.

Nếu enqueue một item lỗi, page request trả lỗi. Các `manual_pull` đã tạo trước đó vẫn giữ nguyên; retry page sử dụng CIS lookup và active-job dedupe hiện có để không tạo trùng.

## 6. Dữ liệu của `manual_pull`

Hiện tại mỗi `manual_pull` lại gọi Backlog để lấy Project và Issue. Flow mới đã có issue data từ Issue List, nên job phải dùng lại dữ liệu đó.

Payload internal:

```json
{
  "mode": "filtered_pull",
  "backlog_issue_key": "ONE_KYORITSU-2307",
  "backlog_issue_snapshot": {
    "version": 1,
    "issueKey": "ONE_KYORITSU-2307",
    "projectId": 123,
    "summary": "...",
    "description": "...",
    "issueType": { "id": 1, "name": "Task" },
    "status": { "id": 2, "name": "Open" },
    "priority": { "id": 3, "name": "Normal" },
    "assignee": null,
    "created": "...",
    "updated": "..."
  },
  "with_translation": false,
  "push_to_jira": false,
  "requested_by": 1,
  "request_correlation_id": "..."
}
```

Quy tắc:

- Snapshot chỉ do Backlog application tạo; FE không được gửi snapshot.
- Generic Sync Jobs API không được phép inject snapshot.
- Page endpoint kiểm tra issue key và remote Project ID trước khi enqueue.
- Snapshot thiếu dữ liệu bắt buộc thì không enqueue item đó; không gọi lại `getIssue`.

## 7. Sửa handler `manual_pull`

```text
Nếu job có backlog_issue_snapshot hợp lệ
  -> dùng snapshot làm issue data
  -> không gọi getProject/getIssue
Nếu job không có snapshot
  -> giữ nguyên Pull one hiện tại
  -> gọi getProject/getIssue

Sau đó cả hai flow dùng chung:
  -> getIssueComments
  -> getIssueAttachments
  -> normalize
  -> apply mappings
  -> upsert CIS
```

Kỳ vọng provider calls:

| Flow | Project | Issue | Comments | Attachments |
|---|---:|---:|---:|---:|
| Pull one hiện tại | 1 | 1 | 1 | 1 |
| Job từ Page | 0 | 0 | 1 | 1 |

## 8. Admin Web

Giữ nguyên Modern Operations Console và JavaScript MPA hiện tại.

Chỉ thêm nút `Pull all matching issues`:

- dùng filter đang nhập nhưng bỏ `limit`;
- dùng readiness `sync_to_cis` để enable/disable; Count chỉ dùng `browse` readiness, còn Page phải kiểm tra đầy đủ readiness enqueue;
- không submit/reload document;
- không clear candidate table;
- chỉ disable và hiện loading trên chính nút mới;
- gọi Count một lần rồi gọi Page tuần tự;
- cập nhật `Page N/Total · X queued` sau mỗi Page thành công;
- lỗi ở Page nào thì dừng tại Page đó và cho Retry;
- khi hoàn tất, thông báo các jobs đã được đưa vào queue, không nói CIS đã sync xong.

Giữ `Pull project` disabled nhưng đổi nội dung giải thích thành:

```text
Full project pull remains disabled. Use filtered pull or candidate actions.
```

Khi refresh/đóng tab:

- vòng gọi Page dừng;
- các `manual_pull` đã lưu vẫn được worker xử lý;
- tiến độ FE bị mất;
- bấm lại sẽ Count và chạy lại từ Page 1.

Đây là hành vi đã chấp nhận vì không có batch state.

## 9. Phạm vi code

### Backlog

- Thêm external operation `backlog.issues.count`.
- Thêm `BacklogClient.countIssues` và fixture tương ứng.
- Tách filter normalizer dùng chung cho Candidates, Count và Page.
- Thêm application/controller/route cho Count và Page.
- Sửa `handleManualPullJob` để dùng internal snapshot.
- Export capability mới qua `BacklogApi`.

### Sync

- Dùng `enqueueManualPullIfNoneActive` hiện tại cho từng issue.
- Chặn snapshot injection từ generic public Sync Jobs API.
- Không thêm job type, worker handler hoặc schema mới.

### Admin Web

- Sửa `apps/admin-web/public/pages/backlog.js`.
- Không thêm framework hoặc dependency.

### Docs/tests

- Cập nhật Product/Interface/Technical/Quality để phân biệt filtered pull mới với Project pull đang disabled.
- Thêm verifier Backend và Admin UI E2E.

## 10. Kế hoạch triển khai

### Bước 1 — Count và shared filter

- Thêm Count Issue operation/client.
- Dùng chung validation/filter với Candidates.
- Thêm Count endpoint.

### Bước 2 — Snapshot-aware `manual_pull`

- Cho handler nhận internal snapshot.
- Snapshot job không gọi lại Project/Issue.
- Pull one hiện tại không thay đổi.

### Bước 3 — Page endpoint

- Lấy 100 issues theo page.
- Bulk lookup CIS.
- Enqueue/reuse từng `manual_pull`.
- Trả counters của page.

### Bước 4 — Nút và progress FE

- Thêm nút mới.
- Count một lần, Page tuần tự.
- Cộng `queuedTotal` tại FE.
- Giữ nguyên candidate UI.

### Bước 5 — Tests và docs

- Chạy regression Backlog/Sync/Admin UI.
- Cập nhật docs theo hành vi mới.

## 11. Test bắt buộc

### Backend

- Count `0`, `1`, `100`, `101`, `2.943` issue.
- Count `0` không gọi Page 1.
- Count/Page dùng đúng Project và cùng filter.
- Page `1`, `2`, page cuối và page rỗng.
- Issue đã có CIS không enqueue.
- Active `manual_pull` được reuse.
- 250 issue tạo tối đa 250 `manual_pull`, không tạo job type khác.
- Snapshot job không gọi `getProject/getIssue`.
- Pull one không snapshot giữ flow cũ.
- Generic Sync Jobs API không inject được snapshot.
- Gate/readiness fail không enqueue.

### Admin Web

- Existing Find candidates và row actions không đổi.
- Nút mới không gửi `limit`.
- Page gọi tuần tự, không song song.
- Progress hiển thị đúng `Page N/Total · X queued`.
- Page lỗi giữ nguyên form và cho Retry.
- Refresh không làm mất jobs đã queue.
- Không hiển thị queue hoàn tất thành CIS sync hoàn tất.

### Regression

- Project pull và scheduled pull vẫn disabled.
- Translation/Jira không bị gọi từ nút mới.
- Mappings, CIS resync và external gates không đổi.
- Worker config không bị sửa.

## 12. Ước lượng

| Phần | Thời gian |
|---|---:|
| Count/shared filter | 0,5 ngày |
| Snapshot manual pull | 0,5-0,75 ngày |
| Page endpoint | 0,5-0,75 ngày |
| Admin Web progress | 0,5 ngày |
| Tests/docs | 0,5-0,75 ngày |

Tổng: **2,5-3,25 ngày kỹ thuật**, chưa gồm manual review.

## 13. Definition of Done

- Nút mới tự Count và duyệt toàn bộ các Page đã đếm.
- Mỗi issue chưa có trong CIS tạo/reuse một `manual_pull` riêng.
- Queue không có batch/discovery/coordinator job.
- Job từ Page dùng dữ liệu Issue List, không gọi lại Project/Issue.
- FE hiển thị `Page N/Total · X queued` trong phiên hiện tại.
- Candidate UI và per-row actions vẫn giữ nguyên.
- Project pull/scheduled pull vẫn disabled.
- Không có migration hoặc thay đổi worker.
- Automated tests pass; manual UI check chờ reviewer xác nhận.
