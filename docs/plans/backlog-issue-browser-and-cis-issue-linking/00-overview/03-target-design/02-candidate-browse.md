# 3. Candidate browse API

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Endpoint mới:

~~~text
GET /api/v1/projects/:projectId/backlog/issues/candidates
GET /api/v1/projects/:projectId/backlog/issues/action-readiness
~~~

`action-readiness` là screen-bootstrap read endpoint. UI gọi endpoint này ngay khi chọn project, trước khi có date filter hoặc chạy browse. Candidate GET trả lại cùng `actions` shape như một snapshot mới tại thời điểm browse; mọi POST vẫn phải revalidate gate server-side và không tin readiness đã cache ở browser.

Action readiness contract:

~~~json
{
  "data": {
    "project_id": 12,
    "actions": {
      "browse": {
        "enabled": true,
        "disabled_reasons": []
      },
      "pull_one": {
        "enabled": true,
        "execution_mode": "inline",
        "consumer_ready": true,
        "disabled_reasons": []
      },
      "pull_project": {
        "enabled": true,
        "execution_mode": "queued_ready",
        "consumer_ready": true,
        "disabled_reasons": []
      },
      "sync_to_cis": {
        "enabled": true,
        "execution_mode": "queued_ready",
        "consumer_ready": true,
        "disabled_reasons": []
      }
    }
  }
}
~~~

Semantics từng action:

- `browse.enabled` chỉ phản ánh project tồn tại và các field Backlog config/credential bắt buộc đang hiện diện; endpoint không gọi remote chỉ để probe credential. Remote auth/rate/provider failure vẫn được candidate/action request trả theo error contract. Browse không phụ thuộc manual_pull_enabled, sync_enabled hoặc worker.
- `pull_one.enabled` cần các field Backlog config/credential bắt buộc hiện diện, project.enabled + manual_pull_enabled. Khi sync_enabled=true, `execution_mode = inline` vì `pullIssueNow` chạy job ngay cả khi worker nền tắt. Khi sync_enabled=false, vẫn enqueue theo behavior hiện hữu nhưng trả `execution_mode = queued_waiting`, `consumer_ready = false` và warning rõ rằng job còn pending.
- `pull_project.enabled` cần các field Backlog config/credential bắt buộc hiện diện, project.enabled + manual_pull_enabled. Action luôn enqueue; `queued_ready` chỉ khi sync_enabled=true và worker nền đang được cấu hình bật, còn lại là `queued_waiting` với warning. One-shot consumer chạy sau có thể xử lý queue nhưng không được báo là đang ready tại thời điểm response.
- `sync_to_cis.enabled` chỉ true khi các field Backlog config/credential bắt buộc hiện diện, project.enabled, manual_pull_enabled, sync_enabled và config.worker.enabled đều true; nếu không thì action disabled và POST không enqueue.
- Với ba write action, `execution_mode` là enum bắt buộc: `inline`, `queued_ready`, `queued_waiting` hoặc `disabled`. Khi `enabled = false`, response luôn trả `execution_mode = disabled` và `consumer_ready = false`; không omit/null hai field này.
- `disabled_reasons` là mảng unique theo precedence ổn định: `PROJECT_DISABLED` → `BACKLOG_CONFIG_INCOMPLETE` → `BACKLOG_PULL_DISABLED` → `PROJECT_SYNC_DISABLED` → `SYNC_WORKER_UNAVAILABLE`. Chỉ trả reason áp dụng cho action đó; khi `enabled = true`, mảng rỗng và trạng thái chờ consumer được biểu diễn bằng `queued_waiting`, không giả thành disabled reason. Không dùng một boolean chung để suy ra behavior của cả ba write action.

Query contract:

| Field | Rule |
| --- | --- |
| created_from | Required, YYYY-MM-DD. |
| created_to | Required, YYYY-MM-DD và không nhỏ hơn created_from. |
| limit | Required integer từ 1 đến 100. |

Success response:

~~~json
{
  "data": {
    "project_id": 12,
    "filters": {
      "created_from": "2026-07-01",
      "created_to": "2026-07-13",
      "limit": 20
    },
    "actions": {
      "browse": {
        "enabled": true,
        "disabled_reasons": []
      },
      "pull_one": {
        "enabled": true,
        "execution_mode": "inline",
        "consumer_ready": true,
        "disabled_reasons": []
      },
      "pull_project": {
        "enabled": true,
        "execution_mode": "queued_ready",
        "consumer_ready": true,
        "disabled_reasons": []
      },
      "sync_to_cis": {
        "enabled": true,
        "execution_mode": "queued_ready",
        "consumer_ready": true,
        "disabled_reasons": []
      }
    },
    "candidates": [
      {
        "backlog_issue_key": "DMP-21",
        "summary": "Ví dụ",
        "status": "Open",
        "created_at_source": "2026-07-02T08:00:00Z",
        "updated_at_source": "2026-07-03T08:00:00Z"
      }
    ],
    "meta": {
      "requested_limit": 20,
      "returned_count": 1,
      "source_rows_scanned": 12,
      "excluded_existing_cis_count": 11,
      "pages_scanned": 1,
      "source_exhausted": true,
      "scan_limit_reached": false,
      "deadline_reached": false,
      "stop_reason": "source_exhausted",
      "provider_error_code": null
    }
  }
}
~~~

Algorithm server-side:

1. Validate project tồn tại, Backlog config/credential, created range và limit. Browse là read-only nên không phụ thuộc manual_pull_enabled/sync_enabled/worker enabled; response trả action-readiness snapshot theo đúng shape của screen-bootstrap endpoint. Khởi tạo overall deadline 30 giây cho cả request.
2. Resolve Backlog project id bằng BacklogClient.getProject(project.backlog_project_key).
3. Set offset = 0, page size = 100 và transient seenIssueKeys = Set().
4. Gọi BacklogClient.listIssues với projectId[], createdSince, createdUntil, sort=created, order=asc, count=100 và offset. Mỗi `getProject`/`listIssues` call nhận timeout `min(10 giây, remaining deadline)`.
5. Bỏ record có issue.projectId không khớp Backlog project id đã resolve; sau đó chuẩn hóa key, bỏ key rỗng và duplicate trong chính response.
6. Gọi CisApi batch read surface một lần cho toàn bộ key hợp lệ của page để lấy tập `issues.backlog_issue_key` đã tồn tại trong cùng project. Không so candidate Backlog với `jira_issue_key` dù text giống nhau.
7. Chỉ append key chưa tồn tại tới khi đạt requested_limit. Tăng offset bằng số row source vừa nhận.
8. Lặp lại từ bước 4 khi chưa đủ limit, page vừa nhận đủ 100 row, chưa quét quá 10 page/1.000 source row và còn thời gian. Không bắt đầu source call mới khi deadline đã hết.
9. Dừng theo precedence: đủ limit => `enough_candidates`; page < 100 => `source_exhausted`; hết deadline => `deadline_reached`; đủ 10 page/1.000 row => `scan_limit_reached`; source call sau ít nhất một page thành công bị lỗi => `provider_error`. Chỉ một `stop_reason` là canonical; các boolean/provider_error_code tương ứng phải nhất quán.
10. Nếu ít nhất một page đã thành công, deadline/scan bound/provider error ở page sau trả HTTP 200 cùng partial candidates và warning metadata. Nếu `getProject` hoặc page đầu tiên timeout/fail thì trả provider error, không giả partial success. Không gọi repository write, SyncApi.enqueueJob, SyncApi.writeJournal, pull-state update, normalizer ingest hay external attachment endpoint trong browse path; pull_state phải giữ nguyên cả row count lẫn value.

BacklogClient phải nhận timeout per call, hủy/destroy HTTPS request thật sự khi hết hạn và chuẩn hóa thành retryable `BACKLOG_REQUEST_TIMEOUT`. Candidate browse truyền timeout tối đa 10 giây/remaining deadline; attachment/background flow có thể dùng config riêng nhưng không được làm HTTP candidate-sync chờ attachment. Scan/deadline bound là contract công khai; UI giải thích khi kết quả thiếu do source cạn, scan bound hoặc deadline.

Backlog error normalization:

- Remote 404 từ issue lookup => domain code `BACKLOG_ISSUE_NOT_FOUND`, public HTTP 422 cho candidate/identity validation, retryable = false. Remote project 404 => `BACKLOG_PROJECT_NOT_FOUND`, public HTTP 422.
- 429 => `BACKLOG_RATE_LIMITED`, giữ `retry_after_seconds` khi có, retryable = true.
- Backlog 5xx => canonical `BACKLOG_SERVER_ERROR`/public HTTP 502, retryable = true; không tạo alias `BACKLOG_PULL_FAILED`.
- Network reset/DNS => `BACKLOG_NETWORK_ERROR`/HTTP 502; timeout => `BACKLOG_REQUEST_TIMEOUT`/HTTP 504; đều retryable = true.
- Backlog 401/403 => `BACKLOG_AUTH_FAILED`/HTTP 422; 4xx còn lại => `BACKLOG_API_ERROR`/HTTP 422, retryable = false.
- BacklogClient phải set contract thống nhất (`status`, `statusCode` nếu compatibility code còn dùng, `retryable`); `handleManualPullJob` không được overwrite `error.retryable = true` thành false chỉ vì field name khác. Verifier phải cover 429/5xx/network/timeout/404.
