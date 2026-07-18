# Kế hoạch External Provider Gateways cho Backlog và Jira

> Trạng thái: Đã triển khai theo Draft v2; chờ manual review Admin UI. Các mô tả path trước refactor chỉ là historical; cấu trúc active là `src/infrastructure/external/{core,providers,transports}`.

## 1. Mục tiêu

Tạo một cửa ra ngoài bắt buộc cho mọi HTTP request thật từ CIS tới Backlog và Jira, nhằm bảo đảm:

- Mỗi Project có thể bật/tắt quyền đọc Backlog, đọc Jira và ghi Jira độc lập.
- Mỗi request chỉ được chạy khi khớp một operation đã đăng ký chính xác theo `provider + operation + HTTP method + endpoint pattern`.
- Operation, method hoặc endpoint chưa đăng ký bị từ chối mặc định.
- Code mới trong module không thể gọi `fetch`, `http` hoặc `https` để vượt gateway.
- Job đã enqueue phải kiểm tra lại policy mới nhất khi worker bắt đầu xử lý.
- Caller không được tự truyền hoặc sửa capability snapshot để cấp quyền cho chính nó.
- Luồng hiện có, fake mode và fixture test vẫn giữ nguyên contract nghiệp vụ.

Gateway là technical enforcement boundary. Các business gate hiện có như `project.enabled`, `manual_pull_enabled`, `sync_enabled`, mapping approval và Jira dry-run vẫn giữ nguyên và vẫn phải pass.

## 2. Phạm vi chốt

### Trong phạm vi

- HTTP egress từ CIS tới Backlog và Jira.
- Registry operation/method/endpoint cố định trong source code.
- Ba capability theo Project:
  - `backlog_external_read_enabled`
  - `jira_external_read_enabled`
  - `jira_external_write_enabled`
- Project API, validation, persistence và Admin UI cho ba capability trên.
- Kiểm tra capability tại action/readiness để trả lỗi sớm và kiểm tra bắt buộc tại gateway trước request thật.
- Kiểm tra lại policy khi worker bắt đầu job.
- Job bị gate chặn dùng terminal state hiện có với error code riêng, không mở rộng queue state machine.
- Persist structured gate evidence để API/FE phục hồi đúng nguyên nhân sau reload.
- Validate provider base URL như một trust anchor trước khi gắn credential.
- Architecture test chống bypass.
- Unit, integration, worker và Admin UI acceptance test chạy hoàn toàn local/fake.
- Cập nhật tài liệu hành vi và boundary liên quan.

### Ngoài phạm vi

- Webhook ingress từ Backlog/Jira vào CIS. Hiện repo chưa có webhook route hoạt động; ingress cần một gate riêng tại HTTP boundary khi được triển khai.
- AI/Translation transport và provider gateway đã thuộc cấu trúc external active, không nằm trong phạm vi thay đổi nghiệp vụ của plan này.
- Backlog write API; hiện không có business flow ghi Backlog.
- Thêm Jira/Backlog endpoint hoặc business action mới.
- Thay đổi mapping, translation, dry-run, rollback hoặc canonical workflow hiện tại.
- Bật lại Project pull hoặc Scheduled pull; hai luồng này tiếp tục disabled.
- Cấu hình danh sách endpoint trong database hoặc trên Admin UI.
- Persistent log cho mọi request thành công hoặc một màn External Request Audit mới.
- Rate limit, circuit breaker, forward proxy hoặc generic provider/plugin framework.
- Hủy cưỡng bức một job đã ở trạng thái `running` hoặc compensation cho remote change đã gửi.
- Gọi hệ thống thật trong verify/test.

## 3. Hiện trạng và nguyên nhân cần thay đổi

HTTP thật hiện nằm trong module:

- `src/modules/Backlog/infrastructure/BacklogClient.js` gọi `https.get` trực tiếp.
- `src/modules/Jira/infrastructure/JiraClient.js` gọi `fetch` qua method `request(method, pathname, ...)`.
- Nhiều application use case import trực tiếp `createBacklogClient` hoặc `createJiraClient`.

Vì vậy một use case mới có thể gọi client hoặc tự gọi network mà không đi qua policy tập trung. Chỉ thêm guard ở controller, enqueue function hoặc worker handler không giải quyết được bypass này.

## 4. Thiết kế đích

```text
Application use case
    -> BacklogClient / JiraClient (provider/domain adaptation hiện có)
        -> BacklogRequestGateway / JiraRequestGateway
            -> resolve operation trong registry
            -> kiểm tra project capability
            -> kiểm tra method + endpoint pattern + origin
            -> HTTP transport thật
```

### 4.1 Folder dự kiến

```text
src/infrastructure/external/
├── createExternalAccessScope.js
├── policy.js
├── backlog/
│   ├── operations.js
│   └── BacklogRequestGateway.js
└── jira/
    ├── operations.js
    └── JiraRequestGateway.js
```

Không tạo base class hoặc generic provider framework. `policy.js` chỉ chứa logic dùng chung thật sự: normalize method, capability assertion, deny error và same-origin/path assertion. `createExternalAccessScope.js` là composition boundary duy nhất được export để tạo provider client/gateway đã có authoritative policy.

### 4.2 Trách nhiệm giữ lại trong module

- `BacklogClient` tiếp tục chịu trách nhiệm chuyển provider response thành directory/value mà Backlog module cần.
- `JiraClient` tiếp tục chịu trách nhiệm Jira payload shaping, ADF, Story Point selection, user mapping và error semantics thuộc Jira integration.
- Fake/fixture client tiếp tục là test seam local.
- Application use case tiếp tục sở hữu business flow, enqueue, dry-run và transaction.

Hai client không còn được sở hữu network primitive, raw URL builder hoặc public `request(method, pathname)`.

Factory application-facing không còn nhận object Project hoặc scope tùy ý. Nó chỉ nhận `projectId`. Concrete gateway constructor, raw transport, scope internals và registry không được export ra application module.

### 4.3 Contract gọi gateway

Caller chỉ truyền operation và parameter nghiệp vụ:

```js
gateway.execute("jira.issue.create", {
  body,
});
```

Caller không được truyền method hoặc arbitrary pathname:

```js
// Không tồn tại trong public API của gateway.
gateway.request("POST", pathname, body);
```

Registry quyết định toàn bộ:

```js
{
  name: "jira.issue.create",
  capability: "jira_external_write_enabled",
  method: "POST",
  path: () => "/rest/api/3/issue",
}
```

Path parameter luôn được encode. URL tạo ra phải cùng origin với provider URL của Project. Absolute URL do caller truyền vào bị từ chối.

### 4.4 Authority và policy snapshot

```text
HTTP request / worker
    -> createExternalAccessScope(config, projectId)
        -> resolve Project hiện tại qua ProjectsApi public boundary
        -> validate provider URL + lấy credential + capability
        -> tạo immutable execution scope
            -> Backlog/Jira guarded client
```

Luật authority:

- Application chỉ cung cấp `projectId`; không cung cấp capability boolean hoặc provider credential cho gateway.
- Composition boundary resolve Project qua `ProjectsApi`, không import sâu `ProjectRepository` và không cho `src/infrastructure/external` đọc SQLite trực tiếp.
- Chỉ composition boundary được tạo concrete gateway/raw transport. Provider clients nhận scope đã tạo, không nhận policy object tự dựng.
- Static import allowlist chỉ cho composition boundary và hai provider client adapter chạm vào internal external-gateway files.
- Scope chỉ expose guarded provider clients/capability assertion cần cho readiness; không expose mutable policy object, credential hoặc raw transport.
- Scope authenticity và Project ownership được giữ trong module-private `WeakMap`, không bằng property caller có thể tự gắn. Internal adapter bắt buộc assert scope đã được mint và `mintedProjectId(scope) === expectedProjectId` trước operation.
- Dùng forged object hoặc scope của Project khác trả non-retryable `EXTERNAL_SCOPE_INVALID`/`EXTERNAL_SCOPE_PROJECT_MISMATCH` trước transport.
- HTTP/direct action tạo scope cho request hiện tại. Worker tạo đúng một scope sau khi claim job và dùng lại scope đó cho toàn handler, kể cả workflow dùng cả Backlog lẫn Jira.
- Scope là snapshot tại thời điểm tạo. Việc đổi gate sau đó áp dụng cho request/job tiếp theo, không cắt workflow đang `running` giữa chừng.

### 4.5 Fake/fixture và recording transport

Capability/operation guard nằm trước nhánh transport:

```text
guarded operation
    -> assert scope + capability + registered operation
        -> fake/fixture handler, hoặc
        -> real/recording HTTP transport
```

Nhờ vậy fake mode phản ánh cùng allow/deny behavior với production. Recording transport được inject tại composition boundary chỉ trong test để ghi `operation + method + resolved path` mà không mở network. Application production không được truyền custom transport. Internal client adapter nhận thêm `expectedProjectId` để scope assertion chặn cross-project reuse.

## 5. Project capability và quan hệ với policy hiện có

| Capability mới | Default Project mới | Existing Project sau migration | Ý nghĩa |
|---|---:|---:|---|
| `backlog_external_read_enabled` | `true` | `true` | Cho phép GET tới Backlog qua operation registry |
| `jira_external_read_enabled` | `true` | `true` | Cho phép GET/read operation tới Jira |
| `jira_external_write_enabled` | `false` | `true` | Cho phép Jira write operation; Project cũ giữ hành vi hiện tại |

Việc Project cũ được backfill `true` chỉ nhằm không làm hỏng production behavior sau migration. Business gate hiện tại vẫn có hiệu lực:

| Flow | Điều kiện business hiện có | External capability bắt buộc |
|---|---|---|
| Browse Backlog candidates | Project enabled, config hợp lệ | Backlog read |
| Pull one / Sync to CIS | Project enabled, manual pull enabled | Backlog read |
| Sync + Translate | Điều kiện pull và translation hiện tại | Backlog read |
| Sync + Translate + Jira | Pull, mapping, translation, dry-run và sync policy hiện tại | Backlog read + Jira read + Jira write |
| Pull Backlog fields | Project/config hợp lệ | Backlog read |
| Pull Jira fields | Project/config hợp lệ | Jira read |
| Jira identity lookup | Project/config hợp lệ | Jira read |
| Jira create/update/comment/transition | `sync_enabled` và outbound guardrail hiện tại | Jira write; read vẫn bắt buộc nếu workflow có provider verification |

`sync_enabled` không bị thay thế: đây là business authorization. `jira_external_write_enabled` là network kill switch.

Policy snapshot phải được tạo theo authority flow tại mục 4.4. Không có public constructor nhận `{ project, policy }` từ caller.

### 5.1 Provider URL trust boundary

`backlog_space_url` và `jira_site_url` là trust anchor do admin cấu hình. Gateway bảo đảm credential chỉ được gửi tới origin đã validate của đúng Project; không cố suy luận một host allowlist chung vì Jira/Backlog deployment có thể khác nhau.

Validation chia thành hai stage rõ ràng:

1. Project API không phụ thuộc runtime fake config. Khi URL được cung cấp, API validate cấu trúc: parse được bằng `new URL`, absolute `https:` URL, có hostname, không username/password/query/fragment và path rỗng hoặc `/`. Blank URL vẫn được phép để lưu Project chưa cấu hình xong.
2. Khi tạo real provider scope, URL bắt buộc tồn tại và được validate lại trước khi gắn credential. Gateway dựng endpoint từ validated origin; caller/response không được thay origin.

Fake/fixture/recording scope không yêu cầu provider URL, nhưng vẫn phải qua scope authenticity, Project match, capability và operation guard. Như vậy `normalizeProjectInput` không cần biết fake mode.

Nếu sau này cần Jira Data Center dưới sub-path hoặc localhost real transport, phải có quyết định và operation/path test riêng; không mở ngoại lệ ngầm trong phase này.

## 6. Operation registry chốt theo code hiện tại

### 6.1 Backlog

Tất cả operation hiện tại là read. Mọi `POST`, `PUT`, `PATCH`, `DELETE` tới Backlog bị deny vì không có operation đăng ký.

| Operation | Method | Endpoint pattern | Capability |
|---|---|---|---|
| `backlog.issue.get` | GET | `/api/v2/issues/:issueKey` | Backlog read |
| `backlog.issue.comments.list` | GET | `/api/v2/issues/:issueKey/comments` | Backlog read |
| `backlog.issue.attachments.list` | GET | `/api/v2/issues/:issueKey/attachments` | Backlog read |
| `backlog.issue.attachment.download` | GET | `/api/v2/issues/:issueKey/attachments/:attachmentId` | Backlog read |
| `backlog.project.get` | GET | `/api/v2/projects/:projectIdOrKey` | Backlog read |
| `backlog.project.statuses.list` | GET | `/api/v2/projects/:projectIdOrKey/statuses` | Backlog read |
| `backlog.project.users.list` | GET | `/api/v2/projects/:projectIdOrKey/users` | Backlog read |
| `backlog.issues.list` | GET | `/api/v2/issues` | Backlog read |
| `backlog.project.issue-types.list` | GET | `/api/v2/projects/:projectKey/issueTypes` | Backlog read |
| `backlog.priorities.list` | GET | `/api/v2/priorities` | Backlog read |
| `backlog.project.categories.list` | GET | `/api/v2/projects/:projectKey/categories` | Backlog read |

### 6.2 Jira

| Operation | Method | Endpoint pattern | Capability |
|---|---|---|---|
| `jira.issue.get` | GET | `/rest/api/3/issue/:issueKey` | Jira read |
| `jira.issues.search` | GET | `/rest/api/3/search/jql` | Jira read |
| `jira.issue.create` | POST | `/rest/api/3/issue` | Jira write |
| `jira.issue.update` | PUT | `/rest/api/3/issue/:issueKey` | Jira write |
| `jira.issue.transitions.list` | GET | `/rest/api/3/issue/:issueKey/transitions` | Jira read |
| `jira.issue.transition` | POST | `/rest/api/3/issue/:issueKey/transitions` | Jira write |
| `jira.issue.comment.create` | POST | `/rest/api/3/issue/:issueKey/comment` | Jira write |
| `jira.users.search` | GET | `/rest/api/3/user/search` | Jira read |
| `jira.project.statuses.list` | GET | `/rest/api/3/project/:projectKey/statuses` | Jira read |
| `jira.priorities.list` | GET | `/rest/api/3/priority` | Jira read |
| `jira.project.components.list` | GET | `/rest/api/3/project/:projectKey/components` | Jira read |
| `jira.users.assignable.list` | GET | `/rest/api/3/user/assignable/search` | Jira read |
| `jira.users.assignable.multi-project.list` | GET | `/rest/api/3/user/assignable/multiProjectSearch` | Jira read |
| `jira.project.roles.list` | GET | `/rest/api/3/project/:projectKey/role` | Jira read |
| `jira.project.role-actors.list` | GET | `/rest/api/3/project/:projectKey/role/:roleId` | Jira read |

Jira role API hiện trả absolute role URL. Refactor sẽ chỉ lấy `roleId`, sau đó gateway tự dựng relative path dưới configured Jira origin. Không forward URL do Jira response hoặc caller cung cấp.

### 6.3 Luật match

- Method normalize uppercase trước khi so sánh.
- Match theo operation registry, không suy luận capability chỉ từ HTTP method.
- `POST` có thể là read nếu Jira thêm search POST trong tương lai, nhưng phải đăng ký rõ capability; hiện không thêm operation này.
- Query string và body không tham gia nhận diện endpoint, nhưng chỉ được gắn sau khi operation đã pass.
- Path parameter phải `encodeURIComponent` và không được tạo thêm path segment.
- Unknown operation: lỗi lập trình `EXTERNAL_OPERATION_NOT_REGISTERED`, không phát request.
- Method/path/origin không khớp registry: `EXTERNAL_ENDPOINT_BLOCKED`, không phát request.
- Capability tắt: `EXTERNAL_GATE_BLOCKED`, không phát request.
- Forged scope hoặc cross-project scope: `EXTERNAL_SCOPE_INVALID`/`EXTERNAL_SCOPE_PROJECT_MISMATCH`, không phát request.
- Optional provider request đang dùng fallback `.catch(...)` chỉ được nuốt lỗi provider optional; các lỗi scope/gate/registry/endpoint ở trên luôn phải được rethrow.

## 7. Queue và thời điểm kiểm tra gate

### 7.1 Enqueue/action time

Action kiểm tra capability để trả lỗi ngay cho FE, không tạo job chắc chắn không thể chạy:

- `Sync to CIS` và `Sync + Translate`: Backlog read.
- `Sync + Translate + Jira`: Backlog read, Jira read và Jira write.
- Jira publish trực tiếp: Jira read/write theo workflow thực tế.

Đây là UX pre-check, không phải enforcement cuối.

Pre-check phải gọi cùng policy assertion trên authoritative scope; không copy lại một bộ boolean rule riêng trong controller/FE. Gateway vẫn kiểm tra lại operation ngay trước transport.

### 7.2 Worker time

Worker reload Project policy sau khi claim job và trước bước provider đầu tiên. Nếu capability đã bị tắt sau lúc enqueue:

- Không gọi Backlog/Jira.
- Job chuyển terminal `failed` bằng state hiện có.
- Không retry tự động.
- `last_error` giữ message an toàn; latest `job_failed` journal row ghi structured evidence gồm `error_code`, provider, capability, operation, endpoint template, correlation/job ID và `retryable = false`.
- Sync Job read model expose `last_error_code` và sanitized `last_error_details` bằng latest journal evidence; không thêm column mới vào `sync_jobs`.
- Candidate row overlay xử lý `failed` như hiện tại, dừng polling và mở lại đúng row; sau reload vẫn dùng `last_error_code` + message để phân biệt policy denial với provider failure.
- Không ghi credential, resolved URL có secret/query, Authorization header hoặc request body.

Không thêm status `blocked`: việc rebuild CHECK constraint, repository, filter và toàn bộ UI state machine không cần thiết cho gate. Sự khác biệt giữa policy denial và provider failure nằm ở `EXTERNAL_GATE_BLOCKED`, `retryable = false`, `last_error_code`, `last_error` và journal evidence.

### 7.3 Thay đổi policy khi job đang chạy

Policy được snapshot khi worker bắt đầu handler. Việc tắt gate không cưỡng bức dừng một job đã `running`, tránh làm workflow nhiều bước dừng giữa remote write. Job tiếp theo hoặc job còn `pending` sẽ bị chặn.

Immediate cancellation/compensation của job đang chạy nằm ngoài phạm vi kế hoạch này.

## 8. Admin UI

Design direction giữ nguyên **Modern Operations Console** và primitive hiện tại; không thiết kế màn mới.

Trong Project form:

- `Backlog source`: thêm switch `Allow external reads`.
- `Jira target`: thêm switch `Allow external reads` và `Allow external writes`.
- Helper text giải thích external gate là network access; `Manual pull`/`Sync enabled` vẫn là business policy riêng.
- Không hiển thị hoặc cho sửa endpoint registry.
- Save dùng Project PATCH hiện tại, loading chỉ trên submit action hiện tại và giữ input khi lỗi.

Các màn action/readiness phải hiện lý do cụ thể, ví dụ:

- `Backlog external reads are disabled for this Project.`
- `Jira external writes are disabled for this Project.`

Không reload toàn trang hoặc thay đổi behavior của list ngoài việc disable action đúng theo readiness.

## 9. Chống bypass

Thêm architecture verification với các rule:

1. Ngoài allowlist, cấm cả global call và import/require network primitive:
   - `fetch` và `globalThis.fetch`.
   - `http`, `https`, `http2`, `node:http`, `node:https`, `node:http2`.
   - `net`, `tls`, `node:net`, `node:tls`.
   - `undici` hoặc HTTP dependency khác nếu được thêm vào package sau này.
   - Verifier phải bắt cả namespace, destructuring và alias import thông thường; không chỉ tìm chuỗi `.get()`/`.request()`.
2. Network allowlist chỉ gồm:
   - Provider real transport cụ thể trong `src/infrastructure/external/providers/backlog`, `src/infrastructure/external/providers/jira` và `src/infrastructure/external/transports/**`.
3. Application/module code không được import concrete gateway, raw transport hoặc operation registry. Chỉ composition boundary và provider client adapter được phép import internal external-gateway files.
4. Backlog/Jira module không export raw HTTP request function; concrete gateway constructor và custom transport injection cũng không export cho production caller.
5. Gateway không export method nhận arbitrary `method + pathname`.
6. Mỗi external operation phải tồn tại trong registry và có test xác nhận method, endpoint pattern, capability.
7. Registry addition làm snapshot/contract test thay đổi, buộc reviewer thấy endpoint mới trong diff.

Sau cutover, các network primitive trực tiếp phải được xóa khỏi hai module client; không giữ fallback cũ.

Static verification nhằm chặn bypass thông thường và accidental bypass trong review/CI. Nó không tuyên bố chống được code cố tình obfuscate hoặc runtime code injection; các trường hợp đó thuộc supply-chain/runtime security ngoài scope.

## 10. Xử lý lỗi và audit tối thiểu

| Case | API/job behavior | Retry |
|---|---|---:|
| Capability disabled tại action | HTTP `409`, code `EXTERNAL_GATE_BLOCKED`; không enqueue | Không |
| Capability disabled tại worker | Job `failed`, code `EXTERNAL_GATE_BLOCKED`, journal + `last_error` | Không |
| Unknown operation | Internal error `EXTERNAL_OPERATION_NOT_REGISTERED`; không request | Không |
| Method/path/origin mismatch | `EXTERNAL_ENDPOINT_BLOCKED`; không request | Không |
| Invalid/cross-project scope | `EXTERNAL_SCOPE_INVALID` hoặc `EXTERNAL_SCOPE_PROJECT_MISMATCH`; không request | Không |
| Provider 429/5xx/timeout | Giữ retry semantics hiện tại | Theo policy hiện tại |
| Provider 4xx/auth | Giữ error mapping hiện tại | Không, trừ rule đã có |

Không tạo bảng audit request mới và không thêm logging framework. Job dùng `sync_journal`; direct API denial dùng error envelope + correlation ID hiện có. Success log per request bị loại khỏi scope để tránh volume và rò dữ liệu. Nếu sau này cần persistent audit cho direct read denial, đó là một scope riêng.

## 11. Kế hoạch triển khai theo phase

### EG-00 — Baseline và contract freeze

- Chốt inventory operation ở mục 6 bằng characterization test.
- Ghi baseline cho request/response/error/retry của hai client.
- Xác nhận không có network primitive Backlog/Jira ở vị trí thứ ba.
- Chốt import allowlist và caller inventory cho hai client factory.
- Không thay đổi behavior.

Exit gate:

- Existing provider verification pass bằng fake/fixture.
- Operation inventory test fail nếu current method/path bị bỏ sót.

### EG-01 — Project capability

- Thêm migration cho ba capability.
- Backfill Project cũ theo mục 5.
- Cập nhật defaults, capability/provider URL validation, repository serialization và Projects API contract.
- Cập nhật Project Admin UI và local acceptance test.
- Chưa bật runtime enforcement trong phase này.

Exit gate:

- Create/update/list Project round-trip đúng cả `true` và `false`.
- Partial PATCH không làm thay đổi capability khác.
- URL có giá trị nhưng sai protocol, userinfo, query, fragment hoặc base path bị Project API từ chối; blank URL vẫn lưu được. Real scope bắt buộc URL hợp lệ, fake/fixture scope không cần network URL.
- Existing Project giữ behavior sau migration.
- Error contract giữ được `EXTERNAL_GATE_BLOCKED` mà không đổi danh sách job status.

### EG-02 — Authoritative scope và Backlog request gateway

- Tạo `createExternalAccessScope(config, projectId)` và resolve Project qua Projects public boundary; không nhận caller-supplied policy object.
- Tạo Backlog operation registry và `BacklogRequestGateway`.
- Chuyển auth query, URL build, JSON/buffer transport, timeout và network error mapping vào gateway.
- `BacklogClient` gọi named operation; application caller chuyển sang `projectId`, còn controlled scope chỉ truyền nội bộ; xóa `requestJson`, `requestBuffer`, `buildUrl` trực tiếp khỏi module.
- Đặt capability/operation guard trước nhánh real/fixture và hỗ trợ recording transport chỉ qua test composition.
- Giữ Fixture client response contract nghiệp vụ hiện tại.
- Chưa đổi business flow.

Exit gate:

- Tất cả Backlog operation trong mục 6.1 pass characterization test.
- Caller-supplied Project/policy/scope object không phải public factory input và không thể cấp quyền.
- Forged scope và scope Project A dùng với `expectedProjectId = B` bị chặn trước fake/real transport.
- Wrong method, unknown operation, absolute URL và encoded path escape đều bị chặn trước transport.
- Gate off chặn cả fixture và real/recording path theo cùng error contract.
- Attachment buffer và retry metadata giữ nguyên.

### EG-03 — Jira request gateway

- Tạo Jira operation registry và `JiraRequestGateway`.
- Chuyển Basic auth, site URL, timeout, `fetch`, response parse và provider error transport vào gateway.
- `JiraClient` gọi named operation từ controlled scope; xóa public/raw `request(method, pathname)` và caller-supplied Project/policy input.
- Thay role absolute URL bằng controlled `projectKey + roleId` operation.
- Sửa các optional metadata fallback để luôn rethrow lỗi scope/gate/endpoint/registry; chỉ provider error được phép fallback theo behavior hiện tại.
- Đặt capability/operation guard trước nhánh real/fake; giữ Fake Jira response contract, ADF, Story Point, mapping và outbound payload hiện tại.

Exit gate:

- Tất cả Jira operation trong mục 6.2 pass characterization test.
- GET/POST/PUT chỉ chạy với đúng endpoint đã đăng ký.
- PATCH/DELETE và operation không đăng ký bị deny.
- Gate off chặn cả Fake Jira và real/recording path theo cùng error contract.
- Jira dry-run, create, update, transition, comment và mapping pull fake tests không đổi kết quả.

### EG-04 — Enforcement tại action và worker

- Bật capability assertion trong hai gateway.
- Bổ sung readiness/action pre-check cho phản hồi FE ngay.
- Worker reload policy trước provider step.
- Worker tạo một authoritative scope và dùng lại cho toàn handler.
- Dùng non-retryable `failed` transition hiện có; mở rộng sanitized `job_failed.details_json` và Sync Job read model để phục hồi error code sau reload.
- Giữ nguyên queue creation, status set, polling và row overlay; chỉ bổ sung gate error evidence.

Exit gate:

- Gate tắt trước click: không tạo job.
- Gate tắt sau enqueue nhưng trước worker: job `failed` với `EXTERNAL_GATE_BLOCKED`, provider recorder có `0` request.
- Reload job/candidate vẫn đọc được `last_error_code = EXTERNAL_GATE_BLOCKED` từ latest journal evidence.
- Gate bật: flow hiện có chạy như trước.
- Không ảnh hưởng job chỉ dịch và không gọi Backlog/Jira.

### EG-05 — Static enforcement, docs và regression

- Thêm architecture scan chống network bypass.
- Cập nhật `docs/app/03-interface`, `05-architecture`, `06-technical`, `07-implementation` và `08-quality` tại đúng section liên quan.
- Nếu materialize boundary instance mới, chạy Type Contract Gate theo rule docs của repo.
- Chạy full regression local.

Exit gate:

- Không còn direct Backlog/Jira network primitive trong `src/modules/**`.
- Architecture test chứng minh code mới tự gọi `fetch` hoặc `https.get` trong module sẽ fail CI.
- Documentation contract và full test pass.

## 12. Test matrix bắt buộc

### Unit/contract

- Registry normalize method uppercase.
- Đúng operation + đúng method + đúng path được allow.
- Đúng path nhưng sai method bị deny.
- Đúng method nhưng sai/unknown path bị deny.
- Unknown operation bị deny.
- Absolute/cross-origin URL bị deny.
- Path parameter chứa `/`, `..`, unicode hoặc query marker được encode an toàn.
- Capability read/write được lấy từ registry, không suy luận từ method.
- Application-facing factory chỉ nhận `projectId`; controlled scope chỉ lưu hành qua internal adapter và caller-supplied capability/scope object không được chấp nhận.
- Scope giả và cross-project scope mismatch bị deny; valid same-project scope dùng lại được trong toàn handler.
- Scope resolve Project đúng một lần và dùng cùng snapshot trong toàn job handler.
- Real base URL bắt buộc HTTPS origin-only, không userinfo/query/fragment/path.
- Error không chứa API key, token, Authorization header hoặc request body.
- Optional metadata `.catch(...)` không được nuốt gate/registry/endpoint error.

### Project persistence/API

- Default Project mới đúng mục 5.
- Migration giữ capability Project cũ.
- PATCH từng switch không reset credential, mapping snapshot hoặc switch khác.
- Boolean `false` được lưu/đọc đúng, không bị fallback thành `true`.
- Invalid provider trust-anchor URL bị reject với field evidence; valid current Backlog/Jira URL vẫn round-trip.

### Backlog

- Candidate browse, Pull one, manual pull worker, resync, field pull và attachment download với gate on.
- Mỗi flow trên bị chặn với gate off và transport recorder có `0` call.
- Fixture mode cũng trả đúng gate denial thay vì bỏ qua policy.
- Project pull/scheduled pull vẫn disabled.

### Jira

- Identity get/search và mapping pull cần Jira read.
- Create/update/transition/comment cần Jira write.
- `Sync + Translate + Jira` cần Backlog read + Jira read + Jira write.
- Tắt từng capability độc lập tạo đúng error reason.
- Fake Jira mode cũng trả đúng gate denial; recording real transport xác nhận đúng operation/method/path mà không mở network.
- Story Point WEC1, Assignee, Priority và payload hiện tại không đổi.

### Queue/reload

- Gate on khi enqueue, off trước worker: terminal `failed`, code `EXTERNAL_GATE_BLOCKED`, no retry.
- Latest `job_failed` journal lưu sanitized structured evidence; Sync Job read model expose `last_error_code`/details.
- Candidate overlay sau reload hiển thị đúng gate error và mở lại đúng row.
- Job khác/row khác không bị loading hoặc disabled theo job vừa block.
- Retry endpoint không tự chạy lại job khi gate vẫn off.

### Static/architecture

- Fixture cố ý thêm `fetch`, aliased `node:https`, destructured `https.get` hoặc `undici` import trong module làm verifier fail.
- Fixture cố ý import concrete gateway/raw transport từ application module làm verifier fail.
- Fixture cố ý thêm operation nhưng không registry/test làm verifier fail.
- AI transport allowlist hiện tại không bị false positive.

### Lệnh regression dự kiến

```powershell
npm run verify:projects
npm run verify:backlog-ingestion
npm run verify:jira-outbound
npm run verify:sync-translate-jira
npm run verify:project-scope
npm run verify:admin-ui-acceptance
npm run verify:admin-ui-e2e
npm run verify:architecture-baseline
npm run verify:docs
npm test
```

Toàn bộ test dùng fake/fixture/recording transport local. Không GET/POST/PUT tới Backlog, Jira hoặc server bên ngoài.

## 13. Rủi ro và cách giảm thiểu

| Rủi ro | Xử lý |
|---|---|
| Registry bỏ sót một request hiện tại | EG-00 characterization freeze trước refactor |
| Project migration vô tình khóa flow đang chạy | Backfill Project cũ `true`; enforcement chỉ bật ở EG-04 |
| Caller tự dựng policy cho phép | Public composition nhận `projectId`, resolve qua ProjectsApi; concrete constructor/import bị khóa |
| Gateway lại bị bypass bằng direct network call | Import-aware architecture verifier + xóa fallback/raw request export |
| Jira role URL mở đường gọi arbitrary host | Chỉ lấy role ID và dựng path dưới configured origin |
| Provider base URL làm lộ credential | Validate HTTPS origin-only; coi admin Project config là trust boundary rõ ràng |
| Gate bị nhầm với business toggle | Tên field rõ, helper text và test yêu cầu cả hai lớp |
| Gate đổi khi workflow nhiều bước đang chạy | Snapshot policy ở handler start; không hard-cancel giữa workflow |
| Fake mode không phản ánh policy | Guard chạy trước fake/real branch; recording transport chỉ inject từ test composition |
| Reload mất gate error code | Persist sanitized journal evidence và expose qua Sync Job read model |
| Lộ secret trong journal/error | Chỉ persist operation/template/correlation; không persist URL có Backlog `apiKey`, header hoặc body |

## 14. Ước lượng

| Phase | Ước lượng |
|---|---:|
| EG-00 | 0.5 ngày |
| EG-01 | 0.75 ngày |
| EG-02 | 1.0 ngày |
| EG-03 | 1.0 ngày |
| EG-04 | 1.0 ngày |
| EG-05 | 0.5 ngày |
| Tổng | khoảng 4.75 ngày kỹ thuật, chưa tính thời gian manual review |

Nếu dùng làm delivery commitment, giữ thêm `1–1.5 ngày` contingency cho migration/API/UI E2E ở EG-01 và journal read-model/queue overlay ở EG-04; planning range an toàn là khoảng `5.75–6.25 ngày`.

## 15. Điểm cần người review chốt

1. Đồng ý ba capability trong scope và chưa thêm `backlog_external_write_enabled` khi chưa có Backlog write flow.
2. Đồng ý giữ job status `failed`, persist gate code/details trong latest journal và expose qua Sync Job read model; không thêm status `blocked` hoặc column error mới.
3. Đồng ý Project cũ được backfill gate `true`, còn Project mới mặc định Jira write `false`.
4. Đồng ý application-facing factory chỉ nhận `projectId`; internal scope phải được factory mint, khớp `expectedProjectId`, worker snapshot một lần khi bắt đầu và không cưỡng bức dừng job đã `running`.
5. Đồng ý Project provider URL là admin-controlled trust anchor: blank được phép khi lưu, URL có giá trị phải HTTPS origin-only, real scope bắt buộc URL còn fake scope không bắt buộc; webhook ingress, request-audit screen/table, logging framework và AI gateway nằm ngoài scope này.
