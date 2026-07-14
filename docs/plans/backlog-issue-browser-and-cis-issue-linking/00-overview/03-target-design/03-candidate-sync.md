# 4. Sync candidate Backlog to CIS

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Endpoint mới:

~~~text
POST /api/v1/projects/:projectId/backlog/issues/:backlogIssueKey/sync-to-cis
~~~

Mục tiêu của endpoint riêng:

- Giữ POST /projects/:projectId/backlog/issues/:backlogIssueKey/pull cho Pull one issue/Resync hiện có.
- Áp dụng policy candidate: nếu CIS issue cùng project đã có Backlog key, trả outcome already_in_cis để UI remove/reload row thay vì coi đó là lỗi.
- Trước khi enqueue, require project.enabled, manual_pull_enabled, sync_enabled và config.worker.enabled. Thiếu project gate trả 422; worker tắt trả 503 SYNC_WORKER_UNAVAILABLE. Không tạo job khi thiếu gate.
- Remote precheck `getProject + getIssue` có overall deadline 20 giây và per-call timeout tối đa 10 giây; timeout/rate/provider error không enqueue.

Success response:

~~~json
{
  "data": {
    "outcome": "queued",
    "issue_id": null,
    "backlog_issue_key": "DMP-21",
    "job": {
      "id": "job-uuid",
      "status": "pending"
    }
  }
}
~~~

Outcome contract:

| HTTP | outcome/error | Rule |
| --- | --- | --- |
| 200 | already_in_cis | Pre-check hoặc conflict-reload tìm thấy CIS issue hiện hữu; không coi duplicate là lỗi. |
| 202 | queued | Remote precheck pass và một active manual_pull job đã enqueue hoặc được reuse. HTTP request không chạy handler/attachment download; UI giữ row và poll đúng job id. |
| 409 | EXTERNAL_IDENTITY_DATA_CONFLICT | Preflight/read phát hiện nhiều CIS issue legacy cùng logical key; không chọn tùy ý một record và không enqueue. |
| 422 | PROJECT_SYNC_DISABLED / BACKLOG_PULL_DISABLED | Project gate không hợp lệ; không remote lookup và không enqueue. |
| 422 | BACKLOG_ISSUE_NOT_FOUND / BACKLOG_ROUTING_MISMATCH | Remote precheck fail; không enqueue. Nếu routing đổi sau enqueue, worker terminal-fail job và tạo journal evidence. |
| 429/502/504 | BACKLOG_RATE_LIMITED / BACKLOG_SERVER_ERROR / BACKLOG_NETWORK_ERROR / BACKLOG_REQUEST_TIMEOUT | Remote precheck failure; không enqueue, giữ row để retry. |
| 503 | SYNC_WORKER_UNAVAILABLE | Worker nền tắt; không enqueue job không có consumer. |

Mọi response 200/202 dùng cùng data shape: `outcome`, canonical `backlog_issue_key`, nullable `issue_id` và nullable `job`. `already_in_cis` trả id hiện hữu; `queued` trả issue_id = null. Trạng thái retry/success/failed được đọc từ job endpoint, không biến thành outcome giả của POST ban đầu. Error dùng envelope chuẩn hiện hữu và không trả raw provider/SQLite error.

Flow:

~~~text
Admin row action
  -> Backlog HTTP candidate-sync controller
  -> BacklogApi.syncCandidateToCis
  -> validate project gates
  -> BacklogClient.getProject + getIssue
  -> compare remote numeric projectId, lấy canonical issueKey
  -> CisApi.getIssueByBacklogKey(canonical issueKey) (pre-check)
  -> nếu có: outcome already_in_cis, không enqueue
  -> nếu chưa có: SyncApi.enqueueManualPullIfNoneActive bằng project + canonical issueKey
  -> return 202 queued ngay, không chạy handler trong HTTP request
Background worker
  -> shared handler re-verify remote numeric projectId
  -> normalizer -> CisApi.upsertBacklogIssue idempotent
  -> attachment download + sync job/journal bình thường
UI
  -> poll job; success thì refetch candidate list
~~~

Race policy:

- Browse/pre-check chỉ là optimization và UX policy.
- Candidate endpoint phải remote-verify routing và canonicalize key **trước enqueue**; shared inbound handler vẫn re-verify remote issue.projectId với Backlog project id resolve từ configured project key. Candidate-list filtering không thay thế hai trust-boundary check này.
- CIS upsert dùng IMMEDIATE transaction cho normalized key. `SQLITE_BUSY` chỉ đi qua bounded retry/backoff và không bao giờ được coi là duplicate. Chỉ `SQLITE_CONSTRAINT` của đúng unique `(project_id, normalized backlog key)` mới rollback rồi reload existing trong transaction mới và trả created_issue = false; lỗi constraint khác tiếp tục fail an toàn.
- Unique database guard cùng project là lớp quyết định cuối; hai request/process đồng thời không được tạo hai CIS issue.
- Không dùng dedupe_key tồn tại vĩnh viễn cho manual pull vì nó sẽ chặn resync hợp lệ trong tương lai.
- Sync owner dùng BEGIN IMMEDIATE query+insert để tạo tối đa một pending/running job khớp `job_type = manual_pull`, direction `backlog -> cis`, `project_id` và canonical Backlog key normalized/case-insensitive trong payload. Nếu đã có active job đúng predicate, POST trả lại cùng job; success/failed/cancelled không chặn một resync tương lai. Không dùng permanent dedupe_key.
- Worker retry contract phải dựa trên normalized `error.retryable`; 429/5xx/network/timeout quay lại pending theo max_attempts, validation/project mismatch là terminal. UI phân biệt pending retry qua attempt_count/run_after/last_error của job.
