# Implement rules

File này là checklist thực thi khi sửa/thêm code liên quan đến modular monolith.

Nếu task đụng `src/modules`, đọc file này trước khi code.

## Luật bắt buộc

1. Module khác chỉ gọi nhau qua `<Domain>Api.js`.
2. Không import `application/`, `infrastructure/`, hoặc `support/` của module khác.
3. Controller chỉ gọi API/use case của module chủ quản route.
4. `<Domain>Api.js` không được thành proxy cho use case thuộc module khác.
5. Cross-module write bị cấm; phải gọi public API của module owner.
6. Cross-module read SQL chỉ hợp lệ nếu thuộc tier/allowlist.
7. `support/` là private nội bộ module.
8. Business rule không được copy sang module khác để né boundary.
9. Pure utility thật sự chung đặt ở `src/shared`.
10. Technical infrastructure dùng chung đặt ở `src/infrastructure`.

## Decision tree trước khi thêm code

### Đây là use case nghiệp vụ?

Đặt vào:

```text
src/modules/<OwnerDomain>/application/
```

Expose qua:

```text
src/modules/<OwnerDomain>/<OwnerDomain>Api.js
```

### Đây là repository/client/adapter riêng domain?

Đặt vào:

```text
src/modules/<OwnerDomain>/infrastructure/
```

Module khác không import trực tiếp file này.

### Đây là client kỹ thuật dùng chung?

Đặt vào:

```text
src/infrastructure/
```

Ví dụ: HTTP base client, SQLite transaction, AI transport, logger, storage.

### Đây là helper thuần không thuộc domain?

Đặt vào:

```text
src/shared/
```

Chỉ làm vậy nếu helper không chứa business ownership của domain nào.

### Đây là helper có business meaning của một domain?

Giữ trong domain owner và expose capability qua `<Domain>Api` nếu module khác cần dùng.

## Controller rule

Đúng:

```js
const BacklogApi = require("../../BacklogApi");
```

Sai:

```js
const SyncApi = require("../../../Sync/SyncApi");
const { pullIssue } = require("../../application/pullIssue");
```

Nếu route cũ buộc phải giữ ở module khác:

```js
// TODO compatibility wrapper: Translation owns this use case.
return TranslationApi.requestIssueTranslations(input);
```

Wrapper compatibility không được chứa business logic mới.

## Public API rule

Không thêm method vào module A chỉ để gọi hộ module B.

Sai:

```js
// CisApi.js
function requestIssueTranslations(input) {
  return TranslationApi.requestIssueTranslations(input);
}
```

Đúng:

```js
// caller
return TranslationApi.requestIssueTranslations(input);
```

Ngoại lệ chỉ dành cho compatibility route/API cũ có TODO rõ.

## Data write rule

Trước khi ghi bảng, hỏi:

1. Bảng này thuộc module nào?
2. Code hiện tại có nằm trong module owner không?
3. Nếu không, owner đã có API public để ghi chưa?
4. Nếu chưa, thêm use case/API vào module owner.

Ví dụ:

- Ghi `issues.*` -> `CisApi`.
- Ghi `sync_jobs`, `sync_journal` -> `SyncApi`.
- Ghi lifecycle `translation_queue` -> `TranslationApi`.
- Ghi `anomaly_log` -> `AnomalyApi`.
- Ghi `mapping_rules` -> `MappingApi`.
- Ghi `projects` -> `ProjectsApi`.

## Data read rule

Ưu tiên owner read API. Direct SQL chéo bảng chỉ chấp nhận nếu:

- Thuộc Tier 1/2/3 trong [boundary_model.md](boundary_model.md).
- Có trong allowlist ở [data_ownership.md](data_ownership.md).
- Không chứa business rule của owner.
- Không đi kèm write foreign table.

Nếu thêm read exception mới, cập nhật [data_ownership.md](data_ownership.md) trong cùng PR/task.

## Translation/AI rule

Trong `src/modules/Translation`:

- Không gọi `fetch`, `child_process`, `spawn`, `spawnSync`.
- Không tạo class tên `DeepSeekTranslationProvider`, `CodexExecTranslationProvider`, `OpenAiTranslationProvider`.
- Không dùng factory tên `providerFor` cho nghiệp vụ mới.
- Chỉ dùng adapter trung tính như `TranslationAdapter`, `ProcessTranslationAdapter`, `translationAdapterFor`.

Trong `src/infrastructure/ai`:

- Được xử lý URL, auth, timeout, request/response protocol, process execution.
- Không chứa prompt nghiệp vụ, review state hoặc audit translation.

Config mới dùng:

```text
translation_ai_provider
translation_ai_transport
translation_ai_model
```

## Audit bắt buộc sau khi sửa `src/modules`

Import boundary:

```powershell
rg -n 'require\("\.\./\.\./[A-Za-z]+/(application|infrastructure|support)|require\("\.\./\.\./\.\./modules/[A-Za-z]+/(application|infrastructure|support)' src\modules -g '*.js'
```

Kết quả phải rỗng.

Cross-module write review:

```powershell
rg -n 'UPDATE (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'INSERT INTO (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'DELETE FROM (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
```

Mỗi match phải đúng owner hoặc đã đi qua API owner. Nếu không, sửa trước khi kết luận xong.

Nếu sửa Translation/AI:

```powershell
rg -n "fetch\(|child_process|spawn\(|spawnSync\(" src\modules\Translation -g "*.js"
rg -n "TranslationProvider|DeepSeekTranslation|CodexExecTranslation|providerFor" src\modules\Translation src\infrastructure\ai -g "*.js"
```

Hai lệnh trên phải rỗng.

## Verify

Chạy verify phase liên quan:

```text
npm run verify:phaseXX
```

Nếu thay đổi ảnh hưởng nhiều module hoặc boundary chung:

```text
npm test
```

Không tick checklist `Unit test check (Agent)` nếu lệnh verify/test chưa pass thật. Không tick `Manual check (Người review)` nếu user chưa xác nhận manual pass.

## Definition of Done boundary

Task đụng module chỉ được coi là xong khi:

- Import audit không còn vi phạm.
- Không còn cross-module write sai owner.
- Read SQL exception mới đã có tier/allowlist.
- Controller không gọi module khác trực tiếp.
- Public API không thêm proxy mờ ownership.
- Verify/test liên quan đã chạy và pass.
