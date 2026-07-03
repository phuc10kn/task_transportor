# Data ownership và read allowlist

SQLite Lite là application database chung cho một deployable. Điều này không làm mất ownership bảng.

Quy tắc chính:

```text
Module owner được ghi state business của bảng mình sở hữu.
Module khác muốn ghi phải gọi public API của owner.
Read chéo bảng chỉ được giữ khi thuộc tier/allowlist rõ.
```

## Ownership bảng baseline Lite

| Bảng / aggregate | Module owner write | Read được chấp nhận |
| --- | --- | --- |
| `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs` | `Cis` | Translation T1/T3, Jira T3, Dashboard T2, Mapping qua API |
| `translation_queue` | `Translation` lifecycle/review; CIS có storage primitive tạm thời | Dashboard T2, Jira T3, CIS editor T4 |
| `sync_jobs`, `sync_journal` | `Sync` | Dashboard T2, Jira T3 read job |
| `anomaly_log` | `Anomaly` | Dashboard T2, Jira/API pre-check qua API |
| `projects` | `Projects` | Module khác qua `ProjectsApi`; Dashboard T2 |
| `mapping_rules` | `Mapping` | Jira dry-run qua `MappingApi` |

## Quy ước riêng cho `translation_queue`

Trong Lite hiện tại, `translation_queue` có ownership hơi đặc biệt:

- Business ownership thuộc `Translation`: review status, AI draft, stale semantics, manual edit.
- CIS còn giữ storage primitive tạm thời như `createTranslationQueueItem`.
- Không mở rộng thêm lifecycle method mới trên `CisApi` cho Translation.
- Hướng dài hạn là chuyển insert primitive sang `TranslationApi.enqueueItem` hoặc Translation infrastructure khi refactor storage.

## Target read allowlist

File được phép có `SELECT` bảng module khác ngoài owner repo:

| File | Tier | Bảng được SELECT | Ghi chú |
| --- | --- | --- | --- |
| `Dashboard/infrastructure/DashboardRepository.js` | T2 | `sync_jobs`, `translation_queue`, `anomaly_log`, `issues`, `projects` | Read-only reporting |
| `Jira/infrastructure/JiraSyncRepository.js` | T3 | `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `translation_queue`, `projects`, `sync_jobs` | Bundle cho sync; write CIS phải qua `CisApi` |
| `Jira/infrastructure/JiraDryRunRepository.js` | T3 | `issues`, `issue_revisions`, `translation_queue`, `issue_comments`, `projects` | Read-only dry-run bundle |
| `Translation/infrastructure/TranslationContextRepository.js` | T1 | `issues`, `issue_revisions`, `issue_comments`, `projects` | TODO migrate sang `CisApi.getIssueTranslationContext` và `ProjectsApi` |
| `Translation/infrastructure/TranslationRepository.js` | T1/T0 legacy | `issues` read, `sync_jobs` delete | Phải sửa: read qua `CisApi`, delete qua `SyncApi` |
| `Cis/infrastructure/CisRepository.js` | Owner | `issues`, `translation_queue`, ... | Owner CIS + storage primitive tạm |

Mọi file không nằm trong bảng mà đọc/ghi bảng foreign phải được sửa hoặc cập nhật allowlist kèm justification.

## Cross-module write

Cross-module write là Tier 0 và mặc định cấm.

Ví dụ cần sửa:

- `Jira` không `UPDATE issues`; phải gọi `CisApi`.
- `Translation` không `DELETE FROM sync_jobs`; phải gọi `SyncApi`.
- Adapter external không tự quyết định `issues.sync_status`.

## Read exception hợp lệ

Read SQL chéo bảng có thể hợp lệ khi:

- Chỉ đọc, không mutate.
- Nằm trong allowlist.
- Có tier và lý do rõ.
- Không copy business rule của owner.
- Có kế hoạch chuyển sang owner API/read model nếu trigger strict xuất hiện.

## Audit gợi ý

```powershell
rg -n 'FROM (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'UPDATE (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'INSERT INTO (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'DELETE FROM (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
```

Kết quả không tự động là lỗi, nhưng phải so với ownership và allowlist.

