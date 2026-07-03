# Rà soát và phương án sửa module boundary

## Mục tiêu

Tài liệu này ghi lại kết quả rà soát vi phạm boundary trong modular monolith hiện tại và đề xuất hướng khắc phục theo từng module.

Phạm vi rà soát:

- Chỉ xét code trong `src/modules`.
- Không xét thư mục legacy `backlog2jira`.
- Không sửa code trong tài liệu này.

Tiêu chí áp dụng theo `docs/work/plans/architecture/02-module-structure.md` và `docs/work/plans/architecture/04-boundaries.md`:

- Controller chỉ gọi `<Domain>Api` của chính module đó.
- Module khác chỉ gọi public boundary `<OtherDomain>Api`.
- Không import trực tiếp `modules/<OtherDomain>/application/*`.
- Không import trực tiếp `modules/<OtherDomain>/infrastructure/*`.
- Không import trực tiếp `modules/<OtherDomain>/support/*` nếu helper đó đang thuộc nội bộ domain khác.
- `support/` chỉ dành cho helper thuần nội bộ module, không chứa business orchestration.

## Trạng thái sau khi sửa

Đã sửa các vi phạm boundary được liệt kê trong tài liệu này.

Kết quả audit sau fix:

```text
violating_modules=0
violating_imports=0
```

Lệnh kiểm chứng đã chạy:

```text
npm test
npm run verify:issue-editor
```

Tất cả đều pass.

Ghi chú cập nhật AI translation:

- Module `Translation` không còn dùng class nội bộ tên `DeepSeekTranslationProvider`/`CodexExecTranslationProvider`.
- Module chỉ dùng `TranslationAdapter` hoặc `ProcessTranslationAdapter` để tạo draft dịch.
- Phần gọi ra ngoài nằm trong `src/infrastructure/ai`: `OpenAiCompatibleChatClient`, `AnthropicCompatibleMessagesClient`, `CodexExecClient`, và adapter command `codexCliAdapter.js`.
- Project config mới dùng `translation_ai_provider`, `translation_ai_transport`, `translation_ai_model`; các field `translation_provider`/`translation_model` chỉ còn là mirror tương thích trong giai đoạn migration.

## Kết quả rà soát ban đầu

Trước khi sửa có **5 module vi phạm boundary**, với **17 import vi phạm**.

| Module vi phạm | Số import vi phạm | Nhận định |
| --- | ---: | --- |
| `Translation` | 5 | Vi phạm nặng, phụ thuộc trực tiếp vào internals của `Cis`. |
| `Cis` | 4 | Vi phạm nặng, phụ thuộc trực tiếp vào internals của `Translation` và repository của `Projects`. |
| `Jira` | 4 | Vi phạm vừa, dùng helper nội bộ của `Cis` và `Sync`. |
| `Backlog` | 2 | Vi phạm nhẹ-vừa, controller gọi module khác và support dùng config nội bộ của `Projects`. |
| `Projects` | 2 | Vi phạm vừa, application gọi thẳng infrastructure adapter của `Backlog` và `Jira`. |

Rủi ro lớn nhất là coupling hai chiều giữa `Cis` và `Translation`:

```text
Cis -> Translation/application, Translation/infrastructure
Translation -> Cis/application, Cis/infrastructure
```

Vòng phụ thuộc này làm mờ ownership:

- `Cis` đang biết cách dịch và biết repository nội bộ của `Translation`.
- `Translation` đang biết cách lấy issue, build canonical snapshot và update canonical issue của `Cis`.
- API translate thực tế nằm trong route của `Cis`, trong khi logic provider/review nằm trong `Translation`.

## Danh sách vi phạm chi tiết

### `Translation`

| File | Import vi phạm | Loại |
| --- | --- | --- |
| `src/modules/Translation/application/applyIssueTranslationToCanonical.js` | `../../Cis/infrastructure/CisRepository` | Import infrastructure module khác |
| `src/modules/Translation/application/applyIssueTranslationToCanonical.js` | `../../Cis/application/getIssueEditor` | Import application module khác |
| `src/modules/Translation/application/applyIssueTranslationToCanonical.js` | `../../Cis/application/updateCanonicalIssue` | Import application module khác |
| `src/modules/Translation/application/translateQueueItemNow.js` | `../../Cis/infrastructure/CisRepository` | Import infrastructure module khác |
| `src/modules/Translation/infrastructure/TranslationContextRepository.js` | `../../Projects/infrastructure/ProjectRepository` | Import infrastructure module khác |

### `Cis`

| File | Import vi phạm | Loại |
| --- | --- | --- |
| `src/modules/Cis/application/getIssueEditor.js` | `../../Projects/infrastructure/ProjectRepository` | Import infrastructure module khác |
| `src/modules/Cis/application/requestIssueTranslations.js` | `../../Translation/application/translateQueueItemNow` | Import application module khác |
| `src/modules/Cis/application/translateIssueTranslationNow.js` | `../../Translation/application/translateQueueItemNow` | Import application module khác |
| `src/modules/Cis/application/translateIssueTranslationNow.js` | `../../Translation/infrastructure/TranslationRepository` | Import infrastructure module khác |

### `Jira`

| File | Import vi phạm | Loại |
| --- | --- | --- |
| `src/modules/Jira/application/runJiraDryRun.js` | `../../Cis/support/canonicalIssueFields` | Import support module khác |
| `src/modules/Jira/application/runJiraDryRun.js` | `../../Cis/support/hashCanonicalIssue` | Import support module khác |
| `src/modules/Jira/application/runJiraDryRun.js` | `../../Cis/support/resolveCanonicalField` | Import support module khác |
| `src/modules/Jira/infrastructure/JiraSyncRepository.js` | `../../Sync/support/json` | Import support module khác |

### `Backlog`

| File | Import vi phạm | Loại |
| --- | --- | --- |
| `src/modules/Backlog/http/controllers/BacklogPullController.js` | `../../../Sync/SyncApi` | Controller gọi module khác trực tiếp |
| `src/modules/Backlog/support/parseScheduledPullFilter.js` | `../../Projects/support/defaultProjectConfig` | Import support module khác |

### `Projects`

| File | Import vi phạm | Loại |
| --- | --- | --- |
| `src/modules/Projects/application/syncCisMappingValuesFromTarget.js` | `../../Backlog/infrastructure/BacklogClient` | Import infrastructure module khác |
| `src/modules/Projects/application/syncCisMappingValuesFromTarget.js` | `../../Jira/infrastructure/JiraClient` | Import infrastructure module khác |

## Nguyên tắc sửa

Ưu tiên sửa theo thứ tự:

1. Cắt vòng phụ thuộc `Cis <-> Translation`.
2. Đưa shared pure helper thật sự chung sang `src/shared` nếu không còn business ownership cụ thể.
3. Expose use case cần thiết qua `<Domain>Api`, không import application/infrastructure trực tiếp.
4. Controller chỉ gọi API của module chủ quản.
5. Giữ endpoint public hiện tại để không phá Admin UI, nhưng chuyển implementation vào đúng module boundary.

Không nên sửa bằng cách copy-paste helper sang nhiều module. Nếu helper là business rule của một domain, expose qua API của domain đó. Nếu helper là pure utility không thuộc domain nào, chuyển sang `src/shared`.

## Phương án khắc phục theo module

### 1. `Translation`

#### Vấn đề

`Translation` đang tự đọc dữ liệu CIS và tự apply bản dịch vào canonical issue bằng cách gọi trực tiếp repository/use case nội bộ của `Cis`.

Điều này làm `Translation` vừa sở hữu queue/provider/review, vừa biết cách cập nhật canonical issue. Boundary bị lẫn.

#### Phương án sửa

Tách rõ ownership:

- `Translation` sở hữu:
  - `translation_queue`.
  - AI provider adapter.
  - build standardized translation input.
  - tạo `ai_draft`.
  - approve/reject/manual edit state của queue.
  - audit cho action translation.
- `Cis` sở hữu:
  - issue/revision/fields_json.
  - canonical effective values.
  - apply text đã review vào `fields_json.<field>.cis`.
  - issue sync status khi canonical thay đổi.

Thay các import trực tiếp từ `Translation` sang `Cis` bằng một trong hai hướng:

1. `TranslationApi` gọi `CisApi` public method khi cần dữ liệu CIS.
2. Hoặc `Cis` truyền đủ snapshot/context vào `TranslationApi`, để `Translation` không tự đọc repository của `Cis`.

Khuyến nghị:

- Thêm public methods vào `CisApi`:
  - `getIssueTranslationContext({ issueId, queueId })`
  - `applyReviewedIssueTranslation({ queueId, reviewedText, executedBy, correlationId })`
  - `getIssueForTranslation({ issueId })` nếu cần tối giản hơn.
- `Translation` không import `CisRepository`, `getIssueEditor`, `updateCanonicalIssue`.
- `applyIssueTranslationToCanonical.js` nên bị xoá hoặc đổi thành adapter mỏng gọi `CisApi.applyReviewedIssueTranslation`.

#### Kết quả mong muốn

```text
Translation -> CisApi
Translation -X-> Cis/application
Translation -X-> Cis/infrastructure
```

### 2. `Cis`

#### Vấn đề

`Cis` đang điều phối translate trực tiếp bằng cách import application và repository của `Translation`.

Các endpoint:

```text
POST /api/v1/issues/:issueId/translations/translate
POST /api/v1/issues/:issueId/translations/:queueId/translate
```

đang nằm ở route của `Cis`, nhưng business action dịch thuộc `Translation`.

#### Phương án sửa

Giữ endpoint hiện tại để không phá UI, nhưng controller/use case `Cis` phải gọi `TranslationApi`, không gọi file nội bộ của `Translation`.

Các bước:

1. Thêm public methods vào `TranslationApi`:
   - `requestIssueTranslations({ config, issueId, executedBy, correlationId })`
   - `translateIssueQueueItemNow({ config, issueId, queueId, executedBy, correlationId })`
2. Di chuyển orchestration từ:
   - `src/modules/Cis/application/requestIssueTranslations.js`
   - `src/modules/Cis/application/translateIssueTranslationNow.js`
   sang module `Translation/application`.
3. `CisApi` nếu vẫn cần giữ method cùng tên cho route hiện tại thì chỉ làm wrapper gọi `TranslationApi`.
4. `Translation` muốn đọc source Backlog hiện tại phải đi qua `CisApi`, hoặc nhận source targets do `Cis` cung cấp.
5. `Cis/application/getIssueEditor.js` không import `Projects/infrastructure/ProjectRepository`; thay bằng `ProjectsApi.getProject`.

#### Kết quả mong muốn

```text
Cis -> TranslationApi
Cis -> ProjectsApi
Cis -X-> Translation/application
Cis -X-> Translation/infrastructure
Cis -X-> Projects/infrastructure
```

Về lâu dài, nên cân nhắc thêm route thuộc module `Translation`:

```text
POST /api/v1/translations/issues/:issueId/translate
POST /api/v1/translations/issues/:issueId/items/:queueId/translate
```

Sau đó route cũ trong `Cis` có thể giữ làm compatibility alias.

### 3. `Jira`

#### Vấn đề

`Jira` đang dùng helper nội bộ của `Cis/support` để build dry-run payload và hash canonical issue. Các helper này thực tế đang là canonical read model/business rule của CIS.

Ngoài ra `JiraSyncRepository` dùng `Sync/support/json`, làm infrastructure của `Jira` phụ thuộc helper nội bộ của `Sync`.

#### Phương án sửa

Tách thành hai nhóm:

1. Canonical issue read model:
   - Nếu các hàm `resolveCanonicalField`, `hashCanonicalIssue`, `canonicalIssueFields` là rule của CIS, expose qua `CisApi`.
   - Ví dụ thêm:
     - `CisApi.getCanonicalIssueSnapshot({ issueId })`
     - `CisApi.hashCanonicalIssue({ issueId })`
     - `CisApi.getCanonicalFieldDefinitions()`
   - `Jira` chỉ nhận snapshot đã chuẩn hoá từ `CisApi`.

2. JSON helper:
   - Nếu `Sync/support/json` chỉ là pure helper parse/serialize JSON, chuyển sang `src/shared/json.js`.
   - Sau đó `Jira` và `Sync` cùng import từ `src/shared/json`.

#### Kết quả mong muốn

```text
Jira -> CisApi
Jira -> src/shared/json
Jira -X-> Cis/support
Jira -X-> Sync/support
```

### 4. `Backlog`

#### Vấn đề

`BacklogPullController` gọi `SyncApi` trực tiếp. Theo rule, controller của `Backlog` chỉ nên gọi `BacklogApi`.

`Backlog/support/parseScheduledPullFilter.js` import default config từ `Projects/support`, trong khi support của module này là nội bộ `Projects`.

#### Phương án sửa

1. Controller:
   - Di chuyển logic cần `SyncApi` vào `Backlog/application` hoặc `BacklogApi`.
   - `BacklogPullController` chỉ gọi `BacklogApi`.

2. Pull filter default:
   - Nếu `DEFAULT_PULL_FILTER` là config chung của project/pull runtime, đưa sang `src/shared/pullDefaults.js` hoặc `src/shared/projectDefaults.js`.
   - Cả `Projects` và `Backlog` import từ shared.
   - Không để `Backlog/support` import `Projects/support`.

#### Kết quả mong muốn

```text
Backlog controller -> BacklogApi
Backlog support -> src/shared/pullDefaults
Backlog -X-> Projects/support
Backlog controller -X-> SyncApi
```

### 5. `Projects`

#### Vấn đề

`Projects/application/syncCisMappingValuesFromTarget.js` gọi trực tiếp `BacklogClient` và `JiraClient` trong infrastructure của module khác.

Điều này làm `Projects` biết chi tiết adapter HTTP của hệ thống ngoài, trong khi `Backlog` và `Jira` mới là owner của client đó.

#### Phương án sửa

Expose public method qua domain API:

- Trong `BacklogApi`:
  - `pullMappingValues({ config, projectId })`
  - hoặc `listBacklogMappingValues({ config, project })`
- Trong `JiraApi`:
  - `pullMappingValues({ config, projectId })`
  - hoặc `listJiraMappingValues({ config, project })`

Sau đó `Projects/application/syncCisMappingValuesFromTarget.js` chỉ gọi:

```js
BacklogApi.pullMappingValues(...)
JiraApi.pullMappingValues(...)
```

Không gọi trực tiếp `BacklogClient`/`JiraClient`.

#### Kết quả mong muốn

```text
Projects -> BacklogApi
Projects -> JiraApi
Projects -X-> Backlog/infrastructure
Projects -X-> Jira/infrastructure
```

## Kế hoạch sửa đề xuất

### Phase A - Cắt vòng `Cis <-> Translation`

Mục tiêu:

- `Cis` không import `Translation/application` hoặc `Translation/infrastructure`.
- `Translation` không import `Cis/application` hoặc `Cis/infrastructure`.
- Endpoint UI hiện tại vẫn chạy.

Việc cần làm:

1. Thêm API public cần thiết vào `CisApi`.
2. Thêm API public orchestration translate vào `TranslationApi`.
3. Di chuyển `requestIssueTranslations` và `translateIssueTranslationNow` sang module `Translation`.
4. Đổi `Cis` wrapper/route sang gọi `TranslationApi`.
5. Đổi apply approved/manual-edit translation sang gọi `CisApi`.
6. Chạy:

```text
npm run verify:issue-editor-api
npm run verify:phase04
npm test
```

### Phase B - Sửa `Jira` dùng CIS canonical qua API

Mục tiêu:

- `Jira` không import `Cis/support`.
- `Jira` không import `Sync/support`.

Việc cần làm:

1. Tạo canonical snapshot/hash public methods trong `CisApi`.
2. Chuyển JSON helper thuần sang `src/shared`.
3. Cập nhật dry-run và sync repository.
4. Chạy:

```text
npm run verify:phase05
npm run verify:phase06
```

### Phase C - Sửa `Projects` gọi external system qua API boundary

Mục tiêu:

- `Projects` không import `Backlog/infrastructure`.
- `Projects` không import `Jira/infrastructure`.

Việc cần làm:

1. Expose mapping-value pull qua `BacklogApi` và `JiraApi`.
2. Đổi `Projects/application/syncCisMappingValuesFromTarget.js` sang gọi API boundary.
3. Chạy:

```text
npm run verify:projects
npm run verify:phase05
```

### Phase D - Sửa `Backlog` controller/support

Mục tiêu:

- Controller `Backlog` chỉ gọi `BacklogApi`.
- Pull filter default không phụ thuộc `Projects/support`.

Việc cần làm:

1. Đưa `DEFAULT_PULL_FILTER` sang `src/shared`.
2. Đổi `Projects` và `Backlog` cùng dùng shared default.
3. Chuyển mọi thao tác sync từ controller vào `BacklogApi`.
4. Chạy:

```text
npm run verify:phase03
npm run verify:phase02
```

## Definition of Done

Hoàn tất cleanup boundary khi:

- Script rà soát không còn import trực tiếp chéo module vào `application`, `infrastructure`, `support`.
- Controller không gọi API module khác trực tiếp.
- Các endpoint public hiện tại vẫn pass test.
- `npm test` pass.
- Docs module boundary được cập nhật nếu có API public mới.
