# Kế hoạch Configurable Sync Workers, Queue Routing và Rate Limit

> Trạng thái: Draft v4 — bổ sung configurable concurrency, chưa triển khai.

## 1. Mục tiêu

Cho phép chạy nhiều Sync worker từ cùng một codebase nhưng mỗi worker chỉ xử lý các queue item phù hợp với cấu hình runtime của nó.

Kế hoạch phải đồng thời bảo đảm:

- Worker không lấy nhầm loại job ngoài capability đã cấu hình.
- `sync_translate_jira` tiếp tục chạy nguyên khối trong một parent job, không sinh child `translate`, `push_issue` hoặc `push_comment`.
- Nhiều worker tranh job trên cùng SQLite không xử lý trùng do lỗi claim.
- Reload Admin UI không làm mất job; candidate row tiếp tục overlay/poll job đang active như hiện tại.
- Retry quay lại đúng nhóm worker mà không cần sửa metadata routing trên queue row.
- Có thể giới hạn tổng số Backlog queue job bắt đầu xử lý ở mức `20 job / 60 giây`, kể cả khi có nhiều worker process.
- Worker chết hoặc mất lease không được phép ghi đè kết quả của worker đã nhận lại job.
- Readiness phản ánh consumer thực sự đang sống cho lane cần thiết, không chỉ đọc `WORKER_ENABLED` của API process.

## 2. Quyết định đã chốt

### 2.1 Routing dùng `job_type` làm nguồn sự thật

Không thêm các cột sau vào `sync_jobs`:

- `worker_lane`
- `queue_name`
- `assigned_worker_id`
- `rate_lane`

`sync_jobs.job_type` là dữ liệu routing canonical. Logical lane được suy ra từ execution profile trong source code.

Lý do chính: một pending `manual_pull` hiện có thể được promote tại chỗ thành `sync_translate_jira`. Nếu persist thêm lane, job có thể đổi type nhưng giữ lane cũ.

### 2.2 Worker chọn logical lane bằng config

Mỗi worker process dùng cùng executable và truyền danh sách lane được phép xử lý qua `WORKER_LANES`.

Worker không được nhận arbitrary `job_type` trực tiếp từ config. Registry trong source code quyết định job type nào thuộc lane nào.

### 2.3 Mỗi worker process có configurable concurrency

Thêm `WORKER_CONCURRENCY` để giới hạn số queue job async tối đa cùng chạy trong một worker process.

- Default là `1` để giữ hành vi hiện tại.
- Giá trị hợp lệ ban đầu là integer từ `1` đến `32`; invalid value làm worker fail startup.
- Đây là số in-flight handler Promise, không tạo `worker_threads` hoặc CPU thread pool.
- Concurrency dùng chung cho toàn bộ lane của process, không nhân riêng theo từng lane.
- Worker chỉ claim khi còn execution slot; không lock trước một batch job đang phải chờ slot.

Có thể scale bằng tăng `WORKER_CONCURRENCY`, chạy thêm worker process cùng lane, hoặc kết hợp cả hai. SQLite shared claim và shared rate budget phải giữ tổng hành vi đúng trong mọi trường hợp.

### 2.4 Queue throughput khác provider request rate

Giới hạn `20 job / 60 giây` là số background queue attempt bắt đầu xử lý cho nhóm Backlog, không phải số HTTP request gửi tới Backlog.

Một `manual_pull` có thể gọi nhiều Backlog endpoint và tải nhiều attachment. Giới hạn request thật tại `BacklogRequestGateway` là một scope khác, không triển khai trong kế hoạch này.

### 2.5 `sync_translate_jira` dùng lane riêng

Job tổng hợp có contract:

```text
job_type       = sync_translate_jira
direction_from = backlog
direction_to   = jira
worker lane    = delivery (derived, không persist)
start rate key = backlog_job_start
```

Nó không được chuyển tuần tự qua Backlog worker, Translation worker và Jira worker.

### 2.6 Inline execution tiếp tục là đường riêng

`runJobNow`/`lockById` hiện phục vụ các use case cố ý chạy ngay như Pull one và dịch trực tiếp trong Issue Editor. Đường này không chịu background worker lane routing.

Queue endpoint và background worker không được dùng inline path để bypass lane/rate policy.

### 2.7 Governance gate trước implementation

Plan này đang đề xuất thay đổi một quyết định còn hiệu lực:

- `docs/app/10-decisions/README.md` chốt `Một service Express + worker nội bộ`.
- `docs/app/02-product/README.md` đang xếp distributed worker ngoài Lite.

Vì vậy chưa được triển khai standalone multi-process worker chỉ bằng việc approve technical plan này. SW-00 phải draft và được người review chấp thuận quyết định supersede/thu hẹp lại như sau:

```text
Cho phép nhiều Sync worker process trên cùng một host,
dùng cùng release artifact và cùng local SQLite database.
Không hỗ trợ multi-host worker, remote broker hoặc cloud-native scaling.
```

Nếu decision không được chấp thuận, fallback trong Lite là nhiều configured worker loop nằm trong cùng Express process; khi đó bỏ standalone entrypoint và DB worker-liveness heartbeat, nhưng vẫn giữ execution profile, lane-aware claim và shared rate policy.

## 3. Phạm vi

### Trong phạm vi

- Central execution profile cho các runnable sync job hiện tại.
- Config `WORKER_LANES` và validation fail-fast.
- Config `WORKER_CONCURRENCY` với default/safety bound rõ ràng.
- Lane-aware atomic claim dựa trên `job_type`.
- Long-running worker-only entrypoint.
- Một process xử lý tối đa `WORKER_CONCURRENCY` job đồng thời.
- Loop xử lý job kế tiếp ngay sau khi job trước terminal; poll interval chỉ dùng khi idle/throttled.
- Worker liveness heartbeat và lane-aware readiness.
- Job lease renewal, stale recovery an toàn và completion ownership check.
- Shared SQLite rate budget cho Backlog background job starts.
- Enqueue validation để job type không có execution profile không nằm pending vô hạn.
- Regression cho retry, promotion, reload overlay và composite delivery.
- Cập nhật technical, operation, architecture interaction và quality docs sau implementation.

### Ngoài phạm vi

- Redis, RabbitMQ, Kafka, BullMQ hoặc một queue framework mới.
- Multi-host/distributed worker dùng shared network filesystem hoặc remote queue.
- `worker_threads`, child-process worker pool hoặc CPU parallelism framework.
- Provider HTTP request rate limiter/circuit breaker.
- Admin UI để sửa worker config hoặc rate policy.
- Per-Project hoặc per-credential rate policy.
- Bật lại Project pull hoặc Scheduled pull.
- Thêm business action/job type mới.
- Thay đổi translation review semantics, mapping, Jira dry-run hoặc canonical normalization.
- Distributed transaction rollback cho Backlog/Jira.
- Cưỡng bức hủy một handler đang thực thi external request.

## 4. Hiện trạng cần thay đổi

### 4.1 Worker config hiện quá ít

`src/config/env.js` hiện chỉ có:

```text
WORKER_ENABLED
WORKER_ID
WORKER_POLL_INTERVAL_MS
WORKER_LOCK_TIMEOUT_SECONDS
```

Chưa có capability/lane hoặc concurrency nên `workerId` chỉ là nhãn audit, không giới hạn loại job được nhận; boolean `running` hiện cũng khóa process ở đúng một in-flight job.

### 4.2 Mọi worker lấy chung mọi pending job

`SyncJobRepository.lockNext()` hiện chọn pending job theo Project gate, priority, `run_after` và `created_at`, nhưng không lọc `job_type`.

Tham số `limit = 50` hiện không phải batch: query lấy tối đa 50 row rồi chỉ dùng `.at(0)`. Target phải dùng `LIMIT 1` cho mỗi atomic claim.

### 4.3 Handler chỉ được chọn sau khi job đã lock

`runWorkerOnce()` chỉ truyền `workerId`; `runLockedJob()` mới gọi `getHandler(job.job_type)` sau khi queue item đã chuyển sang `running`.

Kết quả là một worker dự kiến chỉ phục vụ Jira vẫn có thể lock `manual_pull` hoặc `translate`.

### 4.4 Chưa có standalone continuous worker

- API server chỉ start một embedded worker khi `WORKER_ENABLED=true`.
- `npm run sync:worker-once` chỉ chạy một lượt rồi thoát.
- Chưa thể vận hành nhiều worker độc lập mà không start thêm HTTP server hoặc tự viết vòng lặp bên ngoài.

### 4.5 Claim chưa phù hợp multi-process

`lockNext()` đang dùng deferred transaction. Khi hai process cùng đọc candidate, một process có thể gặp `SQLITE_BUSY_SNAPSHOT` dù điều kiện update `status='pending'` đã giảm nguy cơ xử lý trùng.

Repo đã có `runImmediateTransaction()` với retry busy; phải reuse helper này.

### 4.6 Stale recovery có thể nhận lại job còn sống

Worker hiện không renew `locked_at` trong lúc handler chạy. Nếu một composite job chạy lâu hơn `WORKER_LOCK_TIMEOUT_SECONDS`, worker khác có thể đưa nó về pending và xử lý lại.

Đây là blocker trước khi chạy nhiều worker process, đặc biệt với external Jira write.

### 4.7 Readiness chỉ nhìn config của API process

Candidate readiness hiện dùng `config.worker.enabled`. Khi worker tách process:

- API worker disabled nhưng external consumer đang sống: báo unavailable sai.
- API worker enabled nhưng không có `delivery` consumer: báo ready sai.

### 4.8 Database cho phép job type chưa có handler

Schema hiện cho phép một số type như `webhook_ingest`, `dry_run`, `push_attachment`, `retry`, trong khi default handler registry không có đủ handler tương ứng.

Sau khi worker lọc lane, một job không routable có thể pending vô hạn. Enqueue phải validate execution profile trước khi insert.

## 5. Thiết kế đích

```text
HTTP action
  -> local business/readiness gate
  -> enqueue job_type canonical
  -> sync_jobs(status=pending)

Worker process
  -> load WORKER_LANES
  -> register/heartbeat worker instance
  -> resolve lane -> runnable job types từ execution registry
  -> atomic claim + shared start-rate reservation
  -> renew job lease trong lúc handler chạy
  -> handler theo job_type
  -> conditional success/retry/failed theo locked_by
```

### 5.1 Thuật ngữ

| Thuật ngữ | Ý nghĩa | Có persist trên `sync_jobs`? |
|---|---|---|
| `job_type` | Business/execution type canonical của job | Có |
| `worker lane` | Nhóm capability mà worker được cấu hình nhận | Không |
| `worker_id` | Tên vận hành lấy từ `WORKER_ID` | Không |
| `worker_instance_id` | ID duy nhất cho một lần start process và là lease owner | Chỉ qua `locked_by` khi running; registration persist riêng |
| `start rate key` | Shared budget cho queue attempt bắt đầu | Không persist trên job; event ledger persist riêng |
| provider capability | Quyền external read/write theo Project | Đã persist trong Project |

### 5.2 Execution profile registry

Mở rộng registry hiện có thành nguồn sự thật duy nhất cho handler và routing metadata:

```js
registerHandler("manual_pull", {
  lane: "backlog",
  startRateKey: "backlog_job_start",
  externalAccess: true,
  handler: manualPullHandler,
});
```

Không tạo một map lane riêng và một `EXTERNAL_JOB_TYPES` riêng nếu cùng metadata có thể nằm trong execution profile.

Mapping chốt:

| `job_type` | Lane | Start rate key | External scope |
|---|---|---|---|
| `manual_pull` | `backlog` | `backlog_job_start` | Có |
| `sync_translate_jira` | `delivery` | `backlog_job_start` | Có |
| `translate` | `translation` | Không | Không dùng Backlog/Jira scope |
| `push_issue` | `jira` | Không trong phase này | Có |
| `push_comment` | `jira` | Không trong phase này | Có |
| `noop_test` | `local` | Không | Không |

Job type có trong DB constraint nhưng chưa có execution profile không được enqueue qua public API.

### 5.3 Worker config contract

Target config:

```env
WORKER_ENABLED=true
WORKER_ID=backlog-01
WORKER_LANES=backlog
WORKER_CONCURRENCY=1
WORKER_POLL_INTERVAL_MS=1000
WORKER_LOCK_TIMEOUT_SECONDS=300
WORKER_HEARTBEAT_INTERVAL_MS=5000

BACKLOG_QUEUE_MAX_STARTS=20
BACKLOG_QUEUE_WINDOW_SECONDS=60
```

Luật validation:

- `WORKER_ENABLED=false`: không start embedded/standalone worker.
- `WORKER_ENABLED=true`: bắt buộc có `WORKER_ID` và ít nhất một lane.
- `WORKER_CONCURRENCY` mặc định `1`, phải là integer trong khoảng `1..32`.
- Lane phải thuộc registry lane hiện có; unknown lane làm worker fail startup.
- CSV được trim, lowercase và loại trùng.
- Không đưa secret hoặc Project credential vào worker registration.
- Không có implicit lane cho worker production.
- Test/local config phải khai báo lane rõ; không dùng magic fallback theo `NODE_ENV`.

Local có thể chạy một general worker có danh sách explicit:

```env
WORKER_LANES=backlog,translation,jira,delivery,local
```

Production khuyến nghị một lane trên mỗi process để dễ giới hạn tài nguyên và quan sát lỗi.

Ví dụ Translation worker có ba execution slot:

```env
WORKER_ID=translation-01
WORKER_LANES=translation
WORKER_CONCURRENCY=3
```

`sync:worker-once` vẫn chỉ claim/chạy đúng một job, không mở đủ concurrency slot; command này là diagnostic one-shot, không phải continuous runtime.

### 5.4 Long-running worker entrypoint

Thêm executable:

```text
scripts/sync-worker.js
npm run sync:worker
```

Entry point chịu trách nhiệm:

1. Load/validate config.
2. Chạy migration.
3. Register worker instance và lane.
4. Start worker loop.
5. Xử lý `SIGINT`/`SIGTERM`.
6. Dừng nhận job mới, chờ job đang chạy kết thúc trong giới hạn hợp lý.
7. Mark worker stopped hoặc xóa active registration khi shutdown sạch.

Embedded worker trong API server và standalone worker phải dùng cùng `createWorker()`; không tạo hai implementation loop.

### 5.5 Worker loop và execution slots

Worker giữ một `Map` các active claim theo job ID. Số entry không được vượt `WORKER_CONCURRENCY`.

Target behavior:

```text
available_slots = concurrency - active_jobs
  -> claim tối đa available_slots, mỗi lần đúng một job
  -> start handler ngay sau từng claim

một active job terminal
  -> xóa đúng job khỏi active map
  -> fill lại slot ngay, không chờ poll interval

mọi slot đang bận
  -> chờ ít nhất một active job settle

không claim được job ở mọi lane nhưng vẫn còn slot
  -> chờ WORKER_POLL_INTERVAL_MS

lane bị throttle
  -> thử lane khác
  -> nếu mọi lane idle/throttled, chờ tới poll hoặc retry_at gần nhất
```

Với multi-lane local worker, rotate lane theo round-robin để một lane có priority cao không starve lane khác.

Mỗi claim vẫn là một transaction riêng. Worker không batch-lock nhiều hơn số slot còn trống. Một handler lỗi chỉ terminal job của slot đó, không cancel các sibling job đang chạy.

Khi graceful shutdown:

1. Dừng claim job mới.
2. Tiếp tục heartbeat process và renew lease cho mọi active claim.
3. Chờ các active handler settle.
4. Sau khi active map rỗng mới mark worker stopped và kết thúc sạch.

Nếu runtime bị kill trước khi drain xong, các job còn lại đi qua stale recovery như hiện tại.

### 5.6 Lane-aware atomic claim

Repository nhận danh sách runnable job type đã được application layer resolve:

```js
claimNext({
  workerInstanceId,
  jobTypes,
  ratePolicy,
});
```

Repository không biết tên lane và không import handler registry.

Trong một `BEGIN IMMEDIATE` transaction:

1. Kiểm tra/prune shared rate events nếu lane có rate policy.
2. Nếu budget đầy, return `{ state: "throttled", retry_at }` và không tăng attempt.
3. Select đúng một pending candidate có `job_type IN (...)`.
4. Nếu không có candidate, return `{ state: "idle" }` và không tiêu thụ budget.
5. Update candidate thành `running`, ghi `locked_by`, `locked_at`, tăng `attempt_count`.
6. Insert start-rate event bằng attempt count mới nếu áp dụng.
7. Insert `job_locked` journal.
8. Commit và return `{ state: "claimed", job }`.

Không xây placeholder SQL bằng input thô. Danh sách type phải được validate từ registry và bind bằng parameter.

### 5.7 Shared Backlog queue rate limit

Budget `backlog_job_start` được chia sẻ bởi:

- `manual_pull` worker lane.
- `sync_translate_jira` delivery lane.
- Mọi worker process trong cùng database.

Mặc định target:

```text
max starts = 20
rolling window = 60 seconds
scope = toàn bộ runtime/database
```

Vì budget là shared nhưng threshold đến từ runtime config, mọi worker process phải load cùng một artifact và cùng bộ `BACKLOG_QUEUE_*`. Per-process override khác nhau là deployment không được hỗ trợ. Worker phải log effective rate policy khi start và runbook phải đối chiếu trước khi scale thêm process; nếu sau này cần thay policy độc lập theo runtime, chuyển policy thành shared DB config trong một kế hoạch riêng.

Mỗi retry attempt được tính là một lần start mới. Job bị throttle:

- Vẫn ở `pending`.
- Không tăng `attempt_count`.
- Không tạo `job_failed`/`job_retry_scheduled` journal.
- Không giữ lease.
- Không chặn worker thử lane khác.

Dùng event ledger rolling-window thay vì counter trong memory để nhiều process không nhân quota.

### 5.8 Worker liveness và lane-aware readiness

Mỗi lần start, worker tạo một `worker_instance_id` runtime duy nhất. `WORKER_ID` chỉ là tên vận hành dễ đọc; nó không được dùng làm lease owner vì process cũ và process mới có thể cùng mang một tên.

Worker register heartbeat tối thiểu gồm:

```text
worker_instance_id
worker_id
lanes_json
concurrency
started_at
heartbeat_at
lease_expires_at
```

Worker tự tính `lease_expires_at`, ví dụ từ `max(3 * heartbeat interval, 15 giây)`, và cập nhật nó trong mỗi heartbeat. API chỉ coi worker live khi `lease_expires_at > now`; API không suy TTL bằng config của chính API process.

Registration lưu effective concurrency để vận hành/debug; readiness chỉ cần ít nhất một live instance hỗ trợ lane, không cộng concurrency thành business capability.

Required lane theo candidate action:

| Action | Required live lane |
|---|---|
| `Sync to CIS` | `backlog` |
| `Sync + Translate` | `backlog` và `translation` |
| `Sync + Translate + Jira` | `delivery` |

Readiness contract phải có ba action key riêng:

```text
sync_to_cis
sync_translate
sync_translate_jira
```

`syncCandidateToCis()` chọn readiness key từ request flags trước enqueue:

```text
push_to_jira = true       -> sync_translate_jira
with_translation = true  -> sync_translate
còn lại                  -> sync_to_cis
```

Không được tiếp tục kiểm tra cứng `actions.sync_to_cis` cho cả ba request. Endpoint và payload hiện tại được giữ nguyên; chỉ action-readiness result và gate selection được tách đúng capability.

`WORKER_ENABLED` chỉ quyết định process hiện tại có start embedded worker hay không; nó không còn là bằng chứng toàn hệ thống có consumer.

Giữ error code `SYNC_WORKER_UNAVAILABLE` để hạn chế FE churn, nhưng bổ sung structured details:

```json
{
  "required_lanes": ["delivery"],
  "missing_lanes": ["delivery"]
}
```

### 5.9 Job lease renewal và ownership

Trong lúc handler chạy, worker định kỳ gọi:

```js
renewLock({ jobId, workerInstanceId })
```

Update chỉ thành công khi:

```text
status = running
locked_by = workerInstanceId
attempt_count = claimedAttemptCount
```

Renew interval được derive nhỏ hơn `WORKER_LOCK_TIMEOUT_SECONDS / 3`; không thêm một config knob nếu chưa cần.

Một process dùng một lease-renew loop chung để renew toàn bộ entry trong active-job map; không tạo một unmanaged timer riêng cho từng slot. Renew failure của một claim được xử lý/fence độc lập và không dừng renew cho sibling claims.

`sync_jobs.locked_by` lưu `worker_instance_id`. `renewLock()`, `markSuccess()` và `markFailed()` phải nhận cả instance ID và attempt count đã claim, rồi update conditionally theo hai giá trị. Cặp này là fencing token tối thiểu; worker mất lease không được ghi terminal state lên job đã được worker khác nhận lại.

Stale recovery tiếp tục là global sweep, không cần lọc lane vì nó chỉ giải phóng lease, không execute handler. Mọi update recovery phải có điều kiện chống race và chạy bằng immediate transaction.

### 5.10 Retry và idempotency

- Auto retry giữ nguyên `job_type`, vì vậy tự quay lại đúng derived lane.
- Manual retry giữ nguyên `job_type` và payload.
- Retry attempt tiếp tục tăng theo policy hiện tại; không reset ngầm.
- Backoff/retry-after hiện có được giữ nguyên.
- Rate budget tính từng retry attempt.
- Handler external phải chịu mô hình at-least-once: crash có thể xảy ra sau remote write nhưng trước local `markSuccess`.

Trước khi cho phép multi-worker production, verifier phải chứng minh retry/recovery của `sync_translate_jira` không tạo Jira issue trùng trong fake state. Nếu code hiện tại không bảo đảm crash-window này, phải bổ sung reconciliation/idempotency trong owner Jira flow trước cutover; lane routing không được coi là giải pháp idempotency.

### 5.11 Composite `sync_translate_jira`

`sync_translate_jira` thuộc `delivery` lane và giữ flow hiện tại:

```text
Backlog verify/read
  -> CIS ingest/mapping
  -> direct translation toàn batch
  -> staged Jira dry-run
  -> approve/apply translation batch
  -> direct Jira delivery
  -> parent job success
```

Không enqueue child job.

Rollback hiện tại là local compensation cho translation queue/canonical snapshot. Nó không phải distributed transaction và không thể hoàn tác một Backlog read/ingest hoặc Jira external write đã thành công. Kế hoạch worker không được ghi acceptance sai thành “ACID rollback toàn hệ thống”.

## 6. Data model dự kiến

Không rebuild `sync_jobs` và không thêm routing column.

Migration mới dùng số thứ tự còn trống tại thời điểm triển khai và tạo hai bảng thuộc Sync module.

### 6.1 `sync_worker_instances`

```sql
CREATE TABLE sync_worker_instances (
  worker_instance_id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  lanes_json TEXT NOT NULL,
  concurrency INTEGER NOT NULL CHECK(concurrency >= 1),
  started_at TEXT NOT NULL,
  heartbeat_at TEXT NOT NULL,
  lease_expires_at TEXT NOT NULL,
  stopped_at TEXT
);

CREATE INDEX idx_sync_worker_instances_heartbeat
  ON sync_worker_instances(lease_expires_at);

CREATE INDEX idx_sync_worker_instances_worker_id
  ON sync_worker_instances(worker_id);
```

Đây là operational liveness state, không phải audit trail. Runtime instance ID được tạo mới cho mỗi process start; stale row được cleanup theo retention, không được upsert thành một process khác.

### 6.2 `sync_job_start_events`

```sql
CREATE TABLE sync_job_start_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rate_key TEXT NOT NULL,
  sync_job_id TEXT NOT NULL,
  attempt_count INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(sync_job_id, attempt_count)
);

CREATE INDEX idx_sync_job_start_events_rate_time
  ON sync_job_start_events(rate_key, started_at);
```

Old event được prune an toàn ngoài rolling window. Không gắn cascade tới `sync_jobs`, vì xóa job không được hoàn trả quota đã tiêu thụ trong window. Không dùng bảng này thay `sync_journal`; nó chỉ phục vụ shared rate calculation.

## 7. Module và file impact dự kiến

### Config/runtime

- `src/config/env.js`
- `src/server.js`
- `scripts/sync-worker.js` mới
- `scripts/sync-worker-once.js`
- `package.json`

### Sync application

- `src/modules/Sync/application/handlerRegistry.js`
- `src/modules/Sync/application/createWorker.js`
- `src/modules/Sync/application/runWorkerOnce.js`
- `src/modules/Sync/application/runJobNow.js`
- `src/modules/Sync/application/recoverStaleJobs.js`
- Có thể thêm helper nhỏ cho execution profile/config validation trong `src/modules/Sync/application/`; không tạo framework/factory chung.

### Sync infrastructure

- `src/modules/Sync/infrastructure/SyncJobRepository.js`
- Repository liveness/rate nhỏ trong Sync infrastructure nếu tách làm file giúp transaction ownership rõ.
- Migration mới trong `src/db/migrations/`.

### Readiness/API/FE

- `src/modules/Backlog/application/getIssueActionReadiness.js`
- Public `SyncApi` capability để query live lane; Backlog không import sâu Sync infrastructure.
- Existing Backlog Issues FE chỉ render reason/details mới; không thêm screen, auto-refresh toàn page hoặc worker config form.

### Documentation

- `docs/app/02-product/README.md`
- `docs/app/05-architecture/03-interactions/README.md`
- `docs/app/06-technical/README.md`
- `docs/app/08-quality/README.md`
- `docs/app/09-operation/README.md`
- `docs/app/10-decisions/README.md` và decision instance supersede/replace được review.
- README module Sync nếu execution/operation truth thay đổi.

## 8. Kế hoạch triển khai theo phase

### SW-00 — Baseline và contract freeze

Mục tiêu: xác nhận working tree/test baseline trước khi đổi worker core.

Việc làm:

- Ghi lại runnable job types và mọi caller của `runWorkerOnce`, `runJobNow`, `lockNext`, retry, stale recovery.
- Draft decision thay đổi `một service Express + worker nội bộ` thành optional same-host worker processes; ghi rõ không mở multi-host/distributed queue scope.
- Cập nhật Product scope dự kiến nhưng chỉ materialize sau khi người review approve decision.
- Xác nhận Project pull và Scheduled pull vẫn disabled.
- Xác nhận candidate reload overlay hiện có cho `manual_pull` và `sync_translate_jira`.
- Chạy verifier Sync/Backlog/Translation/Jira hiện hữu.
- Tách lỗi baseline hoặc working-tree change không thuộc plan; không trộn vào implementation diff.

Gate:

- [ ] Baseline commands pass hoặc mọi pre-existing failure được ghi rõ.
- [ ] Không sửa migration cũ đã apply.
- [ ] Human review chấp thuận decision/runtime scope trước SW-01; nếu không, plan chuyển sang fallback in-process.

### SW-01 — Execution profile và worker config

Mục tiêu: tạo một nguồn sự thật cho handler, lane và execution metadata.

Việc làm:

- Đổi handler registry entry thành execution profile.
- Bỏ `EXTERNAL_JOB_TYPES` duplicate, đọc `externalAccess` từ profile.
- Parse/validate `WORKER_LANES`.
- Parse/validate `WORKER_CONCURRENCY`, default `1`, bound `1..32`.
- Thêm API resolve lane thành validated job type list.
- Enqueue từ public API từ chối type không có runnable profile.
- Cập nhật temp config/verifier fixtures khai báo lane explicit.

Gate:

- [ ] Unknown/empty lane fail trước khi worker nhận job.
- [ ] Mọi runnable type có đúng một lane.
- [ ] DB-allowed nhưng unhandled type không thể bị enqueue thành pending orphan.

### SW-02 — Lane-aware atomic claim

Mục tiêu: worker chỉ claim job phù hợp và nhiều process tranh lock an toàn.

Việc làm:

- `runWorkerOnce` resolve config lane trước khi gọi repository.
- `lockNext`/target `claimNext` nhận validated job types.
- SQL thêm `job_type IN (...)`, dùng `LIMIT 1`.
- Chuyển claim transaction sang `runImmediateTransaction`.
- Giữ priority/run-after/created ordering trong từng lane.
- Thêm round-robin cursor cho multi-lane worker.

Gate:

- [ ] Backlog worker không claim Translation/Jira/delivery job.
- [ ] Delivery worker chỉ claim `sync_translate_jira`.
- [ ] Pending promotion `manual_pull -> sync_translate_jira` tự chuyển consumer do `job_type`, không update lane column.
- [ ] Hai worker không cùng claim một queue row.

### SW-03 — Concurrent continuous worker runtime

Mục tiêu: vận hành configurable async execution slots và nhiều worker process mà không start HTTP server phụ.

Việc làm:

- Thêm `scripts/sync-worker.js` và npm command.
- Refactor `createWorker` thành shared long-running loop.
- Thay boolean `running` bằng active-job map/promise set có giới hạn.
- Chỉ claim theo số slot trống; start handler ngay sau claim.
- Sau mỗi terminal job, fill lại đúng slot ngay.
- Chỉ chờ poll interval khi idle/throttled.
- Graceful stop không nhận thêm job nhưng vẫn renew mọi active lease trong lúc drain.
- `stop()` trở thành async drain contract; server/standalone entrypoint phải await hoặc gắn shutdown completion rõ ràng.
- Giữ lỗi/terminal state độc lập giữa các slot.

Gate:

- [ ] Standalone process chạy liên tục và shutdown sạch.
- [ ] Embedded và standalone dùng cùng implementation.
- [ ] Active jobs không bao giờ vượt configured concurrency.
- [ ] Khi một slot terminal, worker fill lại slot mà không chờ poll interval.
- [ ] Không claim/batch-lock job khi chưa có execution slot.

### SW-04 — Worker heartbeat và job lease safety

Mục tiêu: readiness đúng và long-running job không bị nhận lại khi worker còn sống.

Việc làm:

- Tạo migration liveness/rate event tables.
- Tạo runtime instance ID; register/heartbeat/stop worker instance.
- Renew job lock trong lúc handler chạy.
- Conditional terminal update theo `locked_by`.
- Harden stale recovery bằng immediate transaction và conditional update.
- Expose live-lane capability qua `SyncApi`.
- Tách ba readiness action key và đổi `syncCandidateToCis()` chọn key theo `with_translation`/`push_to_jira`.
- Đổi Backlog action readiness theo required live lanes.

Gate:

- [ ] Job được renew không bị stale recovery.
- [ ] Job hết lease được recover đúng retry policy.
- [ ] Worker cũ mất lease hoặc trùng `WORKER_ID` không thể mark success/failed cho instance mới.
- [ ] Readiness đổi sang unavailable sau heartbeat TTL.
- [ ] Plain Sync, Sync + Translate và Sync + Translate + Jira kiểm đúng readiness key/lane riêng.

### SW-05 — Shared Backlog job-start rate limit

Mục tiêu: tổng `manual_pull + sync_translate_jira` không quá 20 starts trong rolling 60 giây trên cùng DB.

Việc làm:

- Parse/validate Backlog queue rate config.
- Atomic count/reserve event trong claim transaction.
- Return `throttled` cùng `retry_at` mà không lock/tăng attempt.
- Loop thử lane khác khi một lane bị throttle.
- Prune old rate events.
- Bổ sung metrics/log tối thiểu: claimed, idle, throttled, lease-lost; không tạo màn mới.

Gate:

- [ ] Start 1-20 được phép; start 21 trong window bị giữ pending.
- [ ] Hai worker chia sẻ cùng budget, không thành 40.
- [ ] Delivery job cũng tiêu thụ `backlog_job_start`.
- [ ] Qua window, pending job tiếp tục được claim.
- [ ] Throttle không tạo failed/retry journal giả.
- [ ] Concurrency lớn hơn một vẫn không vượt shared budget giữa mọi slot/process.

### SW-06 — Composite/idempotency regression và FE cutover

Mục tiêu: chứng minh routing mới không phá các flow quan trọng.

Việc làm:

- Verify `sync_translate_jira` vẫn không sinh child jobs.
- Verify failure một translation/dry-run rollback local batch và không gọi Jira.
- Verify retry/recovery không tạo Jira duplicate trong fake state.
- Verify candidate reload overlay/poll đúng parent job.
- FE hiển thị worker-unavailable theo missing lane nhưng không reload toàn màn.
- Cập nhật docs/app technical/operation/quality/interactions.
- Thêm runbook start/stop từng lane worker.

Gate:

- [ ] Automated regression pass.
- [ ] Manual Backlog Issues review pass cho ba action và reload giữa pending/running.
- [ ] Không có Project pull hoặc Scheduled pull được bật lại.

## 9. Test matrix bắt buộc

### Config và registry

- Parse một lane, nhiều lane, whitespace và duplicate.
- Empty/unknown lane fail-fast khi worker enabled.
- `WORKER_CONCURRENCY` absent dùng `1`; `0`, số âm, số thực, text và `>32` bị reject.
- Mỗi execution profile có handler + lane hợp lệ.
- Unhandled DB job type bị reject trước enqueue.
- `externalAccess` profile tạo scope đúng cho Backlog/Jira jobs.
- Decision same-host multi-process đã được approve trước khi standalone worker test trở thành release gate.

### Routing

- `backlog` claim `manual_pull`, không claim `translate`.
- `translation` claim `translate`, không claim `manual_pull`.
- `jira` claim `push_issue`/`push_comment`.
- `delivery` claim `sync_translate_jira`.
- Multi-lane local worker rotate lane, không starve.
- Retry giữ nguyên lane qua derived `job_type`.
- Pending promotion chuyển từ Backlog consumer sang delivery consumer.

### Atomic claim/concurrency

- Hai process/connection cùng claim chỉ một process nhận cùng job.
- Concurrency `3` không bao giờ có quá ba active handler.
- Có năm pending job thì chỉ ba job đầu được lock trước khi có slot terminal.
- Một slot fail/retry không dừng hai sibling slot.
- Slot terminal được fill ngay; poll interval chỉ áp dụng khi không claim được thêm.
- Graceful stop không claim mới và vẫn renew lease cho active jobs.
- SQLITE busy được retry theo helper hiện có.
- Priority và `run_after` vẫn đúng trong allowed types.
- Disabled Project hoặc `sync_enabled=false` vẫn không được claim.

### Lease/recovery

- Runtime worker instance được register và expire đúng `lease_expires_at`.
- Hai process trùng `WORKER_ID` vẫn có instance ID/lease ownership độc lập.
- Job renew lease không bị recover.
- Lease-renew loop cập nhật mọi active slot; lỗi một claim không làm sibling claims mất renew.
- Worker crash làm lease expire rồi job được pending/failed theo attempts.
- Late completion sai `workerInstanceId` hoặc sai attempt fencing token bị từ chối.
- Clean shutdown dừng claim mới.

### Rate limit

- 20 starts trong rolling window pass.
- Start thứ 21 pending/throttled, attempt count không đổi.
- Hai worker Backlog chia sẻ 20 starts.
- Backlog + delivery chia sẻ cùng rate key.
- Retry attempt tiêu thụ một start.
- Throttle Backlog không chặn Translation lane.
- Concurrency lớn hơn một vẫn không vượt shared budget 20 starts giữa mọi slot/process.
- Window hết hạn cho phép claim lại.

### Critical workflows

- Candidate Sync to CIS queue/reload/poll.
- Ba request flag combination chọn đúng `sync_to_cis`/`sync_translate`/`sync_translate_jira` readiness key.
- Sync + Translate parent/child routing qua Backlog và Translation lanes.
- Sync + Translate + Jira chỉ một parent delivery job.
- Dry-run block không gọi Jira.
- Translation batch failure không partial approve/apply.
- Jira provider retry/recovery không tạo duplicate trong fake state.
- Pull one và Issue Editor immediate translation vẫn chạy inline như contract hiện tại.
- Project pull và Scheduled pull vẫn disabled.

### Lệnh verify dự kiến

```text
npm run verify:sync-jobs
npm run verify:sync-workers
npm run verify:system-issues
npm run verify:translation-review
npm run verify:sync-translate-jira
npm run verify:external-provider-gateways
npm run verify:external-egress-boundary
npm run verify:admin-ui-e2e
npm test
```

Thêm `verify:sync-workers` làm verifier local/fake tập trung cho routing, multi-connection claim, heartbeat, lease và shared rate limit; không gọi provider thật.

## 10. Rollout và rollback

### Rollout

1. Backup SQLite theo runbook hiện có.
2. Deploy migration và code nhưng chưa start nhiều worker.
3. Start một worker với lane explicit; xác nhận registration/heartbeat.
4. Start lần lượt Backlog, Translation, Jira và delivery workers.
5. Kiểm readiness từng action và pending queue.
6. Chỉ tăng số process cùng lane sau khi atomic claim, lease renewal và shared rate verifier pass.
7. Theo dõi failed/retry, lease-lost và throttled evidence.

Không chạy embedded general worker và standalone general worker ngoài ý muốn. Overlap lane được phép về mặt correctness nhưng phải là quyết định deployment rõ ràng.

### Rollback

1. Dừng standalone workers mới.
2. Rollback application artifact cùng API/Admin Web nếu contract readiness đã đổi.
3. Giữ migration additive; bảng heartbeat/rate event có thể tồn tại không được code cũ dùng.
4. Không sửa/xóa `sync_jobs` hoặc journal bằng tay.
5. Nếu cần restore DB, dùng backup và dừng toàn bộ writer trước restore.

## 11. Rủi ro và cách giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Persist lane lệch sau job promotion | Không persist lane; derive từ `job_type` |
| Hai worker nhân quota | Shared SQLite event ledger |
| Concurrency cao làm quá tải SQLite/provider | Default `1`, validation cap `32`, shared rate budget và tăng dần theo số liệu |
| Hai process dùng threshold/window khác nhau | Cùng artifact/env, log effective policy và cutover check; chưa hỗ trợ per-process override |
| Worker chết giữa external write và mark success | Lease ownership + handler idempotency/reconciliation |
| Runtime target mâu thuẫn accepted Lite decision | Decision supersede + human gate ở SW-00; fallback in-process nếu không approve |
| Long job bị stale recovery khi còn chạy | Periodic lease renewal |
| API báo worker ready sai | Live heartbeat theo lane |
| Một lane starve lane khác | Dedicated process production; round-robin cho multi-lane local |
| Job type không có handler pending vô hạn | Validate execution profile trước enqueue |
| Rate limit job bị hiểu là request limit | Tách rõ queue start policy và gateway request policy |
| Composite flow bị chia child queue | Dedicated `delivery` profile và regression test |
| Migration checksum lỗi | Chỉ thêm migration mới, không sửa migration cũ |

## 12. Ước lượng

| Phase | Ước lượng |
|---|---:|
| SW-00 Baseline + decision draft | 0.5 ngày |
| SW-01 Registry/config | 0.5-0.75 ngày |
| SW-02 Atomic routing claim | 0.75-1 ngày |
| SW-03 Concurrent continuous runtime | 0.75-1.25 ngày |
| SW-04 Heartbeat/lease/readiness | 1-1.5 ngày |
| SW-05 Shared rate limit | 0.75-1 ngày |
| SW-06 Regression/FE/docs/runbook | 1-1.5 ngày |

Tổng dự kiến: **5.25-7.5 ngày kỹ thuật**, chưa gồm thời gian chờ decision/manual review.

Nếu verifier phát hiện Jira create crash-window hiện chưa idempotent, cộng thêm khoảng **1-2 ngày** cho reconciliation và regression tương ứng.

## 13. Checklist người review

- [ ] Đồng ý supersede quyết định `một service Express + worker nội bộ` để cho phép worker process cùng host/cùng SQLite; không mở multi-host scope.
- [ ] Đồng ý không thêm `worker_lane`/`assigned_worker_id` vào `sync_jobs`.
- [ ] Đồng ý `WORKER_LANES` là capability config và registry source code map lane -> job type.
- [ ] Đồng ý `WORKER_CONCURRENCY` là async in-flight limit dùng chung cho mọi lane trong process, default `1`, bound `1..32`.
- [ ] Đồng ý production ưu tiên một lane mỗi worker process; concurrency tăng có kiểm soát theo workload.
- [ ] Đồng ý `manual_pull` và `sync_translate_jira` chia sẻ tổng budget 20 starts/60 giây.
- [ ] Đồng ý rate scope phase này là toàn runtime/database, chưa per Project.
- [ ] Đồng ý Pull one/Issue Editor immediate path không nằm trong background queue start limit.
- [ ] Đồng ý `delivery` là lane duy nhất cho `sync_translate_jira`.
- [ ] Đồng ý heartbeat/lease safety là gate bắt buộc trước multi-worker production.
- [ ] Đồng ý tách readiness thành `sync_to_cis`, `sync_translate`, `sync_translate_jira` theo request flags.
- [ ] Đồng ý rollback composite hiện là local compensation, không mô tả thành distributed ACID rollback.

## 14. Definition of Done

Kế hoạch được coi là triển khai xong khi:

- Decision runtime mới đã được human approve và docs Product/Decision không còn mâu thuẫn implementation.
- Worker chỉ claim job thuộc lane được cấu hình.
- Mỗi process không bao giờ vượt `WORKER_CONCURRENCY`, không giữ job khi chưa có execution slot.
- `sync_jobs` không có routing state duplicate ngoài `job_type`.
- Nhiều worker không claim trùng một job và không vượt shared Backlog budget.
- Running job được renew lease; stale worker không thể ghi terminal state.
- Readiness biết đúng lane consumer đang sống.
- Retry/promotion/reload overlay giữ hành vi hiện tại.
- `sync_translate_jira` vẫn là một job nguyên khối, không có child queue và không tạo Jira duplicate trong regression fake.
- Project pull và Scheduled pull vẫn disabled.
- Tất cả verify command liên quan pass thật; manual checklist chỉ tick khi người review xác nhận.
