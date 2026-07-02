# Webhook Verification — Xác thực, raw payload và dedupe

> Trạng thái Lite hiện tại: code chưa mount `/webhooks/backlog` hoặc `/webhooks/jira`. File này là contract chuẩn bị cho Medium/phase sau khi bật webhook; Lite hiện dùng Backlog manual/project pull qua `/api/v1/projects/:projectId/backlog/...` làm inbound chính.

## Mục tiêu

File này chốt cách nhận webhook Backlog/Jira trong MVP: verify, lưu raw payload, dedupe, response code và logging.

Webhook handler phải làm nhanh:

1. Nhận request và giữ raw body.
2. Verify theo source.
3. Lưu `webhook_events`.
4. Dedupe.
5. Enqueue `sync_jobs`.
6. Trả response nhanh.

Heavy processing thuộc worker.

## Endpoint

MVP dùng endpoint riêng theo source:

```text
POST /webhooks/backlog
POST /webhooks/jira
```

## Backlog verification

Backlog webhook dùng header secret.

Header đề xuất:

```text
X-Webhook-Token: <project backlog webhook secret>
```

Flow:

1. Lấy raw body và parsed JSON.
2. Xác định project từ payload nếu có thể.
3. Lấy `backlog_webhook_secret` của project.
4. So sánh constant-time với `X-Webhook-Token`.
5. Nếu fail, lưu raw payload với `status = 'rejected'`, trả `401` hoặc `403`.

Nếu chưa xác định được project:

- Vẫn lưu raw payload.
- Không ingest issue.
- Status `unmatched_project` nếu verify không thể thực hiện do không có project match.
- Tạo anomaly `routing_mismatch` nếu payload đủ thông tin.

## Jira verification

Jira webhook MVP dùng secret trong URL.

Ví dụ:

```text
POST /webhooks/jira?token=<project jira webhook secret>
```

Flow:

1. Lấy token từ query string.
2. Xác định project từ Jira issue key/project key nếu có thể.
3. So sánh token với `jira_webhook_secret`.
4. Nếu fail, lưu raw payload với `status = 'rejected'`, trả `401` hoặc `403`.

Yêu cầu logging:

- Không log full URL có query token.
- Không log webhook headers trong MVP.
- Nếu có request logging middleware, phải mask query `token`.

## Raw body handling trong Express

Webhook route phải giữ được raw string/buffer và parsed JSON.

Khuyến nghị implementation:

- Dùng `express.json({ verify })` hoặc body-parser verify callback để gắn `req.rawBody`.
- Verify/dedupe hash dùng `req.rawBody`.
- Normalizer dùng parsed `req.body`.

Ví dụ ý tưởng:

```js
express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
});
```

Nếu sau này chuyển sang HMAC signature, raw body đã sẵn sàng để tính signature.

## Verify fail payload

MVP vẫn lưu raw payload khi verify fail:

```text
webhook_events.status = 'rejected'
processed = 0
processing_error = 'webhook verification failed'
```

Lý do:

- Có audit/debug.
- Có thể phát hiện cấu hình webhook sai.
- Có thể điều tra source spam hoặc token sai.

Rủi ro:

- Raw payload rejected có thể là dữ liệu không tin cậy.

Giảm rủi ro:

- Không hiển thị tràn lan raw payload trong UI.
- Áp dụng retention giống `webhook_events`.
- Không log secret/header.

## Response code

| Case | Response | Ghi chú |
| --- | --- | --- |
| Thiếu/sai token | `401 Unauthorized` | Dùng khi không có credential hợp lệ. |
| Token đúng format nhưng không được phép/project disabled | `403 Forbidden` | Dùng khi request không được chấp nhận vì policy. |
| Duplicate event | `200 OK` | Đã nhận rồi, không muốn hệ ngoài retry. |
| Unmatched project | `202 Accepted` | Đã lưu raw/anomaly nhưng không ingest. |
| Internal error trước khi lưu raw | `500 Internal Server Error` | Cho hệ ngoài retry. |
| Internal error sau khi đã lưu raw/enqueue nội bộ | `202 Accepted` | Hệ thống tự retry/xử lý bằng job/anomaly. |
| Enqueue thành công | `202 Accepted` | Webhook accepted, xử lý async. |

## Dedupe

Ưu tiên dedupe chính:

1. Event id/header id từ Backlog/Jira nếu có.
2. Nếu không có event id, dùng fallback kỹ thuật.

Fallback đề xuất:

```text
source_system
event_type
external_project_key
external_issue_key
external_comment_id
external_attachment_id
occurred_at
payload_hash
```

Trong đó:

- `payload_hash` = SHA-256 của raw body.
- Các field thiếu được normalize thành empty string.
- Dedupe key phải lưu vào `webhook_events.dedupe_key`.

Khi duplicate:

- Insert/update `webhook_events` với status `duplicate` nếu có thể.
- Không enqueue thêm `sync_jobs`.
- Không ghi `sync_journal` trong MVP.

## Webhook event status

| Status | Khi nào dùng |
| --- | --- |
| `received` | Đã lưu raw, chưa enqueue. |
| `queued` | Đã tạo sync job. |
| `processed` | Worker xử lý xong. |
| `duplicate` | Event bị dedupe. |
| `rejected` | Verify fail. |
| `unmatched_project` | Không xác định được project. |
| `failed` | Lỗi xử lý webhook/job inbound. |

## Security logging

MVP không log webhook headers.

Không log:

- `X-Webhook-Token`
- query `token`
- Authorization headers
- Jira/Backlog API token
- OpenAI API key

Nếu cần debug, log:

- `correlation_id`
- source
- project_id nếu xác định được
- event_type
- external issue key
- webhook_events.id
- status

## Correlation id

Mỗi webhook request cần có `correlation_id`.

Nguồn:

1. Header request nếu có `X-Request-Id`.
2. Nếu không có, app tự tạo `req_<id>`.

Correlation id nên được đưa vào:

- log
- `webhook_events` payload metadata nếu cần
- `sync_jobs.payload_json`
- `sync_journal` khi worker xử lý job

## Local/dev

Cho phép tắt verify bằng:

```env
WEBHOOK_VERIFY=false
```

Chỉ dùng local/dev. Production/internal server thật nên bật verify.
