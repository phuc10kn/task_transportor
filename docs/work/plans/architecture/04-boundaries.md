# Boundaries

## Dependency direction

Hướng phụ thuộc mặc định:

```text
routes/controllers
  -> application use-cases
  -> domain/CIS services
  -> repositories
  -> module infrastructure
  -> shared infrastructure

application use-cases
  -> external adapters
```

Không đi ngược chiều.

## Module roles

Module structure chuẩn được mô tả trong [02-module-structure.md](02-module-structure.md). Các nhóm module khuyến nghị:

- `config`: env, credential reference, runtime config.
- `infrastructure`: shared technical infrastructure như database connection, transaction, HTTP base client, storage, logger.
- `auth`: admin login, JWT, password hash.
- `projects`: project config, sync enable/disable.
- `cis`: issue, revision, comment, attachment metadata, state helpers.
- `backlog`: Backlog API adapter, pull/webhook adapter, normalizer.
- `jira`: Jira API adapter, payload builder, inbound normalizer sau này.
- `translation`: queue, provider adapter, review actions.
- `mapping`: canonical mapping, approval, required mapping check.
- `anomaly`: anomaly log, resolve/ignore, blocking check.
- `sync`: jobs, worker, retry, dry-run, journal.
- `dashboard`: summary, alerts, health counts.

Tên thư mục có thể khác, nhưng boundary nên tương đương.

## Forbidden shortcuts

Không làm:

- Controller import trực tiếp `application/*` hoặc `infrastructure/*` khi module đã có `<Domain>Api`.
- Module import trực tiếp `modules/<OtherDomain>/infrastructure/*`.
- Controller gọi Backlog/Jira/OpenAI trực tiếp rồi tự update database.
- Adapter external tự quyết định `issues.sync_status`.
- Module bỏ qua `sync_jobs` cho việc nặng hoặc ghi external.
- Mapping logic viết rải rác trong nhiều controller.
- Action ghi quan trọng không có journal/audit.
- Lưu secret thật vào database export, journal, log hoặc payload debug.
- Dùng một field `direction` thay cho `direction_from` và `direction_to`.
- Đặt business orchestration vào `src/infrastructure/`, `src/shared/` hoặc module `support/`.

## Transaction boundary

Mỗi job nên có boundary rõ:

```text
lock job
run use-case
write state
write journal
commit
```

External API call có thể được orchestration xử lý linh hoạt, nhưng state update sau call phải nhất quán. Nếu fail thì job phải về `pending` retry hoặc `failed`.

## Error boundary

External adapter nên trả lỗi có cấu trúc:

- `retryable`
- `status_code`
- `error_code`
- `message`
- `details`

Sync/use-case quyết định retry/backoff/fail, không để adapter tự sửa job state.

## Shared infrastructure

`src/infrastructure/` chứa technical adapters dùng chung:

- database connection.
- transaction helper.
- migration runner.
- HTTP client base.
- storage adapter.
- logger.
- security primitives.
- credential resolver.

Shared infrastructure không chứa business use-case. Module-specific repositories/clients vẫn nằm trong `modules/<Domain>/infrastructure/`.

## Shared code

`shared` chỉ chứa utility thật sự chung:

- error classes.
- correlation id.
- date/time.
- hash/dedupe.
- JSON helpers.

Không đặt business logic vào `shared`.
