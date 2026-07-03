# Module Structure

Đây là chuẩn chia module dùng chung cho toàn dự án. Mục tiêu là giữ modular monolith dễ đọc, dễ mở rộng và không biến codebase thành một tập controller/service gọi chéo nhau.

Vì `task_transportor` đang định hướng Node.js CommonJS, cấu trúc chuẩn dùng `src/modules/<Domain>`. Nếu sau này chuyển framework khác, ý nghĩa boundary vẫn giữ nguyên.

## Cấu trúc chuẩn

```text
src/
  app.js
  server.js
  config/
  db/
  infrastructure/        # shared technical infrastructure
  services/              # cross-cutting services dùng chung nhiều module
  shared/                # pure shared utilities
  modules/
    <Domain>/
      <Domain>Api.js     # public module boundary
      application/       # verb-named use cases
      data/              # optional DTO/data shapes
      domain/            # optional pure domain rules
      infrastructure/    # module-specific DB/file/HTTP/provider adapters
      support/           # pure internal helpers
      http/
        controllers/
        requests/
        resources/
```

Ví dụ:

```text
src/modules/Backlog/
  BacklogApi.js
  application/
    pullIssue.js
    pullProjectUpdates.js
    normalizePulledIssue.js
  data/
    BacklogIssueData.js
  infrastructure/
    BacklogClient.js
    BacklogIssueRepository.js
  support/
    backlogDedupeKey.js
    mapBacklogIssueFields.js
  http/
    controllers/
      BacklogPullController.js
    requests/
      PullBacklogIssueRequest.js
    resources/
      BacklogPullJobResource.js
```

## Vai trò từng phần

### `src/infrastructure/`

Chứa **shared technical infrastructure** dùng chung nhiều module.

Ví dụ:

```text
src/infrastructure/
  database/
    sqliteConnection.js
    transaction.js
    migrate.js
  http/
    createHttpClient.js
  storage/
    localStorage.js
  logging/
    logger.js
  security/
    passwordHasher.js
    jwtSigner.js
  ai/
    openAiClient.js
```

Dùng `src/infrastructure/` cho các adapter nền tảng có tính kỹ thuật chung:

- SQLite connection / transaction manager.
- migration runner.
- HTTP client base.
- local file storage adapter base.
- logger adapter.
- credential resolver.
- password/JWT/security primitives.
- OpenAI client wrapper nếu nhiều module dùng chung.

Không đặt business orchestration vào `src/infrastructure/`.

### `<Domain>Api.js`

`<Domain>Api` là public boundary của module.

- Controller của module inject/call `<Domain>Api`.
- Module khác chỉ được gọi `<Domain>Api` nếu module đó đã có API boundary.
- `<Domain>Api` điều phối các use case trong `application/`.
- `<Domain>Api` không nên chứa business logic lớn; nó là mặt tiền ổn định của module.

### `application/`

Chứa main business actions, đặt tên theo động từ/use case.

Ví dụ:

- `pullIssue.js`
- `approveTranslation.js`
- `runJiraDryRun.js`
- `syncIssueToJira.js`
- `resolveAnomaly.js`

Không tạo `Services/` trong module để chứa orchestration. Orchestration nằm ở `application/`.

### `data/`

Chỉ chứa DTO/data shape.

Ví dụ:

- input data.
- normalized payload shape.
- response data nội bộ.

Không đặt business logic hoặc I/O ở `data/`.

### `domain/`

Chứa pure domain rules nếu có.

Ví dụ:

- state transition rule.
- mapping requirement rule.
- anomaly severity decision.
- sync pre-check rule thuần dữ liệu.

Nếu rule chưa đủ phức tạp, có thể chưa cần folder này.

### `modules/<Domain>/infrastructure/`

Sở hữu I/O adapters và persistence collaborators riêng của module.

Ví dụ:

- SQLite repository.
- Backlog/Jira HTTP client.
- Module-specific adapter không tự gọi external system nếu đã có client chung trong `src/infrastructure`.
- disk storage adapter.
- migration/persistence helper riêng module.

`modules/<Domain>/infrastructure/` không nên được module khác import trực tiếp.

Ví dụ:

```text
src/modules/Backlog/infrastructure/
  BacklogClient.js
  BacklogIssueRepository.js

src/modules/Cis/infrastructure/
  IssueRepository.js
  CommentRepository.js

src/modules/Translation/infrastructure/
  TranslationAdapter.js
  ProcessTranslationAdapter.js

src/infrastructure/ai/
  OpenAiCompatibleChatClient.js
  AnthropicCompatibleMessagesClient.js
  CodexExecClient.js
```

### `support/`

Chứa helper thuần nội bộ module.

Ví dụ:

- parser.
- mapper.
- composer.
- calculator.
- hash/dedupe helper riêng module.

Helper trong `support/` không gọi DB, file system hoặc HTTP.

### `http/`

Chứa lớp HTTP của module:

- `controllers/`
- `requests/`
- `resources/`

Controller chỉ nhận request, gọi `<Domain>Api`, rồi trả resource/response. Controller không tự gọi repository, adapter hoặc use case của module khác.

### `src/services/`

Chỉ dành cho cross-cutting services thật sự dùng chung nhiều module.

Ví dụ:

- correlation id.
- logger.
- crypto/hash chung.
- clock/time provider.
- config/credential resolver.

Không đưa orchestration nghiệp vụ vào `src/services/`.

Nếu service chỉ là wrapper kỹ thuật có I/O nền tảng, ưu tiên đặt ở `src/infrastructure/`. Nếu service là capability nghiệp vụ của một domain, đặt trong `modules/<Domain>/application/`.

### `src/shared/`

Chỉ chứa pure utilities và constant dùng chung.

Không đặt business logic vào `shared`.

## Rules

- Controller inject/call `<Domain>Api` only.
- `<Domain>Api` là public module boundary.
- Main business actions nằm trong `application/` và đặt tên theo động từ.
- `src/infrastructure/` sở hữu shared technical infrastructure.
- `modules/<Domain>/infrastructure/` sở hữu I/O adapters và persistence collaborators riêng của module.
- `support/` sở hữu pure helpers như parsers, mappers, composers, calculators.
- `data/` chỉ sở hữu DTO/data shape classes/objects.
- `src/services/` chỉ dành cho cross-cutting services shared across modules.
- Không tạo `Services/` folder mới trong module để orchestration.
- Không để module khác import trực tiếp `application/*` hoặc `infrastructure/*` khi module đã có API boundary.
- Tránh interfaces/bindings cho tới khi có nhu cầu swap/mock thật.

## Đặt shared infrastructure ở đâu?

Rule nhanh:

- Dùng chung nhiều module và có I/O/kỹ thuật nền -> `src/infrastructure/`.
- Riêng một domain/module -> `src/modules/<Domain>/infrastructure/`.
- Pure helper không I/O -> `src/shared/` hoặc `modules/<Domain>/support/`.
- Cross-cutting orchestration thật sự -> `src/services/`, dùng hạn chế.

Ví dụ:

```text
src/infrastructure/database/sqliteConnection.js
src/infrastructure/database/transaction.js
src/infrastructure/http/createHttpClient.js
src/infrastructure/storage/localStorage.js

src/modules/Backlog/infrastructure/BacklogClient.js
src/modules/Jira/infrastructure/JiraClient.js
src/modules/Cis/infrastructure/IssueRepository.js
```

## Mapping với dự án hiện tại

Các domain module dự kiến:

- `Auth`: admin login, JWT, password hash.
- `Projects`: project config, seed import, enable/disable sync.
- `Cis`: issues, revisions, comments, attachments metadata, state helpers.
- `Backlog`: manual/scheduled pull, Backlog API client, Backlog normalizer; Medium thêm webhook adapter.
- `Translation`: AI draft, review và manual-edit action.
- `Mapping`: canonical mapping, approval, required mapping pre-check.
- `Anomaly`: anomaly log, blocking check, resolve/ignore.
- `Sync`: sync jobs, worker loop, retry, dry-run, sync journal.
- `Jira`: Jira payload builder, Jira API client, outbound sync; Medium thêm inbound normalizer.
- `Dashboard`: health summary, alerts.

## Ví dụ module API

```js
// src/modules/Backlog/BacklogApi.js
const pullIssue = require("./application/pullIssue");
const pullProjectUpdates = require("./application/pullProjectUpdates");

module.exports = {
  pullIssue,
  pullProjectUpdates,
};
```

```js
// src/modules/Backlog/http/controllers/BacklogPullController.js
const BacklogApi = require("../../BacklogApi");

async function pullIssue(req, res, next) {
  try {
    const result = await BacklogApi.pullIssue({
      projectId: req.params.projectId,
      backlogIssueKey: req.params.backlogIssueKey,
      executedBy: req.user.id,
    });

    res.status(202).json({ data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = { pullIssue };
```

Controller không import `application/pullIssue` trực tiếp. Nếu sau này module đổi implementation bên trong, API boundary vẫn ổn định.
