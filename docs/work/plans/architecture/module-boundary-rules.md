# Module Boundary Rules

File này là luật bắt buộc cho modular monolith của `task_transportor`.

Mục tiêu: không để module gọi trực tiếp `application/`, `infrastructure/`, hoặc `support/` của module khác. Bug loại này đã từng xảy ra và phải xem là regression kiến trúc nghiêm trọng.

## Luật Bắt Buộc

### 1. Module khác chỉ được gọi qua public API

Được phép:

```js
const CisApi = require("../../Cis/CisApi");
const ProjectsApi = require("../../Projects/ProjectsApi");
```

Không được phép:

```js
const { getIssueEditor } = require("../../Cis/application/getIssueEditor");
const { createCisRepository } = require("../../Cis/infrastructure/CisRepository");
const { resolveCanonicalField } = require("../../Cis/support/resolveCanonicalField");
```

Module public boundary luôn là:

```text
src/modules/<Domain>/<Domain>Api.js
```

Nếu module cần capability mới từ module khác, thêm use case vào module sở hữu rồi export qua `<Domain>Api.js`. Không import sâu để đi tắt.

### 2. Controller không được gọi module khác trực tiếp

Controller chỉ gọi API/use case của module chủ quản route đó.

Nếu endpoint đang nằm ở module A nhưng business action thuộc module B, module A chỉ được làm wrapper mỏng qua `ModuleBApi`.

Được phép:

```js
// src/modules/Cis/CisApi.js
function requestIssueTranslations(input) {
  const TranslationApi = require("../Translation/TranslationApi");
  return TranslationApi.requestIssueTranslations(input);
}
```

Không được phép:

```js
// src/modules/Cis/http/controllers/...
const { requestIssueTranslations } = require("../../Translation/application/requestIssueTranslations");
```

### 3. `support/` là private nội bộ module

`support/` chỉ chứa helper thuần nội bộ module.

Không được import:

```text
src/modules/<OtherDomain>/support/*
```

Nếu helper thật sự dùng chung và không mang business ownership của module nào, chuyển sang:

```text
src/shared/*
```

Nếu helper là business rule của một domain, expose qua `<Domain>Api.js`, không chuyển sang shared để né boundary.

### 4. Infrastructure của module là private

Không module nào được import:

```text
src/modules/<OtherDomain>/infrastructure/*
```

Repository, client, adapter trong `modules/<Domain>/infrastructure` thuộc quyền sở hữu của module đó.

Nếu cần dữ liệu, thêm method public vào `<Domain>Api.js`.

Nếu cần technical client dùng chung nhiều module, đưa xuống:

```text
src/infrastructure/*
```

Ví dụ AI:

```text
src/infrastructure/ai/OpenAiCompatibleChatClient.js
src/infrastructure/ai/AnthropicCompatibleMessagesClient.js
src/infrastructure/ai/CodexExecClient.js
```

Module business chỉ inject/call client này qua adapter nội bộ của chính module.

### 5. Không tạo vòng phụ thuộc module

Không để:

```text
Cis -> Translation/application
Translation -> Cis/infrastructure
```

Nếu hai module cần gọi nhau, cả hai chiều phải đi qua public API. Khi CommonJS circular require xảy ra, dùng lazy require trong function ở public boundary.

Được phép:

```js
function translationApi() {
  return require("../Translation/TranslationApi");
}
```

Không được import sâu vào file nội bộ để tránh circular require.

### 6. Không copy business rule để né boundary

Không copy helper hoặc logic nghiệp vụ sang module khác chỉ để tránh import.

Quyết định đúng:

- Business rule thuộc domain nào thì domain đó expose qua `<Domain>Api.js`.
- Pure utility không thuộc domain nào thì đưa vào `src/shared`.
- Technical infrastructure dùng chung thì đưa vào `src/infrastructure`.

## Luật Riêng Cho Translation Và AI

Translation là business task, AI là technical capability có thể phục vụ nhiều task.

Trong module Translation:

- Không dùng class nội bộ tên `DeepSeekTranslationProvider`, `CodexExecTranslationProvider`, `OpenAiTranslationProvider`.
- Không dùng `providerFor` cho factory nghiệp vụ mới.
- Không tự gọi `fetch`, `child_process`, `spawn`, hoặc `spawnSync`.
- Không tự biết URL, auth header, timeout, request/response protocol của AI cloud.
- Chỉ dùng adapter trung tính như `TranslationAdapter`, `ProcessTranslationAdapter`, và factory `translationAdapterFor`.

Trong `src/infrastructure/ai`:

- Được phép gọi external AI/cloud/process.
- Chứa `OpenAiCompatibleChatClient`, `AnthropicCompatibleMessagesClient`, `CodexExecClient`, `codexCliAdapter`.
- Không chứa prompt nghiệp vụ Translation, review state, parse business draft, hoặc audit logic.

Config canonical cho Translation:

```text
translation_ai_provider
translation_ai_transport
translation_ai_model
```

Không dùng config global `ai_provider` cho project vì AI sau này có nhiều task khác ngoài translation.

## Checklist Trước Khi Sửa Module

Trước khi code task có đụng `src/modules`, Codex phải:

1. Đọc file này.
2. Xác định module nào sở hữu business state/use case.
3. Kiểm tra public API hiện có của module sở hữu.
4. Nếu thiếu capability, thêm method vào `<Domain>Api.js` thay vì import sâu.
5. Chỉ đưa code vào `src/shared` nếu nó là pure utility không thuộc domain nào.
6. Chỉ đưa code vào `src/infrastructure` nếu nó là technical infrastructure dùng chung hoặc external I/O client.

## Checklist Sau Khi Sửa Module

Chạy audit boundary:

```powershell
rg -n 'require\("\.\./\.\./[A-Za-z]+/(application|infrastructure|support)|require\("\.\./\.\./\.\./modules/[A-Za-z]+/(application|infrastructure|support)' src\modules -g '*.js'
```

Kết quả phải rỗng. Nếu có kết quả, phải sửa trước khi kết luận task xong.

Nếu sửa Translation/AI, chạy thêm:

```powershell
rg -n "fetch\(|child_process|spawn\(|spawnSync\(" src\modules\Translation -g "*.js"
rg -n "TranslationProvider|DeepSeekTranslation|CodexExecTranslation|providerFor" src\modules\Translation src\infrastructure\ai -g "*.js"
```

Hai lệnh trên cũng phải rỗng.

Sau đó chạy verify phù hợp:

```text
npm run verify:phaseXX
```

Nếu thay đổi ảnh hưởng nhiều module hoặc boundary chung, chạy:

```text
npm test
```

## Cách Xử Lý Khi Phát Hiện Vi Phạm

Nếu phát hiện module đang gọi sâu vào module khác:

1. Không mở rộng thêm trên vi phạm đó.
2. Tạo hoặc dùng public method trong module sở hữu.
3. Di chuyển orchestration về đúng module sở hữu business action.
4. Nếu route public chưa đổi được, giữ route cũ nhưng biến implementation thành wrapper qua public API đúng.
5. Cập nhật docs nếu hành vi hoặc ownership thay đổi.

Không được coi task hoàn thành khi còn import vi phạm boundary.
