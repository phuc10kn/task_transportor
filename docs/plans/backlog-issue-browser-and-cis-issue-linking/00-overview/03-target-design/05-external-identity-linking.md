# 6. External identity linking trong Issue Editor

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Endpoint mới:

~~~text
POST /api/v1/issues/:issueId/external-identities
~~~

Request:

~~~json
{
  "backlog_issue_key": "DMP-21",
  "jira_issue_key": "DMP-104"
}
~~~

Rules:

- Body phải có ít nhất một key không rỗng sau trim.
- Load CIS issue và classify input trước khi gọi external provider. Lookup token sau normalize bằng canonical key đang lưu trả outcome unchanged ngay, không gọi provider và không ghi journal; token khác trên field đã gán trả 409.
- Input trên field còn trống chỉ là lookup token. BacklogApi/JiraApi lookup trả canonical_key, external_id và external_project_identity; CIS persist canonical_key từ response, không persist input token. Numeric ID/alias phải resolve về cùng canonical identity và bị dedupe đúng.
- Duplicate lookup xét tất cả CIS issue cùng project bất kể `source_system` hoặc key được tạo bởi manual link, Backlog pull, Jira trace hay sync result. Chỉ identity column quyết định system: Jira `DMP-01` check mọi `jira_issue_key = DMP-01`; Backlog `DMP-01` check mọi `backlog_issue_key = DMP-01`.
- Backlog lookup so sánh remote issue.projectId với numeric Backlog project id resolve từ configured project key. Jira lookup yêu cầu fields.project.key và so sánh với jira_project_key.
- BacklogApi và JiraApi expose public lookup use case; CIS dùng lazy public API accessor bên trong function, không top-level require ngược, để tránh CommonJS cycle với các Backlog/Jira application đang import CisApi. Không import sâu BacklogClient/JiraClient.
- Trước remote lookup và một lần nữa trong write transaction, reject khi issue.sync_status = syncing hoặc có push_issue job pending/running; trả ISSUE_SYNC_IN_PROGRESS.
- Validate toàn bộ external input trước khi mở CIS persistence transaction. Provider not-found/mismatch/unavailable không tạo partial write.
- Transaction dùng BEGIN IMMEDIATE, rồi re-read issue/job state qua `SyncApi.hasActiveIssueJobInTransaction({ db, issueId, jobType: "push_issue" })`, check field còn trống và duplicate loại trừ chính issue theo cặp `(project_id, identity column)`: Backlog input chỉ query `backlog_issue_key`, Jira input chỉ query `jira_issue_key`. Không cross-compare hai system. Sau đó update các key đã verify và gọi `SyncApi.writeJournalInTransaction({ db, input })`. Hai capability dùng đúng connection CIS đang transaction, không mở connection mới; active-job race hoặc journal failure rollback identity update. Khi gặp busy/busy-snapshot phải retry **toàn transaction từ đầu** theo bounded policy, không tiếp tục từ stale read.
- Ghi sync_journal action = issue_external_identity_linked với canonical key/external id, field thay đổi, actor và correlation id; không ghi credential hoặc raw external payload.
- Không merge external field snapshot vào fields_json, không đổi source_system và không enqueue outbound Jira job.
- hashCanonicalIssue đã bao gồm backlog_issue_key và jira_issue_key; identity change làm dry-run cũ stale. Link success/conflict phải clear state.dryRun, state.issueEditorJiraDryRun và đóng state.issueEditorJiraSyncPopup trước khi refetch editor.
- Identity form input/submit bị disable khi state.issueEditorDirty; submit handler recheck dirty và không gọi API/refetch, tránh mất canonical draft chưa lưu.

Jira outbound guard bổ sung:

- `requestJiraSync` giữ các mốc hash có provenance rõ. `dry_run_canonical_hash` là H0 đã pass freshness trước khi áp dụng Jira draft override. Nếu có override, `saveJiraDraftFields` phải mở BEGIN IMMEDIATE, re-read active job + canonical/identity state, compare current hash với H0, apply đúng override và **tính/return H1 trước commit trong cùng transaction**. Mismatch trả DRY_RUN_STALE, tạo zero draft write/job. Request không rebuild H1 bằng một read mới sau commit. Không có override thì H1 = H0.
- Sau remote target resolution, `requestJiraSync` gọi CIS owner action `prepareJiraSyncJob` với expected H1, target action và optional verified trace identity. Trong BEGIN IMMEDIATE, ordering bắt buộc là: (1) re-read issue/current hash và active `push_issue`; (2) **nếu có active job**, không yêu cầu current = H1 trước, mà chỉ return existing khi active payload `post_draft_canonical_hash = expected H1`, active `canonical_hash = current hash`, target action và verified trace key đều tương thích; mismatch trả JIRA_SYNC_STALE/JIRA_TRACE_STATE_CHANGED; (3) **nếu không có active job**, mới require current hash = H1, check duplicate đúng `project_id + jira_issue_key`, optional set trace key + audit, tính H2 và gọi `SyncApi.enqueueIssueJobIfNoneActiveInTransaction` bằng cùng db/transaction. Job insert và trace-link commit/rollback cùng nhau. Payload giữ H0 ở `dry_run_canonical_hash`, H1 ở `post_draft_canonical_hash`, target provenance và H2 ở `canonical_hash`.
- Trace cardinality giữ nguyên behavior hiện hữu khi được chuyển lên request path: 0 match => create path; đúng 1 match => verified trace-link rồi update path; nhiều hơn 1 => 409 JIRA_TRACE_CONFLICT, zero identity/job/Jira write và vẫn mark CIS issue conflict, tạo anomaly critical cùng failed journal `jira_trace_conflict` (sync_job_id = null, correlation/actor từ request). Không được rơi từ multiple match sang create.
- Create job phải re-run trace search ngay trước `JiraClient.createIssue` để không mở rộng TOCTOU window do trace resolution ở request: vẫn 0 match mới được create; nếu đã xuất hiện đúng 1 match thì trả non-retryable JIRA_TRACE_STATE_CHANGED, zero Jira write và yêu cầu dry-run/request lại để đi verified-link path; nếu >1 thì áp dụng JIRA_TRACE_CONFLICT + conflict/anomaly/journal với sync_job_id hiện hữu, zero Jira write. Không auto đổi create job cũ thành update vì H2/target provenance đã thay đổi. Recheck này khôi phục guard hiện hữu; Jira API không có transaction search+create nên remote race nhỏ còn lại phải được ghi nhận, không giả vờ có exactly-once guarantee.
- `handlePushIssueJob` không còn nhánh `link_update` sửa một Jira key chưa được CIS sở hữu. Job chỉ nhận create path với expected key null hoặc update path với key đã được CIS link trước enqueue. Worker chạy readiness gate **trước** khi mark issue `syncing`; sau khi mark, chỉ re-read canonical snapshot/hash, link/target state và trạng thái của chính job (hoặc dùng worker-specific snapshot không reject own `syncing`). Worker so `job.payload_json.canonical_hash` (H2) với hash mới ngay trước Jira create/update/transition. Mismatch trả JIRA_SYNC_STALE và tạo zero external write.
- H2 chỉ là final read check nếu mọi canonical writer tôn trọng `syncing`. Vì vậy shared `CisRepository.upsertBacklogIssue` phải BEGIN IMMEDIATE, re-read existing issue và khi status/sync_status = syncing thì throw retryable `ISSUE_SYNC_IN_PROGRESS` **trước mọi issue/revision/comment/attachment mutation**. Backlog job quay lại pending; sau Jira worker hoàn tất nó mới retry/upsert và làm dry-run tiếp theo stale. Canonical PATCH và identity link tiếp tục dùng guard syncing hiện hữu.
- Nếu issue đã có jira_issue_key, Jira getIssue 404/forbidden phải block bằng JIRA_LINKED_ISSUE_NOT_FOUND/JIRA_LINKED_ISSUE_UNAVAILABLE; không fallback trace search/create.
- saveJiraSyncResult nhận expected_jira_issue_key và update compare-and-set bằng normalized/case-insensitive comparison. `create` dùng expected null; `update` dùng linked key. Zero-row update trả EXTERNAL_LINK_CONFLICT, không overwrite identity khác.
- Test race link vs push pending/running, hai request sync Jira đồng thời chỉ tạo một active job, Backlog upsert bắt đầu sau final H2 check bị block/retry với zero CIS mutation, link sau worker hash check, linked target missing, trace target đã thuộc issue khác, hai request trace-link cùng target và save-result compare-and-set.

Success response:

~~~json
{
  "data": {
    "outcome": "linked",
    "issue_id": "cis-uuid",
    "changed_fields": ["backlog_issue_key", "jira_issue_key"],
    "external_identities": {
      "backlog": {
        "key": "DMP-21",
        "id": 12345
      },
      "jira": {
        "key": "DMP-104",
        "id": "10004"
      }
    }
  }
}
~~~

Nếu request chỉ gửi key đã gán và lookup token sau normalize bằng canonical key đang lưu, response giữ cùng shape nhưng `outcome = "unchanged"`, `changed_fields = []`; không gọi provider, không ghi journal. `external_identities.*.key` phản ánh key đã persist sau commit; `id` chỉ có cho field vừa được provider verify trong request này, field cũ không lookup có thể trả id = null và field chưa gán trả null. Không thêm persistence column chỉ để phục vụ response.

Error contract:

| Code | HTTP status | Ý nghĩa UI |
| --- | --- | --- |
| BACKLOG_ISSUE_NOT_FOUND / JIRA_ISSUE_NOT_FOUND | 422 | Giữ input, báo key không tồn tại. |
| EXTERNAL_ISSUE_PROJECT_MISMATCH | 422 | Key tồn tại nhưng không thuộc integration project đã chọn. |
| EXTERNAL_LINK_ALREADY_ASSIGNED | 409 | Field của CIS issue đã có key khác; UI reload editor. |
| EXTERNAL_LINK_DUPLICATE | 409 | Key đang thuộc CIS issue khác cùng project. |
| EXTERNAL_IDENTITY_DATA_CONFLICT | 409 | Có nhiều record legacy cùng logical key; không chọn tùy ý, operator phải xử lý data debt. |
| EXTERNAL_LINK_CONFLICT | 409 | Race giữa verify và transaction; UI reload editor. |
| ISSUE_SYNC_IN_PROGRESS | 409 | Có Jira push pending/running hoặc issue đang syncing; giữ input và yêu cầu thử lại sau. |
| EXTERNAL_PROVIDER_UNAVAILABLE | 502/504 | Provider lỗi/timeout; không ghi link, giữ input. |
| DATABASE_BUSY | 503 | Bounded whole-transaction retry đã cạn; không partial identity/journal write và không leak SQLite error. |
