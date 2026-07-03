# Lý thuyết Modular Monolith của dự án

## Tuyên bố kiến trúc

`task_transportor` không phải là một bộ script sync Backlog sang Jira. Nó là **Central Sync Hub** có CIS làm trung tâm vận hành:

```text
System -> CIS -> System
```

Mọi system ngoài như Backlog/Jira chỉ là nguồn hoặc đích của dữ liệu. CIS giữ:

- issue và canonical fields;
- revision/content history;
- comment và attachment metadata;
- translation queue/review;
- mapping rules;
- anomaly log;
- sync jobs;
- sync journal/audit.

Modular monolith của dự án là cách tổ chức một ứng dụng duy nhất thành nhiều domain module có ownership rõ, để vẫn vận hành đơn giản trong Lite nhưng không biến code thành một khối controller/service/repository gọi chéo nhau.

## Vì sao không microservices ngay

Lite hiện tại có một team/process nhỏ, một Node.js service, một SQLite database và nhiều flow cần transaction/audit nội bộ. Tách service sớm sẽ tạo chi phí network, deploy, observability và data consistency trước khi có nhu cầu thật.

Vì vậy modular monolith là lựa chọn chính:

- Một deployable duy nhất.
- Module chia theo domain nghiệp vụ.
- Code có boundary rõ để sau này có thể tách module nếu cần.
- Database ban đầu là application database, không phải integration database giữa nhiều app độc lập.

Microservices chỉ hợp lý khi có nhu cầu deploy/scale/ownership độc lập thật. Ở Lite và phần lớn Medium, chi phí tách service lớn hơn lợi ích:

- Mỗi call giữa service cần network, retry, timeout, auth, tracing.
- Transaction xuyên service phức tạp hơn transaction trong SQLite.
- Debug sync/audit khó hơn nếu state phân tán quá sớm.
- Team vẫn cần chỉnh nhanh module/domain trong một codebase.

Vì vậy hướng đúng là **modular trước, distributed sau nếu có trigger**.

## Vì sao không layered monolith thuần

Layered monolith dễ trượt thành controller/service/repository gọi chéo nhau. Với Central Sync Hub, lỗi ownership rất nguy hiểm:

- Jira tự ghi state CIS làm audit sai.
- Translation tự biết cách update canonical issue.
- Controller gọi thẳng module khác làm mờ route ownership.
- Helper nghiệp vụ bị copy sang nhiều nơi để né dependency.

Dự án cần module boundary thật, không chỉ chia folder.

Layered monolith thường chia theo kỹ thuật:

```text
controllers/
services/
repositories/
clients/
```

Kiểu này đơn giản lúc đầu, nhưng khi domain tăng lên, mọi service dễ gọi mọi repository. Với `task_transportor`, điều đó làm mờ các câu hỏi quan trọng:

- Ai sở hữu `issues.sync_status`?
- Ai được ghi `translation_queue.review_status`?
- Jira module có được tự `UPDATE issues` không?
- Translation có được tự biết cách apply vào canonical issue không?
- Dashboard được đọc chéo bảng tới mức nào?

Modular monolith trả lời bằng ownership domain:

```text
Cis owns issues/canonical state.
Translation owns translation lifecycle.
Sync owns jobs/journal execution state.
Jira owns Jira adapter/payload/outbound orchestration.
Mapping owns mapping rules.
Anomaly owns anomaly lifecycle.
```

## Vì sao chọn Pragmatic Hybrid

Strict modular monolith thường yêu cầu mọi module chỉ đọc dữ liệu của module khác qua API hoặc event/read model. Điều này đúng khi module chuẩn bị tách service, database tách schema, hoặc team deploy độc lập.

Với Lite, strict 100% cho mọi `SELECT` chéo bảng chưa phù hợp:

- SQLite là một application database trong cùng một process.
- Dashboard, dry-run Jira và sync snapshot cần read bundle nhanh, nhất quán.
- Ép mọi read qua API có thể tạo nhiều DTO tạm, nhiều round-trip nội bộ và duplicate mapping.
- Chưa có trigger extract service.

Do đó dự án chọn **Modular Monolith Pragmatic Hybrid (MM-PH)**:

```text
Strict:
  import boundary
  controller boundary
  public API ownership
  write ownership

Pragmatic:
  một số read SQL chéo bảng được allowlist theo tier
  reporting/sync snapshot được giữ khi có lợi ích rõ
```

## Tranh luận với các mô hình khác

| Mô hình | Điểm mạnh | Vì sao không dùng nguyên xi |
| --- | --- | --- |
| Strict modular monolith | Dễ tách service, module rất độc lập | Quá tốn cho Lite nếu mọi read đều phải qua API/read model |
| Microservices | Deploy/scale/team ownership độc lập | Chưa có nhu cầu, tăng độ phức tạp transaction/audit |
| Layered monolith | Dễ bắt đầu, ít ceremony | Dễ thành service/repository gọi chéo, mờ domain ownership |
| Shared database giữa nhiều service | ACID và query dễ | Không phù hợp nếu service độc lập; dự án hiện là một application database trong một app |
| Transaction script | Nhanh cho workflow CRUD/report | Dễ trộn business rule giữa các module |
| Reporting read model | Tốt cho dashboard/query tổng hợp | Chỉ áp dụng cho Dashboard/Tier 2, không dùng để justify write chéo |

MM-PH chọn phần phù hợp:

- strict ở import/API/write vì đó là nơi gây bug nghiệp vụ nặng;
- linh hoạt ở read-only snapshot/reporting vì Lite có một SQLite và một process;
- có allowlist để direct SQL không trượt thành database-driven architecture.

## Các lớp boundary của modular monolith

Một module không chỉ là folder. Boundary gồm nhiều lớp:

| Lớp | Ý nghĩa |
| --- | --- |
| Import boundary | Module khác không import sâu `application/infrastructure/support` |
| Controller boundary | Route/controller gọi module chủ quản route |
| Public API ownership | `<Domain>Api` chỉ expose capability domain đó sở hữu |
| Data write ownership | Chỉ owner ghi state business của bảng/aggregate |
| Data read governance | Read chéo phải thuộc tier/allowlist |
| Transaction boundary | Job/use case phải có commit/rollback/journal rõ |
| Error boundary | Adapter trả lỗi cấu trúc; use case quyết định retry/fail |

Nếu chỉ có import boundary mà không có write ownership, module vẫn có thể phá state của nhau qua SQLite. Nếu chỉ có write ownership mà controller gọi lung tung, route ownership vẫn mơ hồ. Vì vậy dự án cần đủ các lớp.

## CIS là lõi, không phải "DB chung để tiện query"

`CIS` vừa là module, vừa là khái niệm trung tâm sản phẩm:

- Module `Cis` sở hữu issue/canonical state.
- Toàn hệ thống đi theo model `System -> CIS -> System`.
- SQLite lưu dữ liệu của nhiều module, nhưng không có nghĩa là mọi module đều sở hữu mọi bảng.

Điểm dễ nhầm:

```text
SQLite shared file != shared ownership
CIS product core != Cis module được phép làm facade cho mọi module
```

Ví dụ:

- `Translation` có thể cần context từ issue để dịch, nhưng không sở hữu canonical issue update.
- `Jira` có thể cần issue bundle để build payload, nhưng không được tự ghi `issues.sync_status`.
- `Dashboard` có thể count `sync_jobs` và `translation_queue`, nhưng không được sửa lifecycle của chúng.

## Public API không phải service facade tổng

`<Domain>Api.js` là boundary của domain owner, không phải nơi gom tất cả use case của app.

Đúng:

```text
TranslationApi.requestIssueTranslations()
CisApi.applyReviewedIssueTranslation()
SyncApi.enqueueJob()
JiraApi.runDryRun()
```

Sai nếu biến thành pattern mới:

```text
CisApi.requestIssueTranslations() -> TranslationApi.requestIssueTranslations()
BacklogApi.retrySyncJob() -> SyncApi.retryJob()
```

Ngoại lệ chỉ dành cho compatibility route cũ, có TODO rõ và không thêm business logic.

## Transaction và audit là một phần của boundary

Với Central Sync Hub, boundary không chỉ là "ai gọi ai" mà còn là "state đổi ở đâu và được audit ra sao".

Mỗi job quan trọng nên có khung:

```text
lock job
load state cần thiết
run use case
write owner state qua owner module
write sync_journal/audit
commit
```

Nếu gọi external API:

- adapter chỉ gọi external và trả lỗi có cấu trúc;
- use case/worker quyết định retry/backoff/fail;
- state update sau external call phải nhất quán;
- mỗi attempt ghi journal.

Điều này giải thích vì sao controller không được gọi external API rồi tự update DB: nó bỏ qua job/journal/transaction boundary.

## Không được hiểu sai Pragmatic Hybrid

MM-PH không có nghĩa là:

- Module nào cũng được query mọi bảng.
- Module nào cũng được update state của module khác.
- Public API được biến thành proxy tổng hợp cho domain khác.
- `src/shared` được dùng để chứa business logic chung chung.
- Shared SQLite là lý do để bỏ qua audit/journal.

Quy tắc cốt lõi: **write và business ownership phải rõ; read exception phải có tier, allowlist và lý do.**

## Nguyên tắc thiết kế rút ra cho dự án

1. **System -> CIS -> System** là trục sản phẩm. Không tạo đường tắt Backlog -> Jira.
2. **External adapters không sở hữu business state.** Backlog/Jira/AI client không tự quyết định state CIS.
3. **Inbound không làm việc nặng trong webhook.** Webhook verify, lưu raw event, enqueue job và return nhanh.
4. **Manual pull/webhook/scheduled pull cùng source phải dùng chung normalizer.**
5. **Outbound thật phải có dry-run/pre-check khi có rủi ro ghi sang hệ ngoài.**
6. **Mapping đi qua CIS canonical**, không quay lại mapping trực tiếp Backlog -> Jira.
7. **AI propose/draft/analyze, human hoặc policy quyết định.**
8. **Mọi action quan trọng có journal/audit/correlation id.**
9. **Lite được cắt scope, không được cắt nền móng** như schema/state/job/journal đủ cho Medium kế thừa.

## Khi nào nâng cấp strict hơn

Chuyển dần sang strict data isolation khi có một trong các trigger:

| Trigger | Hành động |
| --- | --- |
| Một module được extract thành service/process riêng | Tách schema/DB; consumer dùng API/event |
| Schema migration gây lỗi coupling chéo từ 2 lần/quý trở lên | Thay direct SQL bằng owner read API hoặc read model |
| Có nhiều squad deploy độc lập theo domain | Database-per-module hoặc schema/role riêng |
| Cần test module cô lập khỏi SQLite shared | Mock qua public API |
| Dashboard/reporting phức tạp | Dùng projection/warehouse, không query raw tables trực tiếp |
