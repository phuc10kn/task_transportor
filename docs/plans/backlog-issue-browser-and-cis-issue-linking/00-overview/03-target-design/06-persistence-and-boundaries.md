# 7. Persistence và module boundaries

> [← Thiết kế mục tiêu](./README.md) · [Overview](../README.md) · [Plan index](../../README.md)

Persistence:

- Không thêm table hoặc migration mặc định. Schema hiện có đã có nullable identity columns, source_system = manual, revision source manual, unique(project_id, backlog_issue_key), unique(project_id, jira_issue_key) và lookup index.
- Tất cả write mới persist canonical key trả bởi provider, chuẩn hóa uppercase tại CIS owner boundary; remote id chỉ nằm trong response/audit. CIS repository dùng compare case-insensitive cho lookup/dedup để nhận diện cả legacy key khác casing. Duplicate predicate luôn là `(project_id, backlog_issue_key)` hoặc `(project_id, jira_issue_key)` riêng biệt; unique schema hiện có là race guard cho key mới đã chuẩn hóa.
- BIS-00 chỉ rà logical collision legacy theo UPPER(key). Hệ thống không tự merge, rewrite hoặc xóa data cũ; một key collision cũ block thao tác link/candidate-sync trên chính key đó và được báo operator xử lý. Browse vẫn loại key khỏi candidate vì rõ ràng đã có CIS nhưng không chọn một owner issue tùy ý.
- CIS repository thêm batch identity lookup, find Jira-key lookup, normalized owner write và transaction owner action cho create/link. Mọi lookup/dedupe/write identity **mới** phải đi qua CisApi; Jira vẫn được giữ read model issue/revision/comment/attachment/translation/project/job đã allowlist trong MB-003 cho dry-run/outbound, plan này không refactor hoặc mở rộng allowlist đó.
- Sync expose `hasActiveIssueJobInTransaction`, `enqueueIssueJobIfNoneActiveInTransaction` và `writeJournalInTransaction` qua SyncApi; các capability dùng SQLite connection/transaction do CIS owner action truyền vào và không mở connection mới. SQL job/journal vẫn thuộc Sync repository, không module nào import sâu SyncJobRepository/SyncJournalRepository.
- Các write-race-sensitive flow trong plan (`upsertBacklogIssue`, identity link, Jira draft CAS và owner action cần atomic audit) dùng BEGIN IMMEDIATE. Chỉ retry toàn transaction tối đa 3 lần cho `SQLITE_BUSY`, `SQLITE_BUSY_SNAPSHOT` hoặc `SQLITE_LOCKED`; hết lượt trả stable `DATABASE_BUSY` 503. Unique constraint được phân loại theo đúng index/field business; không coi mọi constraint/busy là duplicate và không leak raw SQLite error.

Ownership:

| Thành phần | Được làm | Không được làm |
| --- | --- | --- |
| Backlog | Query Backlog candidates, normalize source payload, candidate sync orchestration, public remote identity lookup. | Ghi trực tiếp tables CIS hoặc gọi Jira outbound. |
| Cis | Tạo manual issue, revision, batch duplicate read, external identity write, uniqueness decision, lazy public remote lookup orchestration và atomic audit request. | Top-level require ngược gây CommonJS cycle, gọi deep Backlog/Jira infrastructure hoặc mang HTTP transport detail external. |
| Jira | Public remote identity lookup và outbound dry-run/sync có hash/CAS/immutable-link guard. | Ghi canonical issue state trực tiếp, fallback create khi linked key mất hoặc biến lookup thành Jira -> CIS ingest. |
| Sync | Enqueue/run/retry, active-job lookup, handler result propagation và transaction-bound journal capability. | Sở hữu business policy identity/canonical state. |
| HTTP controller | Parse/return envelope và inject auth/correlation. | Chứa pagination, remote verification hoặc transaction business flow. |
| Admin UI | Form, loading, render result và feedback. | Quyết định duplicate/project routing/persistence. |
