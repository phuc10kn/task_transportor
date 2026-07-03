# Concepts

File này giải thích các khái niệm nền theo ngôn ngữ của `task_transportor`.

## Modular monolith

Modular monolith là một ứng dụng deploy chung nhưng chia thành các module nghiệp vụ có boundary rõ.

Trong dự án:

```text
One repository
One Node.js service first
One SQLite application database first
Clear internal modules
Explicit module boundaries
```

Module không giao tiếp bằng HTTP nội bộ. Module gọi nhau bằng public API trong cùng process:

```text
src/modules/<Domain>/<Domain>Api.js
```

## Module

Module là một boundary nghiệp vụ, không chỉ là folder.

Một module cần trả lời:

- Nó giải quyết vấn đề gì?
- Nó sở hữu bảng/state nào?
- Nó expose public use case nào?
- Nó dùng adapter nào?
- Nó không được gọi trực tiếp module nào?
- State change nào cần audit/journal?

Ví dụ:

```text
Module: Translation
Owns: translation_queue lifecycle/review
Reads: issue context qua CisApi/allowlist tạm
Writes: translation_queue
Does not own: canonical issue fields, Jira payload, sync_jobs lifecycle
```

## Bounded context

Bounded context là ranh giới nơi một khái niệm có ý nghĩa riêng.

Ví dụ `status` có nhiều nghĩa:

- `issues.sync_status`: lifecycle/sync state trong CIS.
- `fields_json.status.backlog`: business status từ Backlog.
- `fields_json.status.jira`: business status từ Jira.
- `fields_json.status.cis`: canonical business status do CIS vận hành.
- `sync_jobs.status`: trạng thái job.
- `translation_queue.review_status`: trạng thái review bản dịch.

Nếu không có bounded context, code dễ dùng nhầm `status` của domain này để quyết định logic domain khác.

## Aggregate ownership

Aggregate ownership trả lời: module nào được ghi state business?

Ví dụ:

- `Cis` sở hữu issue/canonical state.
- `Translation` sở hữu review lifecycle của translation queue.
- `Sync` sở hữu job/journal execution state.
- `Mapping` sở hữu mapping rules.
- `Anomaly` sở hữu anomaly lifecycle.
- `Projects` sở hữu project config.

Module khác có thể cần đọc dữ liệu, nhưng không tự ý ghi.

## Application database

SQLite Lite là application database: một database phục vụ một application/deployable.

Điều này khác với integration database: nhiều app/service độc lập cùng đọc/ghi chung một DB. Integration database dễ tạo coupling mạnh giữa service độc lập.

Với application database, direct read chéo bảng có thể chấp nhận trong một số read-only path vì:

- cùng codebase;
- cùng transaction manager;
- cùng deploy;
- cùng review/audit process.

Nhưng application database vẫn không xóa ownership. Shared file không có nghĩa là shared write permission.

## Public API

`<Domain>Api.js` là public surface của module.

Nó nên:

- export use case domain sở hữu;
- che giấu `application/` và `infrastructure/`;
- giúp module khác không phụ thuộc file nội bộ;
- ổn định hơn implementation phía trong.

Nó không nên:

- gom use case của module khác;
- chứa business logic lớn;
- trở thành facade toàn app;
- expose repository hoặc SQL detail.

## Owner API

Owner API là public API của module sở hữu state/use case.

Ví dụ Jira cần cập nhật kết quả sync vào issue:

```text
Sai: JiraSyncRepository UPDATE issues
Đúng: Jira application gọi CisApi.saveIssueJiraSyncResult(...)
```

Owner API giúp:

- giữ rule update ở module owner;
- ghi audit đúng chỗ;
- tránh duplicate merge logic;
- chuẩn bị cho việc tách module sau này.

## Read model

Read model là dữ liệu/DTO được thiết kế cho query hoặc view cụ thể.

Trong strict modular monolith, module consumer thường đọc qua owner API/read model thay vì query bảng owner. Trong Lite, dự án chưa bắt buộc tạo read model cho mọi read:

- Dashboard Tier 2 được SELECT/COUNT chéo bảng.
- Jira Tier 3 được đọc bundle để build dry-run/sync snapshot.
- Translation Tier 1 đang có read context tạm thời cần migrate dần sang `CisApi`.

## Canonical value

Canonical value là giá trị vận hành trong CIS.

Với Issue Editor, thứ tự effective:

```text
fields_json.<field>.cis
  -> fields_json.<field>.backlog
  -> fields_json.<field>.jira
  -> revision fallback
```

Backlog/Jira source snapshot không bị manual edit ghi đè. Admin edit hoặc translation approve chỉ ghi vào nhánh `cis`.

## System -> CIS -> System

Đây là nguyên tắc sản phẩm và kiến trúc:

- Backlog/Jira vào CIS qua pull/webhook/normalizer/job.
- CIS xử lý translation/mapping/anomaly/review/audit.
- Outbound từ CIS sang Jira/Backlog sau pre-check/dry-run.

Không tạo đường tắt:

```text
Backlog -> Jira
Controller -> external API -> UPDATE DB
Adapter -> tự đổi issues.sync_status
```

