# Design axioms

File này chốt các tiên đề thiết kế của `custom_modular_monolith`.

Các tiên đề này là nền để suy luận khi tài liệu chi tiết chưa nói rõ một case cụ thể.

## Axiom 1 - System không nói chuyện trực tiếp với System

Mọi luồng đều đi qua CIS:

```text
System -> CIS -> System
```

Backlog không sync trực tiếp sang Jira. Jira không sync trực tiếp về Backlog. Hệ thống mới sau này cũng map vào/ra CIS.

Ý nghĩa:

- Inbound vào CIS trước.
- Processing nằm trong CIS/domain modules.
- Outbound từ CIS sau pre-check.
- Mapping đi qua canonical CIS.
- Audit/journal có thể trace được toàn bộ đường đi.

## Axiom 2 - CIS là operational source of truth, không phải chỉ là cache

CIS giữ đời sống vận hành riêng:

- canonical fields;
- revisions;
- review state;
- mapping state;
- anomaly state;
- sync state;
- job/journal state.

Backlog/Jira source snapshot không bị ghi đè bởi manual edit. Admin edit hoặc translation approve ghi vào nhánh canonical của CIS.

Với issue field:

```text
fields_json.<field>.cis      -- canonical operational value
fields_json.<field>.backlog  -- source snapshot from Backlog
fields_json.<field>.jira     -- source/target snapshot from Jira
```

## Axiom 3 - Shared database không đồng nghĩa shared ownership

Lite dùng một SQLite file, nhưng ownership vẫn thuộc module.

```text
One DB file
Many module-owned aggregates
Strict write ownership
Governed read exceptions
```

Module khác không được ghi bảng owner chỉ vì cùng DB. Nếu cần mutate state, gọi owner API.

## Axiom 4 - Write ownership nghiêm hơn read ownership

Cross-module write có thể phá invariant, audit và state transition. Vì vậy Tier 0 write luôn cấm nếu không qua owner API.

Read-only SQL có thể được allowlist trong Lite nếu:

- phục vụ reporting;
- phục vụ sync snapshot;
- không chứa business mutation;
- không copy rule owner;
- có đường nâng cấp sang owner read API/read model khi cần.

## Axiom 5 - Module API là boundary, không phải service locator

`<Domain>Api.js` đại diện cho capability domain đó sở hữu.

Không dùng module API để gom hộ use case module khác.

Đúng:

```text
TranslationApi.approveQueueItem
CisApi.applyReviewedIssueTranslation
SyncApi.retryJob
JiraApi.runDryRun
```

Sai:

```text
CisApi.requestIssueTranslations -> TranslationApi.requestIssueTranslations
BacklogApi.retryJob -> SyncApi.retryJob
```

Ngoại lệ chỉ dành cho compatibility wrapper có TODO rõ và không chứa business logic.

## Axiom 6 - Controller không orchestration chéo domain

Controller nhận request, validate cơ bản, gọi API của module chủ quản route, rồi trả response.

Controller không:

- gọi repository;
- gọi adapter external trực tiếp;
- gọi nhiều module API để tự compose business flow;
- update DB trực tiếp;
- quyết định retry/job state.

Orchestration nghiệp vụ nằm trong `application` của module owner.

## Axiom 7 - Adapter external không sở hữu business state

Backlog/Jira/AI clients chỉ biết protocol bên ngoài.

Adapter không tự quyết định:

- `issues.sync_status`;
- `translation_queue.review_status`;
- `mapping_rules.approval_status`;
- `anomaly_log.status`;
- `sync_jobs.status`.

Use case/worker mới quyết định state transition và audit.

## Axiom 8 - Job và journal là contract vận hành

Luồng nặng hoặc có side effect external phải có job/journal khi phù hợp.

`sync_jobs` trả lời:

```text
Việc gì đang chờ/chạy/fail/success?
```

`sync_journal` trả lời:

```text
Việc gì đã xảy ra, theo hướng nào, bởi ai, kết quả gì?
```

Không bỏ qua job/journal để làm nhanh trong controller nếu action đó cần retry, audit hoặc side effect external.

## Axiom 9 - Dry-run là boundary an toàn cho outbound

Outbound thật sang Jira/Backlog phải có pre-check. Với issue sync Jira, dry-run là preview và validation boundary.

Nếu dry-run fail hoặc stale:

```text
Không gọi external API thật.
```

Dry-run phải phản ánh cùng dữ liệu mà sync thật sẽ dùng.

## Axiom 10 - Lite được cắt scope, không được cắt nền móng

Lite có thể chưa có:

- webhook bắt buộc;
- Jira inbound đầy đủ;
- CIS -> Backlog;
- attachment outbound;
- AI learning nâng cao;
- role phức tạp.

Nhưng Lite không được bỏ:

- module boundary;
- canonical CIS model;
- job/journal;
- mapping/anomaly pre-check;
- translation review lifecycle;
- schema/state đủ để Medium kế thừa;
- dry-run trước sync thật.

## Axiom 11 - Evolution không được đổi product model

Tách worker, đổi DB, thêm webhook, thêm system mới, hoặc tách service không được đổi model:

```text
System -> CIS -> System
```

Runtime có thể thay đổi. Contract kiến trúc không đổi:

- inbound normalize vào CIS;
- owner module ghi state;
- outbound qua pre-check;
- audit/journal đầy đủ;
- mapping qua CIS canonical.

## Axiom 12 - AI là capability kỹ thuật, Translation là business domain

AI có thể phục vụ nhiều domain sau này. Translation chỉ là một business task dùng AI.

Vì vậy:

- AI transport/protocol nằm trong shared technical infrastructure.
- Prompt, parse business output, review state, audit thuộc Translation.
- Config Translation dùng `translation_ai_*`, không dùng config global kiểu `ai_provider`.

