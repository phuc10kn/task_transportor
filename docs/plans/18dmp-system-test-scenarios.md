# 18DMP — Kịch bản test toàn hệ thống

## 1. Mục tiêu

Tài liệu này là bộ acceptance test end-to-end cho Central Sync Hub Lite trên Project thật được cấp phép:

- CIS `project_id = 1`;
- tên Project trong DB: `DMP`;
- Backlog project key: `18DMP`;
- Jira project key: `DMP`.

Trọng tâm là các luồng business quan trọng:

```text
Backlog -> CIS -> Translation review -> Mapping/Anomaly gate -> Jira dry-run -> Jira
```

Bộ test cũng bao phủ Project scope, Issue Editor, recovery, audit, Dashboard, error state, accessibility và release smoke.

## 2. Phạm vi quyền thao tác

User đã cho phép agent dùng credential hiện có trong DB để tạo/chỉnh dữ liệu phục vụ test, với ranh giới bắt buộc:

### Được phép

- Gọi CIS API với `project_id=1`.
- Đọc và tạo/chỉnh test data trong Backlog project `18DMP`.
- Khi dữ liệu hiện có không đủ cho một test case, agent được phép chủ động tạo Backlog issue mới qua API trong project `18DMP`; không cần dùng issue nghiệp vụ có sẵn để lấp dữ liệu test.
- Đọc và tạo/chỉnh test data trong Jira project `DMP`.
- Tạo CIS issue, mapping rule, anomaly, sync job, glossary concept và translation draft thuộc Project 1 qua public API.
- Chạy Backlog pull, Jira dry-run và Jira sync thật cho test record có prefix quy định ở dưới.

### Không được phép

- Không ghi Backlog/Jira của Project khác.
- Không dùng credential Project 1 để query hoặc mutate project key khác `18DMP`/`DMP`.
- Không in API key, Jira token, password, Authorization header hoặc full credential object ra terminal, file hay evidence.
- Không sửa workflow, permission, user, project metadata, issue type, status scheme hoặc credential của Backlog/Jira.
- Không xóa hoặc sửa issue nghiệp vụ có sẵn không mang test prefix.
- Không ghi DB trực tiếp để tạo fixture. Test data phải đi qua public CIS API hoặc provider API được cấp phép.
- Không chạy project pull thật nếu preflight cho thấy phạm vi pull không được giới hạn và có thể enqueue hàng loạt issue ngoài bộ test.
- Không gọi AI provider trả phí cho case `retranslate` nếu chưa có xác nhận riêng; Backlog/Jira authorization không tự mở rộng sang AI provider.

Mỗi external write phải kiểm tra response vẫn thuộc Backlog `18DMP` hoặc Jira `DMP`. Nếu response không chứng minh đúng project, dừng ngay test run.

## 3. Baseline đã xác minh

Snapshot đọc ngày 2026-07-16, không lộ secret:

| Thuộc tính | Giá trị |
| --- | --- |
| CIS Project | `1 / DMP` |
| Project enabled | `true` |
| Sync enabled | `true` |
| Manual pull enabled | `true` |
| Backlog credential | configured |
| Jira credential | configured |
| Backlog browse | enabled |
| Pull one | enabled, inline |
| Pull project | disabled |
| Sync candidate to CIS | enabled, queued-ready |
| CIS issues | 2 |
| Translation pending/AI draft | 1 |
| Mapping rules | 28 |
| Open anomalies | 0 |
| Pending jobs | 0 |
| Failed jobs | 0 |
| Journal entries | 88 |

Baseline chỉ dùng để lập kế hoạch. Trước mỗi run phải đọc lại vì dữ liệu thật có thể thay đổi.

## 4. Mức ưu tiên và tiêu chuẩn pass

| Priority | Ý nghĩa | Release rule |
| --- | --- | --- |
| P0 | Golden path, data safety, publish gate, Project isolation | Bắt buộc pass toàn bộ |
| P1 | Recovery, negative flow, state preservation, operational visibility | Không có lỗi nghiêm trọng; case thiếu điều kiện phải có automated evidence thay thế |
| P2 | Responsive, accessibility, polish và compatibility guard | Không có regression chặn operator |

Một case chỉ được đánh dấu `PASS` khi có đủ:

1. expected HTTP/UI state;
2. resource tạo ra thuộc `project_id=1`;
3. không có side effect ngoài test record;
4. job/journal/anomaly evidence đúng khi flow yêu cầu;
5. screenshot, request log, response ID hoặc DB-safe count được ghi vào test report.

## 5. Quy ước dữ liệu test

Mỗi lần chạy tạo một `RUN_ID`:

```text
CIS-E2E-YYYYMMDD-HHmm
```

Mọi summary/title/comment/note phải bắt đầu bằng `[RUN_ID]`. Không tái sử dụng issue nghiệp vụ thật.

### Data pack tối thiểu

| Data ID | Hệ thống | Mục đích | Cách provision khi thiếu |
| --- | --- | --- | --- |
| `BL-A` | Backlog `18DMP` | Golden path, field đầy đủ | Provider API tạo issue Nhật ngữ với issue type/status/priority hợp lệ |
| `BL-B` | Backlog `18DMP` | Translation/Markdown/stale draft | Provider API tạo issue có heading, list, code và ký tự Nhật |
| `BL-C` | Backlog `18DMP` | Revision/comment/attachment | Provider API tạo issue, thêm comment; attachment chỉ thêm nếu API/account hỗ trợ an toàn |
| `BL-D` | Backlog `18DMP` | Mapping gap | Tạo issue dùng một giá trị hợp lệ chưa có approved mapping; không tạo metadata project mới |
| `JR-A` | Jira `DMP` | Link existing identity | Provider API tạo issue `[RUN_ID] Jira identity fixture` |
| `JR-TRACE` | Jira `DMP`/fake adapter | Reconcile trace và concurrent create | Ưu tiên automated fake adapter; chỉ tạo live fixture khi preflight chứng minh không gây duplicate ngoài test record |
| `CIS-A` | CIS Project 1 | Manual create/edit | `POST /api/v1/projects/1/issues` |
| `AN-A/B` | CIS Project 1 | Resolve/ignore và Dashboard alert | `POST /api/v1/projects/1/anomalies` gắn test issue |
| `JOB-CANCEL` | CIS Project 1 | Cancel pending | Tạo `noop_test` có `run_after` tương lai rồi cancel |
| `JOB-FAIL` | CIS Project 1 | Retry failed | Tạo `manual_pull` với key không tồn tại mang `RUN_ID`, chờ worker fail rồi retry |
| `GL-A` | CIS Project 1 | Glossary CRUD | Tạo concept key chuẩn hóa từ `RUN_ID`, cleanup bằng public DELETE API |
| `RUN-MANIFEST` | Local test report | Inventory và cleanup reconciliation | Tạo trước external/CIS write đầu tiên; cập nhật tăng dần mọi resource ID/key của run |

### Nguyên tắc provision external data

- Agent đọc metadata provider trước để lấy đúng numeric ID của project/issue type/priority/status.
- Backlog create chỉ được gửi tới project ID resolve từ key `18DMP`.
- Jira create payload phải dùng `fields.project.key = "DMP"`.
- Sau create, lưu lại provider ID/key vào test report rồi GET read-back để xác minh project.
- Không delete test issue nếu provider/audit policy không cho phép. Cleanup bằng comment `[RUN_ID] test complete` và transition sang trạng thái kết thúc phù hợp nếu an toàn.
- Nếu không tạo được attachment bằng provider API, đánh dấu attachment live case `N/A-CONDITIONAL` và dùng automated fixture evidence; không chèn row giả trực tiếp vào SQLite.

### Quyết định tạo Backlog issue khi thiếu dữ liệu

Đây là fallback mặc định cho test run, không phải trường hợp cần xin lại quyền:

1. Preflight đọc candidate/test issue hiện có trong Backlog `18DMP` và CIS Project 1.
2. Chỉ tái sử dụng issue có cùng `RUN_ID` của test run hiện tại. Không mượn hoặc chỉnh issue nghiệp vụ thật.
3. Nếu thiếu một field combination hoặc state cần thiết cho case P0/P1, agent tạo issue mới qua Backlog API bằng credential Project 1 trong DB.
4. Trước write, resolve Backlog project key `18DMP` thành provider project ID và lấy issue type/priority/assignee/category ID hợp lệ.
5. Payload tối thiểu phải có summary bắt đầu bằng `[RUN_ID]`, project ID của `18DMP`, issue type và priority hợp lệ; description ghi rõ mục đích test/case ID.
6. Sau create, GET read-back issue vừa tạo và chỉ tiếp tục nếu response chứng minh issue thuộc đúng `18DMP`.
7. Ghi Backlog key mới vào result matrix để các bước Pull/Browse/Sync/Revision và cleanup dùng cùng một identity.
8. Nếu create response thuộc project khác, thiếu project evidence hoặc provider trả payload bất thường: dừng run, không retry write sang project khác.

Data pack `BL-A` đến `BL-D` vì vậy là dữ liệu do agent được phép tạo mới khi inventory hiện tại không đáp ứng test; không được hạ coverage chỉ vì thiếu issue phù hợp.

## 6. Thứ tự chạy P0 đề xuất

1. `RUN-001`: tạo run manifest trước write đầu tiên.
2. `PRE-*`, `AUTH-*`, `PRJ-*`: backup, health, login, credential hygiene và Project preflight.
3. Provision `BL-A`, `BL-B`, `BL-C`, `BL-D`, `JR-A` nếu thiếu.
4. `MAP-001`: pull catalog từ Backlog/Jira và sync CIS catalog.
5. `BLG-001..010`: browse, readiness và ingest Backlog vào CIS.
6. `TRN-001..004`: review draft, Save Draft, Approve.
7. `CIS-001..009`: review/edit canonical, identity, history và lifecycle actions.
8. `MAP-002..004`, `ANO-001`: đóng mapping/anomaly gate.
9. `JIR-001..009`, `COM-001..003`: dry-run, reconcile trace, publish issue/comment và chống duplicate.
10. `OPS-*`, `DSH-*`, `MPA-*`: recovery, journal, Dashboard và runtime consistency.
11. `SEC-*`, `UX-*`: negative scope, lỗi UI và keyboard.
12. Cleanup, reconcile `RUN-MANIFEST` và ghi result matrix.

## 7. Kịch bản Preflight, Auth và Project

### PRE-001 — Backup và runtime readiness — P0

**Bước thực hiện**

1. Dừng writer nếu đây là release smoke; với test dev, xác nhận không chạy migration/song song destructive task.
2. Backup SQLite theo operation runbook và ghi SHA-256.
3. Kiểm tra API health và Admin Web health/proxy.
4. Kiểm tra worker enabled và Project 1 vẫn `enabled=true`, `sync_enabled=true`, `manual_pull_enabled=true`.

**Kỳ vọng**

- Backup tồn tại, checksum đọc được.
- `/api/v1/health` trả `200` và envelope hợp lệ.
- Không có migration pending hoặc stale CodeGraph bắt buộc cho release.
- Không log secret.

### AUTH-001 — Login đúng và session hiện tại — P0

1. Login bằng admin hợp lệ.
2. Kiểm tra token chỉ lưu ở client storage theo contract.
3. Gọi `GET /api/v1/auth/me` qua MPA proxy.

**Kỳ vọng:** login thành công, email đúng, không lộ password/token trong UI URL hoặc log evidence.

### AUTH-002 — Login sai, protected route và logout — P1

1. Login sai password.
2. Mở protected deep link khi chưa có token.
3. Login đúng rồi logout; thử dùng lại token/session cũ.

**Kỳ vọng:** lỗi rõ, deep link chuyển về login có `next`, logout xóa session, request sau logout trả `401`.

### PRJ-001 — Chọn Project và workspace gate — P0

1. Xóa active Project khỏi `sessionStorage`.
2. Mở Dashboard và một route nghiệp vụ.
3. Chọn Project `DMP` tại Projects, mở workspace.

**Kỳ vọng:** không có workspace fetch trước khi chọn; sau chọn, header hiển thị `DMP · #1`; không tự chọn Project đầu tiên.

### PRJ-002 — Disabled Project gate — P1, chạy cuối

Chỉ chạy khi không còn active job và có thể đảm bảo re-enable trong `finally`.

1. Disable Project 1 qua Project Config/API.
2. Mở Dashboard và một mutation route.
3. Gọi trực tiếp một workspace endpoint.
4. Re-enable Project 1 ngay cả khi assertion fail.

**Kỳ vọng:** FE hiển thị `Project is disabled`, không gọi Dashboard data; API trả `409 PROJECT_DISABLED`; Project được bật lại sau test.

### PRJ-003 — Credential redaction và blank-secret update — P0

1. Gọi Project list/detail qua API và mở Project Config.
2. Kiểm tra response/evidence theo tên field, không in hoặc snapshot giá trị secret.
3. Save một non-secret field trong khi credential input để trống.
4. Xác minh provider readiness vẫn hoạt động; restore non-secret field trong `finally`.

**Kỳ vọng:** API không trả raw `backlog_api_key`, `jira_api_token` hoặc password; FE không pre-fill secret và chỉ hiển thị trạng thái configured/masked; để trống giữ secret cũ; log, DOM và test artifact không chứa secret. Nếu raw credential xuất hiện, đánh dấu `FAIL-P0` và dừng external write của run.

### PRJ-004 — Save/read-back cấu hình an toàn — P1

1. Lưu snapshot các non-secret field ban đầu.
2. Sửa lần lượt name hiển thị, source/target language, translation AI model/policy hoặc URL/key bằng giá trị test hợp lệ không đổi credential.
3. GET read-back và reload Project Config.
4. Thử URL/key/model không hợp lệ rồi restore snapshot trong `finally`.

**Kỳ vọng:** API/UI dùng contract `translation_ai_*`; validation lỗi giữ input; read-back nhất quán; không phát sinh job/provider write; cấu hình ban đầu được phục hồi.

### PRJ-005 — Sync/manual-pull enable-disable và action readiness — P1, maintenance window

1. Ghi snapshot `sync_enabled` và `manual_pull_enabled`.
2. Tắt từng flag qua public API, mở Backlog/Jira action tương ứng và thử direct mutation an toàn.
3. Bật lại flag và xác minh readiness/action hoạt động trở lại.
4. Luôn restore snapshot trong `finally`.

**Kỳ vọng:** UI disable action kèm lý do; API từ chối mutation không sẵn sàng mà không enqueue job; flag không ảnh hưởng Project khác; trạng thái gốc được phục hồi.

### PRJ-006 — Project create/delete lifecycle — P1, automated isolated fixture

Chạy trên temporary SQLite/isolated app instance, không chạy trên DB dùng chung và không gọi provider thật.

**Kỳ vọng:** create/list/show/update/delete đúng envelope và validation; delete bị chặn hoặc cascade đúng contract khi có resource phụ thuộc; Project 1 và external system không bị mutate.

## 8. Backlog → CIS

### BLG-001 — Pull Backlog field catalog — P0

1. Mở Mappings.
2. Click `Pull Backlog fields`.
3. Trong lúc request chạy, kiểm tra chỉ nút đó loading; các mapping row/select khác vẫn thao tác được.
4. Đọc read-back Project config/mapping settings.

**Kỳ vọng**

- API `POST /api/v1/projects/1/backlog/mapping-values/pull` trả `200`.
- Snapshot có issue type, status, priority, user và component/category nếu provider hỗ trợ.
- Directory giữ provider ID; CIS values không bị thay bằng ID.
- Không reload page/table; draft mapping khác còn nguyên.

### BLG-002 — Backlog Issues chỉ query sau Find — P0

1. Mở Backlog Issues với Project 1.
2. Quan sát network trước khi submit.
3. Chọn date range bao phủ test issues, limit nhỏ, click `Find issues`.

**Kỳ vọng:** mở màn chỉ đọc readiness/filter snapshot; provider candidate API chỉ chạy sau Find; kết quả chỉ gồm Backlog `18DMP` chưa tồn tại trong CIS Project 1.

### BLG-003 — Filter Status, Not closed và Assignee — P1

Chạy lần lượt: Status; Not closed; Assignee; Status + Not closed; Status + Assignee.

**Kỳ vọng:** query dùng provider IDs đã pull; giao filter đúng; clear optional filters giữ date range/limit; input invalid trả `422` và giữ form.

### BLG-004 — Empty state phân biệt nguyên nhân — P1

1. Dùng filter chắc chắn không match.
2. Dùng range chỉ chứa issue đã sync vào CIS.

**Kỳ vọng:** UI phân biệt `không match filter` với `đã có trong CIS`; không ghi DB khi browse; có đường bỏ optional filter.

### BLG-005 — Sync candidate vào CIS — P0

1. Chọn `BL-A` chưa có trong CIS.
2. Click `Sync to CIS`.
3. Ngay sau `202`, reload màn khi job còn `pending/running`.
4. Theo dõi row và `GET /api/v1/projects/1/sync-jobs/:jobId` tới terminal.
5. Mở CIS issue tạo ra và journal.

**Kỳ vọng**

- HTTP `202` chỉ được hiển thị là queued, không tuyên bố hoàn tất sớm.
- Trước `202` không gọi provider để verify issue/project; worker mới thực hiện verification và ghi failure lên job nếu key không tồn tại hoặc sai project.
- Sau reload candidate response overlay đúng active job; hai action của riêng row bị khóa, polling tiếp tục và không có POST sync thứ hai.
- Job, issue, revision, comment/attachment metadata và journal đều `project_id=1`.
- Source snapshot giữ dữ liệu Backlog; không tạo Jira issue.
- Row khác không bị khóa hoặc rerender.

### BLG-006 — Sync candidate + Translate — P0

1. Chọn `BL-B`.
2. Click `Sync to CIS + Translate`.
3. Theo dõi parent manual-pull job; sau success kiểm tra child translation queue/job.

**Kỳ vọng:** parent không gọi AI trong HTTP; queue chỉ tạo cho summary/description current source; không tạo queue trùng theo `translation_queue_id`; UI dẫn operator sang Translation Queue.

### BLG-006A — Sync + Translate + Jira atomic workflow — P0

1. Chọn một candidate test có đủ approved mapping và bấm `Sync + Translate + Jira`.
2. Xác minh HTTP trả `202` trước mọi provider/AI/Jira call; reload khi parent đang active.
3. Chờ parent terminal và kiểm tra child translate, batch journal, dry-run, push issue cùng Jira read-back.
4. Trên isolated fixture, ép phần tử translation thứ hai fail khi batch approval đang update.

**Kỳ vọng:** request body có `with_translation=true` và `push_to_jira=true`; parent giữ active xuyên suốt và row khác không bị khóa. Success path auto-approve/apply cả summary/description, dry-run pass rồi Jira create/update đúng Project. Failure path rollback cả canonical và review status của batch, giữ staging/error evidence và không có Jira request. Retry/re-click không tạo Jira issue trùng.

### BLG-007 — Pull one issue inline và idempotency — P0

1. Gọi pull one với key `BL-C`.
2. Gọi lại khi source chưa đổi.
3. Chỉnh summary/comment của `BL-C` qua Backlog API rồi pull lại.

**Kỳ vọng:** lần đầu tạo issue/revision; lần hai không tạo duplicate revision; sau source update tạo revision mới, giữ cùng CIS issue và Backlog identity.

### BLG-008 — Comment và attachment ingest — P1

1. Tạo comment `[RUN_ID]` trên `BL-C`.
2. Nếu provider API hỗ trợ attachment an toàn, thêm file text nhỏ không chứa secret.
3. Pull `BL-C`, mở source snapshots và attachments.

**Kỳ vọng:** comment/attachment thuộc đúng issue; filename, size, hash/status hợp lệ; attachment lỗi không làm fail toàn issue ingest.

### BLG-009 — Project/scheduled pull bị disable — P0

1. Kiểm tra readiness và disabled control trên Backlog Issues.
2. Gọi manual project-pull API trực tiếp.
3. Chạy scheduled scan bằng automated fixture.

**Kỳ vọng:** UI không phát request; API trả `409 BACKLOG_PROJECT_PULL_DISABLED`; scheduled scan trả disabled với `scanned_projects=0`, không query Backlog, không enqueue job và không cập nhật `pull_state`.

### BLG-010 — Pull readiness và routing mismatch — P0

1. Dùng controlled config fixture/intercept để kiểm tra lần lượt `manual_pull_enabled=false`, `sync_enabled=false`, worker unavailable và Backlog project key mismatch.
2. Với live Project 1 chỉ toggle trong maintenance window, không gửi request sang project key khác; luôn restore trong `finally`.
3. Nếu live project-pull bị `SKIP-SAFETY`, chạy automated route/service test tương đương bắt buộc.

**Kỳ vọng:** readiness blocker bị từ chối trước enqueue; routing mismatch của candidate đã enqueue chỉ được provider verify trong worker rồi job fail mà không ghi CIS. Không gọi provider sai scope, không tự fallback sang project khác và flag live được phục hồi.

## 9. CIS Issues và Issue Editor

### CIS-001 — List/detail chỉ có Project 1 — P0

1. Mở CIS Issues.
2. Mở các issue vừa ingest bằng deep link.

**Kỳ vọng:** list/detail/editor dùng Project URL, source identity đúng, không có `All projects`, deep link giữ active Project.

### CIS-002 — Manual create — P0

1. Tạo `CIS-A` bằng form/API với summary `[RUN_ID] Manual CIS issue`.
2. Mở Issue Editor.

**Kỳ vọng:** `project_id=1`, canonical CIS branch được tạo, revision/journal hợp lệ, không có external identity giả.

### CIS-003 — Save canonical giữ toàn bộ form — P0

1. Sửa Summary, Description, Issue type, Priority và Due date.
2. Trước Save, để một control khác ở trạng thái draft/focus.
3. Click Save và quan sát DOM/network.

**Kỳ vọng:** chỉ nút Save loading; không reload page hoặc replace `page-body`; response patch form tại chỗ; draft/focus không liên quan không mất; lỗi API giữ input và cho retry.

### CIS-004 — Source snapshot và Markdown safety — P1

1. Kiểm tra ma trận Field × System cho Backlog/CIS/Jira.
2. Mở rộng/thu gọn nội dung dài.
3. Đưa raw HTML/script text vào test description.

**Kỳ vọng:** source branch không bị manual edit ghi đè; preview không thực thi raw HTML; layout desktop/mobile đúng.

### CIS-005 — Link Backlog identity — P1

1. Trên `CIS-A`, link `BL-A` hoặc một Backlog test issue chưa gắn CIS khác.
2. Thử link key thuộc project khác/nonexistent.
3. Thử link cùng identity vào issue thứ hai.

**Kỳ vọng:** chỉ identity tồn tại trong `18DMP` được chấp nhận; cross-project/nonexistent/duplicate bị chặn; không mutate khi fail.

### CIS-006 — Link Jira identity — P1

1. Link `JR-A` vào test CIS issue còn trống Jira identity.
2. Thử Jira key ngoài `DMP` hoặc đã được dùng.

**Kỳ vọng:** provider lookup xác minh project `DMP`; immutable identity không bị đổi lén; invalid/duplicate không tạo side effect.

### CIS-007 — Direct translate issue và translate một queue item — P1

1. Gọi direct translate cho một test issue có source hiện tại.
2. Gọi translate cho đúng một queue item; double-click/gửi lại khi job đang active.
3. Dùng fake adapter/intercept nếu real AI chưa được cấp quyền.

**Kỳ vọng:** HTTP chỉ enqueue/reuse job, không chạy AI đồng bộ; issue/item khác không bị loading; dedupe theo queue/source revision; lỗi giữ draft và không đổi canonical.

### CIS-008 — History và worklogs — P1

1. Mở history/worklog của golden-path issue sau create, pull, edit và sync.
2. Đối chiếu API với timeline/summary trong Issue Editor.
3. Kiểm tra empty state trên `CIS-A` chưa có worklog.

**Kỳ vọng:** record đúng Project/issue, thứ tự thời gian và actor/action rõ; empty/loading/error/retry đầy đủ; không lộ payload credential hoặc resource Project khác.

### CIS-009 — Force approve, mark duplicate và invalid transition — P1

1. Trên isolated automated fixture hoặc test issue không còn dùng cho publish, force approve trạng thái được contract cho phép.
2. Mark duplicate sang một test CIS issue hợp lệ cùng Project.
3. Thử self-reference, target khác Project, target không tồn tại và transition lặp.

**Kỳ vọng:** lifecycle state và journal chỉ đổi trên issue đích; invalid transition trả lỗi rõ và không mutate; duplicate issue không còn được publish độc lập. Nếu UI chưa có action, API/service automated evidence là bắt buộc.

## 10. Translation và Glossary

### TRN-001 — Translation Queue đúng Project/issue — P0

1. Mở queue sau `BLG-006`.
2. Lọc/mở item summary và description.

**Kỳ vọng:** chỉ item Project 1; identifier hệ thống/issue/field đúng; source/draft chỉ mở trong review modal.

### TRN-002 — Save Draft không đổi canonical — P0

1. Ghi draft Việt ngữ `[RUN_ID]` vào queue item.
2. Click Save Draft.
3. Đọc lại queue item và Issue Editor.

**Kỳ vọng:** `ai_draft` đổi, canonical CIS chưa đổi; chỉ item/modal hiện loading; queue item khác không rerender hoặc mất draft.

### TRN-003 — Approve áp draft vào canonical — P0

1. Approve draft đã lưu.
2. Mở lại Issue Editor.

**Kỳ vọng:** review status `approved`; canonical target field bằng draft; reviewed metadata/journal đúng; source Backlog không đổi.

### TRN-004 — Reject — P1

1. Reject item test khác kèm review note.

**Kỳ vọng:** status/reason patch đúng row; canonical không đổi; item khác giữ nguyên.

### TRN-005 — Stale draft sau source update — P1

1. Save draft cho `BL-B` nhưng chưa approve.
2. Update source `BL-B` qua Backlog API và pull lại.
3. Thử approve draft cũ.

**Kỳ vọng:** stale warning rõ; Approve bị khóa hoặc API từ chối tới khi Save Draft theo source mới/retranslate; draft cũ không tự mất.

### TRN-006 — Retranslate — P1 có điều kiện

Chỉ chạy real AI khi user phê duyệt chi phí/provider. Nếu chưa, xác minh automated adapter test và chỉ kiểm tra UI request/error state bằng intercept.

**Kỳ vọng:** enqueue/reuse đúng translate job, chỉ action item loading, provider error giữ draft và cho retry.

### GLS-001 — Glossary CRUD và runtime pair — P1

1. Tạo `GL-A` với source `ja`, target `vi`, mỗi language có canonical và variant.
2. View/Edit note và variant.
3. Thử normalized duplicate/canonical invalid.
4. Xóa test concept sau khi ghi evidence.

**Kỳ vọng:** CRUD Project-scoped; validation `422`/conflict rõ và giữ form; runtime chỉ dùng concept đủ source-target pair; không còn Project JSON fallback.

## 11. Mapping và anomaly gate

### MAP-001 — Ba catalog actions độc lập — P0

Chạy lần lượt:

1. `Pull Backlog fields`;
2. `Pull Jira fields`;
3. `Sync CIS catalog from Jira`.

**Kỳ vọng:** chỉ nút click loading; không reload bảng; draft mapping khác còn nguyên; result/warning của đúng action hiển thị rõ.

### MAP-002 — Save nhiều mapping item nối tiếp — P0

1. Chỉnh ít nhất hai row A/B thành unsaved.
2. Save A, trong khi request pending tiếp tục chỉnh B.
3. Sau A success, Save B.

**Kỳ vọng:** pending chỉ ở A; B giữ selection/Unsaved; A patch status/value tại chỗ; settings list không refetch tự động.

### MAP-003 — Error/retry đúng item — P0

1. Dùng Playwright intercept để trả lỗi tạm thời cho một mapping save.
2. Xác minh selection giữ nguyên rồi retry.

**Kỳ vọng:** lỗi nằm tại row/action; row khác không đổi; retry success không reload page.

### MAP-004 — Approve/reject mapping — P1

1. Tạo/update test mapping thuộc giá trị `BL-D`.
2. Reject rồi approve đúng rule.

**Kỳ vọng:** status transition đúng; rule Project khác không thể dùng; Jira gate chỉ chấp nhận approved mapping.

### ANO-001 — Blocking anomaly — P0

1. Tạo `AN-A` loại hợp lệ, severity `critical`, status `open`, gắn test issue.
2. Chạy Jira dry-run.
3. Resolve `AN-A`, chạy lại dry-run.

**Kỳ vọng:** open critical anomaly block publish và nêu lý do; resolve chỉ patch đúng anomaly row; dry-run sau resolve không còn blocker này.

### ANO-002 — Resolve/ignore local state — P1

1. Tạo `AN-A` và `AN-B`.
2. Mở detail A và resolve; mở B và ignore.

**Kỳ vọng:** modal/action chỉ loading tại item hiện tại; row còn lại giữ DOM/state; journal/evidence đúng operator.

## 12. Jira dry-run và outbound

### JIR-001 — Pull Jira catalog — P0

1. Chạy `Pull Jira fields` từ Mappings.

**Kỳ vọng:** metadata lấy từ Jira `DMP`; issue type/status/priority/component/user directory hợp lệ; accountId không bị dùng thay text/email trong legacy value.

### JIR-002 — Dry-run bị block — P0

Chuẩn bị test issue lần lượt thiếu approved mapping, có open critical anomaly hoặc state chưa syncable.

**Kỳ vọng:** `can_sync=false`, lỗi/warning chỉ rõ nguyên nhân, không gọi Jira write API, journal ghi dry-run evidence.

### JIR-003 — Dry-run pass và payload preview — P0

1. Approve mapping, resolve blocking anomaly, hoàn tất canonical state.
2. Chạy dry-run.

**Kỳ vọng:** `can_sync=true`; payload Jira dùng canonical/reviewed data; project key luôn `DMP`; warning không bị che; chưa tạo/update Jira issue.

### JIR-004 — Stale dry-run — P0

1. Dry-run pass.
2. Sửa canonical issue rồi Save.
3. Thử Sync Jira bằng preview cũ.

**Kỳ vọng:** sync bị chặn vì stale; phải chạy dry-run lại; không có Jira side effect.

### JIR-005 — Publish tạo Jira issue — P0

1. Dùng test issue chưa có Jira key, dry-run mới và pass.
2. Click Sync Jira.
3. Poll job tới terminal, GET Jira read-back.

**Kỳ vọng**

- Chỉ tạo issue trong Jira `DMP`, summary có `[RUN_ID]`.
- CIS lưu Jira key đúng issue, job/journal/correlation đầy đủ.
- UI không tuyên bố success trước terminal job.
- Không upload attachment vì attachment outbound hoàn chỉnh đang out of scope.

### JIR-006 — Publish update, không duplicate — P0

1. Sửa canonical test issue đã có Jira key.
2. Dry-run lại và Sync Jira.
3. Read-back Jira.

**Kỳ vọng:** update cùng Jira key, không tạo issue thứ hai; fields/transition chỉ đổi theo payload đã review; journal ghi update success.

### JIR-007 — Provider/auth/rate-limit error — P1, không phá credential

Dùng network intercept/fake adapter evidence; không sửa token thật để gây lỗi.

**Kỳ vọng:** lỗi 401/403/429/5xx được normalize, retryable đúng policy, draft/input giữ nguyên, không leak response credential/header.

### JIR-008 — Reconcile một Jira trace match — P0

1. Chuẩn bị một Jira `DMP` issue có đúng trace marker của test CIS issue nhưng CIS chưa lưu Jira identity.
2. Chạy dry-run/sync qua handler chuẩn.
3. GET read-back Jira và CIS identity.

**Kỳ vọng:** đúng một match được claim/link rồi update nếu cần; không tạo Jira issue thứ hai; journal ghi quyết định reconcile và correlation rõ.

### JIR-009 — Multiple trace/concurrent create conflict — P0

Ưu tiên automated fake Jira adapter để trả nhiều trace match và mô phỏng hai worker cùng create. Live chỉ chạy khi có quyền bổ sung và cleanup an toàn.

**Kỳ vọng:** nhiều match hoặc race chuyển thành conflict/anomaly có thể điều tra; không chọn ngẫu nhiên identity, không ghi đè link đã có và không tạo thêm Jira issue; retry không nhân đôi side effect.

### COM-001 — Publish reviewed Backlog comment sang Jira — P0

1. Dùng comment `[RUN_ID]` của `BL-C`, bảo đảm issue đã sync thành công sang Jira `DMP`.
2. Hoàn tất translation/review comment theo contract.
3. Theo dõi comment job tới terminal rồi GET Jira read-back.

**Kỳ vọng:** comment job chỉ được enqueue sau issue sync; nội dung reviewed được tạo trên đúng Jira key trong `DMP`; CIS lưu external comment identity/status; journal/correlation nối được source comment tới Jira comment.

### COM-002 — Comment publish prerequisites — P0

Kiểm tra riêng comment thiếu Jira issue identity và comment chưa có reviewed translation.

**Kỳ vọng:** job bị block/skip với lý do cụ thể trước provider write; không tạo Jira comment và không đánh dấu synced; sau khi đủ prerequisite có thể retry có chủ ý.

### COM-003 — Comment idempotency, failure và retry — P0

1. Gửi lại comment đã synced.
2. Dùng fake adapter/intercept mô phỏng 429/5xx sau/before provider acknowledgement.
3. Retry và đối chiếu Jira comment count/external identity.

**Kỳ vọng:** comment đã synced được skip/reuse; failure ghi failed/retryable đúng policy; retry không tạo duplicate kể cả khi response đầu mơ hồ; không retry 4xx không-retryable.

## 13. Sync Jobs, retry, cancel, attachment và Journal

### JOB-001 — Cancel pending job — P0

1. Tạo `JOB-CANCEL` có `run_after` tương lai.
2. Click Cancel trên đúng row.

**Kỳ vọng:** status `cancelled`; chỉ row đó loading/patch; pending row khác không bị khóa; journal ghi cancel.

### JOB-002 — Failed job và intentional retry — P0

1. Enqueue `JOB-FAIL` manual pull với Backlog key không tồn tại nhưng mang prefix `RUN_ID`.
2. Chờ worker chuyển `failed`, xem error/journal.
3. Retry một lần.

**Kỳ vọng:** failure chỉ thực hiện safe read trên Backlog `18DMP`; retry chỉ sau khi operator xem evidence; row-local loading; attempt/journal tăng đúng; không tạo CIS issue giả.

### JOB-003 — Polling scope và terminal state — P1

**Kỳ vọng:** poll URL luôn chứa `/projects/1/`; terminal `success/failed/cancelled` dừng timer; timeout không bị coi là failed và cho manual Refresh.

### ATT-001 — Attachment retry — P1 có điều kiện

Nếu có attachment test với `download_status=failed`, retry từ Issue Editor.

**Kỳ vọng:** chỉ attachment Backlog thuộc Project 1 được retry; issue ingest state không bị đổi; status/error/hash patch đúng; journal ghi recovery. Nếu không tạo được failure an toàn, dùng automated fixture evidence và ghi `N/A-CONDITIONAL`.

### JNL-001 — Journal read-only và trace hoàn chỉnh — P0

1. Mở journal toàn Project và journal của golden-path issue.
2. Trace từ Backlog pull → translation → dry-run → Jira sync.

**Kỳ vọng:** direction, job, issue, action, status, trigger, timestamp và message đủ giải thích kết quả; journal UI không có mutation action.

## 14. Dashboard và vận hành

### DSH-001 — Counts khớp source list — P0

Đối chiếu Dashboard Project 1 với API/list:

- `pull_jobs_pending`: manual-pull job `pending`;
- `translation_pending`: queue `pending` hoặc `ai_draft`;
- `issue_pending_mapping`: số `issue_id` khác nhau có mapping-gap `open/investigating`;
- `sync_jobs_failed`: mọi failed job;
- `anomaly_open`: anomaly `open/investigating`;
- `issues_total`: CIS issues Project 1.

**Kỳ vọng:** counts bằng source list cùng thời điểm; response không có global `projects_enabled`.

### DSH-002 — Alert links và active Project — P0

1. Dùng `AN-A`/`JOB-FAIL` tạo alert.
2. Click từng metric và alert.

**Kỳ vọng:** link mở đúng Mappings/Translation/Anomalies/Sync Jobs/CIS Issues, giữ Project 1; alert không chứa data Project khác.

### DSH-003 — Loading/empty/error/retry — P1

1. Dùng Playwright intercept để giữ request pending, trả empty, trả 503 rồi success khi Retry.

**Kỳ vọng:** loading/empty/error state rõ; Retry dùng keyboard được; không fetch nếu chưa chọn Project hoặc Project disabled.

## 15. Project scope, API contract và security regression

### SEC-001 — Invalid/missing/disabled Project — P0

**Kỳ vọng:** invalid/missing trả `404 PROJECT_NOT_FOUND`; disabled trả `409 PROJECT_DISABLED`.

### SEC-002 — Scope mismatch — P0

Gửi URL Project 1 nhưng body/query `project_id` khác.

**Kỳ vọng:** `422 PROJECT_SCOPE_MISMATCH`, không tạo issue/job/journal/mapping/anomaly.

### SEC-003 — Foreign resource lookup — P0

Live test không được mutate Project khác. Dùng automated A/B fixture làm evidence chính. Nếu có Project khác sẵn và được phép read-only, dùng resource Project 1 dưới URL Project kia để xác minh `404 RESOURCE_NOT_FOUND`; không gọi provider API và không mutation.

### SEC-004 — Legacy workspace routes — P0

Kiểm tra route cũ Dashboard/issues/translation/mapping/anomaly/jobs/journal/attachment trả `404`; static cutover gate phải pass; không có compatibility fallback.

### SEC-005 — Envelope, correlation và secret hygiene — P1

**Kỳ vọng:** success có `{data}`, lỗi có code/message/correlation; log/evidence không chứa API key, Authorization, password hay Jira token.

## 16. UI state, accessibility và responsive

### UX-001 — Không reload ngoài Refresh — P0

Theo dõi `performance.navigation`, DOM marker hoặc Playwright request count trong các action Save mapping, Save issue, approve/reject/retranslate, resolve/ignore, retry/cancel và ba catalog buttons.

**Kỳ vọng:** không full-page reload, không replace `page-body`; chỉ nút/row/item phát request loading. Reload chủ động trên Backlog Issues phải phục hồi active candidate jobs, khóa đúng row và không enqueue lại.

### UX-002 — Error giữ input — P0

Intercept lỗi cho Issue Save, Mapping Save, Translation Save Draft và một catalog action.

**Kỳ vọng:** input/selection/draft còn nguyên; focus hợp lý; retry đúng action.

### UX-003 — Keyboard/focus/dialog — P1

Tab qua nav, filter, metric link, row action và modal; đóng dialog bằng control; kiểm tra focus-visible.

**Kỳ vọng:** mọi action quan trọng dùng được bằng keyboard; dialog nhận focus ban đầu; không kẹt focus sau close.

### UX-004 — Responsive — P2

Kiểm tra desktop, tablet và mobile cho Dashboard, Mappings, Backlog Issues, Issue Editor, Translation modal, Jobs và Journal.

**Kỳ vọng:** không mất action, table chuyển responsive đúng, Issue Editor rail xếp dọc, không horizontal overflow làm che control chính.

## 17. Non-functional và operation

### OPS-001 — Concurrent action isolation — P1

Chạy hai mutation độc lập ở hai row/item khi request đầu còn pending.

**Kỳ vọng:** không global lock, không race làm mất draft, response item A không overwrite item B.

### OPS-002 — Idempotency/dedupe — P1

Double-click hoặc gửi lại candidate sync/translate cùng source.

**Kỳ vọng:** reuse active job/queue theo contract; không tạo duplicate external identity hoặc Jira issue.

### OPS-003 — Provider timeout/network recovery — P1

Dùng controlled intercept/fake evidence, không phá credential thật.

**Kỳ vọng:** timeout có error code rõ; retryable chỉ cho network/429/5xx/SQLite transient; UI dừng spinner và giữ state.

### OPS-004 — Release smoke — P0

Sau deploy cùng artifact Backend + Admin Web, chạy tối thiểu:

1. health;
2. login/chọn Project;
3. Dashboard;
4. Backlog browse/pull one;
5. Issue Save;
6. Mapping Save và ba catalog actions;
7. dry-run;
8. one safe Jira create/update test;
9. failed-job retry;
10. legacy route 404.

Nếu smoke fail: dừng toàn bộ release mới, giữ DB lỗi để điều tra, restore backup và rollback cả Backend + Admin Web; không rollback riêng một phía.

### RUN-001 — Run manifest, retention và reconciliation — P0

1. Trước CIS/external write đầu tiên, tạo report có `RUN_ID`, release SHA, API/Admin base URL, backup checksum, original Project flags và giới hạn record tối đa của run.
2. Sau mỗi create/enqueue/link, append system, resource type, ID/key, case owner và cleanup policy; không ghi secret/request header.
3. Trước cleanup, so manifest với CIS/provider read-back và test prefix inventory.
4. Sau cleanup, ghi terminal job count, resource còn giữ lại, lý do và owner.

**Kỳ vọng:** mọi test write truy ngược được về case; run dừng trước khi vượt giới hạn đã định; không còn pending/running test job; resource không thể xóa được reconcile đầy đủ thay vì bị quên do CIS chưa có delete contract.

### MPA-001 — Admin Web proxy và document runtime contract — P1

Kiểm tra bằng automated HTTP/browser test: API proxy success/401/timeout/upstream unavailable; security headers/CSP; `Cache-Control: no-store` cho response nhạy cảm; document route không tồn tại; non-GET vào document route.

**Kỳ vọng:** proxy giữ envelope/correlation phù hợp, timeout/upstream failure được chuẩn hóa thành `502/504`; document 404 đúng, method không hỗ trợ trả `405`; CSP/header không chặn asset hợp lệ và không làm lộ token.

## 18. Cleanup

Cleanup bắt buộc chạy trong `finally` hoặc checklist kết thúc:

1. Re-enable Project 1 nếu case disabled đã chạy.
2. Cancel pending test jobs có `RUN_ID`; không cancel job nghiệp vụ khác.
3. Resolve/ignore test anomalies `AN-A/B` và ghi note/evidence.
4. Xóa test glossary concept `GL-A` qua public API.
5. Với Backlog/Jira test issues, thêm comment `[RUN_ID] test complete`; transition sang trạng thái kết thúc nếu workflow cho phép và không ảnh hưởng automation sau.
6. Không xóa CIS issue trực tiếp nếu product chưa có delete contract; giữ identity/journal làm audit evidence.
7. Ghi danh sách mọi resource không cleanup được, gồm system, id/key, owner và lý do.
8. Reconcile danh sách Backlog/Jira/CIS/job/comment trong `RUN-MANIFEST` với read-back; không chỉ dựa vào khả năng delete.
9. Xác minh không còn pending/running test job và Project 1 vẫn enabled/sync-enabled với đúng original flags.

## 19. Result matrix

Mỗi test run copy đủ 76 dòng case dưới đây sang report riêng; không được gộp range khi ghi kết quả:

| Case | Priority | Mode | Requirement/API | Result | Evidence | Resource IDs | Cleanup | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRE-001 | P0 | Live | Health, backup, runtime | NOT RUN |  |  |  |  |
| AUTH-001 | P0 | Live | Login, `/auth/me` | NOT RUN |  |  |  |  |
| AUTH-002 | P1 | Live | Login failure, logout | NOT RUN |  |  |  |  |
| PRJ-001 | P0 | Live | Project selection gate | NOT RUN |  |  |  |  |
| PRJ-002 | P1 | Conditional | Project disable gate | NOT RUN |  |  | Restore enabled |  |
| PRJ-003 | P0 | Live/Automated | Credential redaction | NOT RUN |  |  | Restore config |  |
| PRJ-004 | P1 | Live | Project config contract | NOT RUN |  |  | Restore snapshot |  |
| PRJ-005 | P1 | Conditional | Sync/pull readiness | NOT RUN |  |  | Restore flags |  |
| PRJ-006 | P1 | Automated | Project CRUD isolated | NOT RUN |  |  | Delete fixture |  |
| BLG-001 | P0 | Live | Pull Backlog catalog | NOT RUN |  |  |  |  |
| BLG-002 | P0 | Live | Candidate browse gating | NOT RUN |  |  |  |  |
| BLG-003 | P1 | Live | Candidate filters | NOT RUN |  |  |  |  |
| BLG-004 | P1 | Live | Candidate empty states | NOT RUN |  |  |  |  |
| BLG-005 | P0 | Live | Candidate sync | NOT RUN |  |  | Manifest |  |
| BLG-006 | P0 | Live | Sync and translate | NOT RUN |  |  | Manifest |  |
| BLG-006A | P0 | Automated/Live | Atomic translate and Jira delivery | NOT RUN |  |  | Manifest |  |
| BLG-007 | P0 | Live | Pull-one idempotency | NOT RUN |  |  | Manifest |  |
| BLG-008 | P1 | Conditional | Comment/attachment ingest | NOT RUN |  |  | Manifest |  |
| BLG-009 | P0 | Automated/Live | Project/scheduled pull disabled | NOT RUN |  |  |  |  |
| BLG-010 | P0 | Automated/Conditional | Pull readiness/routing | NOT RUN |  |  | Restore flags |  |
| CIS-001 | P0 | Live | Issue list/detail scope | NOT RUN |  |  |  |  |
| CIS-002 | P0 | Live | Manual issue create | NOT RUN |  |  | Manifest |  |
| CIS-003 | P0 | Live/Intercept | Canonical save state | NOT RUN |  |  |  |  |
| CIS-004 | P1 | Live | Source/Markdown safety | NOT RUN |  |  |  |  |
| CIS-005 | P1 | Live | Link Backlog identity | NOT RUN |  |  | Manifest |  |
| CIS-006 | P1 | Live | Link Jira identity | NOT RUN |  |  | Manifest |  |
| CIS-007 | P1 | Automated/Intercept | Direct translate actions | NOT RUN |  |  | Cancel fixture jobs |  |
| CIS-008 | P1 | Live | History/worklogs | NOT RUN |  |  |  |  |
| CIS-009 | P1 | Automated | Approve/duplicate lifecycle | NOT RUN |  |  | Delete fixture DB |  |
| TRN-001 | P0 | Live | Translation queue scope | NOT RUN |  |  |  |  |
| TRN-002 | P0 | Live | Save draft | NOT RUN |  |  |  |  |
| TRN-003 | P0 | Live | Approve draft | NOT RUN |  |  |  |  |
| TRN-004 | P1 | Live | Reject draft | NOT RUN |  |  |  |  |
| TRN-005 | P1 | Live | Stale draft guard | NOT RUN |  |  |  |  |
| TRN-006 | P1 | Conditional/Intercept | Retranslate | NOT RUN |  |  | Cancel fixture jobs |  |
| GLS-001 | P1 | Live | Glossary CRUD/runtime | NOT RUN |  |  | Delete `GL-A` |  |
| MAP-001 | P0 | Live | Three catalog actions | NOT RUN |  |  |  |  |
| MAP-002 | P0 | Live | Sequential item save | NOT RUN |  |  | Restore mappings |  |
| MAP-003 | P0 | Intercept | Mapping error/retry | NOT RUN |  |  |  |  |
| MAP-004 | P1 | Live | Mapping review state | NOT RUN |  |  | Restore mapping |  |
| ANO-001 | P0 | Live | Blocking anomaly gate | NOT RUN |  |  | Resolve test anomaly |  |
| ANO-002 | P1 | Live | Resolve/ignore isolation | NOT RUN |  |  | Close test anomalies |  |
| JIR-001 | P0 | Live | Pull Jira catalog | NOT RUN |  |  |  |  |
| JIR-002 | P0 | Live | Blocked dry-run | NOT RUN |  |  |  |  |
| JIR-003 | P0 | Live | Passing dry-run preview | NOT RUN |  |  |  |  |
| JIR-004 | P0 | Live | Stale preview guard | NOT RUN |  |  |  |  |
| JIR-005 | P0 | Live | Jira create | NOT RUN |  |  | Mark test complete |  |
| JIR-006 | P0 | Live | Jira update/no duplicate | NOT RUN |  |  | Mark test complete |  |
| JIR-007 | P1 | Automated/Intercept | Provider errors | NOT RUN |  |  |  |  |
| JIR-008 | P0 | Live/Automated | Single trace reconcile | NOT RUN |  |  | Manifest |  |
| JIR-009 | P0 | Automated | Multi-trace/create race | NOT RUN |  |  | Delete fixture DB |  |
| COM-001 | P0 | Live | Reviewed comment publish | NOT RUN |  |  | Manifest |  |
| COM-002 | P0 | Automated/Live | Comment prerequisites | NOT RUN |  |  |  |  |
| COM-003 | P0 | Automated/Intercept | Comment retry/idempotency | NOT RUN |  |  |  |  |
| JOB-001 | P0 | Live | Cancel pending job | NOT RUN |  |  | Cancel fixture |  |
| JOB-002 | P0 | Live | Failed job/retry | NOT RUN |  |  | Terminal fixture |  |
| JOB-003 | P1 | Live/Intercept | Polling terminal state | NOT RUN |  |  |  |  |
| ATT-001 | P1 | Conditional/Automated | Attachment retry | NOT RUN |  |  | Manifest |  |
| JNL-001 | P0 | Live | Journal trace | NOT RUN |  |  |  |  |
| DSH-001 | P0 | Live | Dashboard counts | NOT RUN |  |  |  |  |
| DSH-002 | P0 | Live | Alert links/scope | NOT RUN |  |  |  |  |
| DSH-003 | P1 | Intercept | Dashboard states/retry | NOT RUN |  |  |  |  |
| SEC-001 | P0 | Automated/Live | Invalid/disabled Project | NOT RUN |  |  | Restore enabled |  |
| SEC-002 | P0 | Automated | Scope mismatch | NOT RUN |  |  |  |  |
| SEC-003 | P0 | Automated | Foreign resource lookup | NOT RUN |  |  | Delete fixture DB |  |
| SEC-004 | P0 | Automated | Legacy route 404 | NOT RUN |  |  |  |  |
| SEC-005 | P1 | Automated/Live | Envelope/secret hygiene | NOT RUN |  |  |  |  |
| UX-001 | P0 | Browser | Local action/no reload | NOT RUN |  |  |  |  |
| UX-002 | P0 | Intercept | Error preserves input | NOT RUN |  |  |  |  |
| UX-003 | P1 | Browser | Keyboard/focus/dialog | NOT RUN |  |  |  |  |
| UX-004 | P2 | Browser | Responsive layouts | NOT RUN |  |  |  |  |
| OPS-001 | P1 | Intercept | Concurrent isolation | NOT RUN |  |  |  |  |
| OPS-002 | P1 | Automated/Live | Idempotency/dedupe | NOT RUN |  |  |  |  |
| OPS-003 | P1 | Automated/Intercept | Timeout/network recovery | NOT RUN |  |  |  |  |
| OPS-004 | P0 | Live | Release smoke | NOT RUN |  |  | Reconcile run |  |
| RUN-001 | P0 | Live | Manifest/reconciliation | NOT RUN |  |  | Close manifest |  |
| MPA-001 | P1 | Automated/Browser | Proxy/document runtime | NOT RUN |  |  |  |  |

## 20. Release acceptance

Release chỉ được coi là pass khi:

- toàn bộ P0 pass;
- P1 không có lỗi data loss, cross-project leak, duplicate Jira issue, bypass dry-run hoặc mất draft;
- Project API/UI không trả, pre-fill hoặc ghi log raw credential; blank-secret update giữ secret hiện có;
- mọi external write được chứng minh chỉ thuộc Backlog `18DMP`/Jira `DMP`;
- outbound issue và reviewed comment đều qua gate, có identity/journal và không duplicate khi retry;
- không còn pending/running test job;
- `RUN-MANIFEST` reconcile đủ mọi resource; cleanup hoàn tất hoặc có debt owner rõ;
- automated gates `npm test`, `npm run verify:admin-ui-e2e`, `npm run verify:project-scope` và `npm run verify:docs` pass;
- người review xác nhận HG-03.
