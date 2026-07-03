# Boundary model

Boundary trong dự án có nhiều lớp. Import boundary chỉ là lớp dễ audit nhất, không phải toàn bộ modular monolith.

1. Import boundary.
2. Controller/HTTP ownership.
3. Public API ownership.
4. Data write ownership.
5. Data access tier.
6. Transaction boundary.
7. Error/retry boundary.
8. Evolution boundary.

## 1. Import boundary

Module khác chỉ được gọi qua public API:

```js
const CisApi = require("../../Cis/CisApi");
const TranslationApi = require("../../Translation/TranslationApi");
```

Không import sâu:

```js
require("../../Cis/application/getIssueEditor");
require("../../Cis/infrastructure/CisRepository");
require("../../Cis/support/resolveCanonicalField");
```

Import sâu vào `application/`, `infrastructure/`, hoặc `support/` của module khác là regression kiến trúc.

## 2. Controller/HTTP ownership

Controller chỉ gọi API/use case của module chủ quản route.

Nếu URL cũ đang nằm ở module A nhưng business action thuộc module B:

- Ưu tiên chuyển route/controller về module B.
- Nếu phải giữ URL cũ vì compatibility, module A chỉ giữ wrapper mỏng qua `ModuleBApi`.
- Wrapper phải có comment `TODO compatibility wrapper`, nêu module sở hữu thật.
- Không thêm business logic trong wrapper.

## 3. Public API ownership

`<Domain>Api.js` expose capability mà domain đó sở hữu. Không thêm method vào module A chỉ để gọi hộ module B.

Sai pattern:

```js
// CisApi.js
function requestIssueTranslations(input) {
  return TranslationApi.requestIssueTranslations(input);
}
```

Quyết định đúng:

- Caller cần Translation thì gọi `TranslationApi`.
- Caller cần CIS thì gọi `CisApi`.
- Nếu endpoint cũ cần giữ, dùng compatibility wrapper có TODO rõ.

## 4. Data write ownership

Cross-module write là lỗi nghiêm trọng hơn cross-module read.

Lý do:

- Write sai owner dễ phá invariant của domain.
- Audit/journal có thể ghi sai nơi hoặc thiếu context.
- Business rule update bị duplicate giữa nhiều module.
- Sau này extract module rất khó vì consumer đã quen mutate table owner.

Ví dụ:

```text
Jira cần lưu kết quả sync vào issue
  -> Jira gọi CisApi.saveIssueJiraSyncResult(...)
  -X-> JiraSyncRepository UPDATE issues

Translation cần hủy job liên quan queue
  -> Translation gọi SyncApi.cancelJobsForTranslationQueue(...)
  -X-> TranslationRepository DELETE FROM sync_jobs
```

Write ownership không hybrid: nếu module khác cần ghi, thêm capability vào owner API.

## 5. Data access tiers

MM-PH strict với write, pragmatic với một số read.

```text
Tier 0 - Cross-module WRITE
  Cấm. Module khác phải gọi public API của owner.

Tier 1 - Cross-module READ trong orchestration domain
  Ưu tiên owner read API.
  Direct SQL chỉ tạm thời nếu có allowlist, TODO và lý do.

Tier 2 - Reporting / operations read-only
  Dashboard/reporting được SELECT/COUNT chéo bảng theo allowlist.
  Không INSERT/UPDATE/DELETE bảng foreign.

Tier 3 - Sync snapshot read-only
  Jira dry-run/push được đọc bundle đa bảng theo allowlist.
  Mọi ghi state CIS vẫn qua CisApi.

Tier 4 - Presentation composition
  HTTP response có thể compose từ nhiều module API.
  Không nhét business rule module B vào module A.
```

## Sơ đồ mục tiêu

```text
HTTP / Controller
  -> DomainApi của module chủ quản route
    -> application use case
      -> domain/support nội bộ nếu cần
      -> infrastructure riêng module
      -> shared infrastructure kỹ thuật

Cross-module call:
  ModuleA application
    -> ModuleBApi
    -X-> ModuleB/application
    -X-> ModuleB/infrastructure
    -X-> ModuleB/support
```

## Transaction boundary

Mỗi job hoặc action ghi quan trọng phải có transaction boundary rõ.

Khung chuẩn:

```text
lock/load
run use case
write owner state
write journal/audit
commit
```

Với `sync_jobs`:

```text
pending -> running -> success
pending -> running -> pending   -- retryable failure
pending -> running -> failed    -- exhausted/non-retryable failure
pending -> cancelled
```

Trong outbound:

1. Pre-check.
2. Build payload/dry-run hash.
3. Gọi external API nếu thật sự được phép.
4. Cập nhật state owner.
5. Ghi journal.

Nếu pre-check fail, không gọi external API. Nếu external API success nhưng state update fail, job phải để lại lỗi/journal đủ để retry hoặc manual recover.

## Error/retry boundary

External adapter không tự quyết định state nghiệp vụ.

Adapter nên trả lỗi có cấu trúc:

```text
retryable
status_code
error_code
message
details
```

Use case/worker quyết định:

- retry ngay hay backoff;
- fail không retry;
- tạo anomaly hay không;
- chuyển job state thế nào;
- journal ghi gì.

Ví dụ:

```text
JiraClient returns 429 retryable
  -> Sync worker schedules retry on sync_jobs
  -> sync_journal records failed attempt

JiraClient returns 400 mapping invalid
  -> use case fails job
  -> Mapping/Anomaly owner handles missing/invalid mapping path
```

## Evolution boundary

Lite, Medium và Full kế thừa cùng boundary. Khi thêm capability mới:

- Webhook vẫn chỉ verify, lưu raw event, enqueue job, return nhanh.
- Jira inbound dùng cùng normalizer pattern với manual pull.
- Tách worker không đổi contract: `sync_jobs` vẫn là source of truth, `sync_journal` vẫn là audit.
- Đổi SQLite sang DB khác không đổi product model `System -> CIS -> System`.
- Thêm system mới vẫn map `System <-> CIS`, không map trực tiếp system cũ với system mới.

## Ranh giới Translation/AI

Translation là business domain. AI transport là technical infrastructure.

Trong `Translation`:

- Prompt, parse output, validation draft, review state, audit thuộc module Translation.
- Dùng adapter trung tính như `TranslationAdapter`, `ProcessTranslationAdapter`.
- Không tự gọi `fetch`, `child_process`, `spawn`, `spawnSync`.
- Không đặt class nội bộ kiểu `DeepSeekTranslationProvider` hoặc `CodexExecTranslationProvider`.

Trong `src/infrastructure/ai`:

- Chứa client/transport thật sự gọi external AI/process.
- Biết URL, auth header, timeout, request/response protocol.
- Không chứa prompt nghiệp vụ hoặc state review Translation.
