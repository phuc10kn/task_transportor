# Cấu trúc module

Chuẩn module của dự án nằm dưới:

```text
src/modules/<Domain>/
```

Mỗi module là một boundary nghiệp vụ. Folder không chỉ để tổ chức file, mà thể hiện ownership: module sở hữu use case, state, adapter và public API của domain đó.

## Cấu trúc chuẩn

```text
src/
  app.js
  server.js
  config/
  db/
  infrastructure/        # technical infrastructure dùng chung
  services/              # cross-cutting services thật sự chung
  shared/                # pure utility không thuộc domain nào
  modules/
    <Domain>/
      <Domain>Api.js     # public module boundary
      application/       # use case nghiệp vụ
      data/              # DTO/data shape
      domain/            # pure domain rule nếu đủ phức tạp
      infrastructure/    # repository/client/adapter riêng module
      support/           # helper thuần nội bộ module
      http/
        controllers/
        requests/
        resources/
```

## Vai trò chính

### `<Domain>Api.js`

Là public boundary của module.

- Module khác chỉ gọi qua file này.
- Controller của module nên gọi API của chính module đó.
- API điều phối use case trong `application/`.
- Không nhét business logic lớn hoặc proxy use case của module khác vào đây.

### `application/`

Chứa business action theo động từ/use case, ví dụ:

- `pullIssue`
- `approveTranslation`
- `runJiraDryRun`
- `syncIssueToJira`
- `resolveAnomaly`

Không tạo folder `Services/` trong module để chứa orchestration.

### `infrastructure/`

Chứa repository, client hoặc adapter riêng module. Đây là private implementation của module.

Module khác không được import trực tiếp:

```text
src/modules/<OtherDomain>/infrastructure/*
```

Nếu adapter kỹ thuật dùng chung nhiều module, đặt ở `src/infrastructure`.

### `support/`

Chứa helper thuần nội bộ module: parser, mapper, composer, calculator, hash/dedupe helper riêng domain.

`support/` không gọi DB, file system hoặc HTTP. Module khác không import `support/` của domain này.

### `src/infrastructure`

Chứa technical infrastructure dùng chung:

- SQLite connection/transaction/migration.
- HTTP base client.
- local storage.
- logging.
- security primitives.
- AI transport/client kỹ thuật.

Không đặt business orchestration vào `src/infrastructure`.

### `src/shared`

Chỉ chứa pure utility không thuộc domain nào. Không đưa business rule vào `shared` để né boundary.

## Domain module Lite

Các module chính của Lite:

| Module | Ownership |
| --- | --- |
| `Auth` | Admin login, JWT, password hash |
| `Projects` | Project config, enable/disable sync, credential env references |
| `Cis` | Issues, revisions, comments, attachments metadata, canonical state |
| `Backlog` | Backlog pull/client/normalizer, Medium thêm webhook adapter |
| `Translation` | Translation queue, AI draft, review/manual edit |
| `Mapping` | Mapping rules, approval, required mapping pre-check |
| `Anomaly` | Anomaly log, resolve/ignore, blocking check |
| `Sync` | Sync jobs, worker, retry, journal |
| `Jira` | Jira payload builder/client/outbound sync, Medium thêm inbound |
| `Dashboard` | Health summary, counts, alerts |

## Nguyên tắc đặt code mới

| Loại code | Đặt ở đâu |
| --- | --- |
| Use case nghiệp vụ của một domain | `src/modules/<Domain>/application` |
| Public capability của domain | `src/modules/<Domain>/<Domain>Api.js` |
| Repository/client riêng domain | `src/modules/<Domain>/infrastructure` |
| Technical adapter dùng nhiều module | `src/infrastructure` |
| Pure utility không thuộc domain | `src/shared` |
| Helper thuần nội bộ domain | `src/modules/<Domain>/support` |

