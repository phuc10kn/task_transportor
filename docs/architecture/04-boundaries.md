# Boundaries

File này chốt boundary đang áp dụng cho `task_transportor`.

Lý thuyết generic vẫn nằm ở:

- [custom_modular_monolith_theory/boundary_model.md](custom_modular_monolith_theory/boundary_model.md)
- [custom_modular_monolith_theory/data_ownership.md](custom_modular_monolith_theory/data_ownership.md)
- [custom_modular_monolith_theory/implement_rules.md](custom_modular_monolith_theory/implement_rules.md)

## Route và controller ownership

- Controller chỉ gọi API hoặc use case của module chủ quản route.
- Nếu giữ URL cũ vì compatibility, wrapper phải mỏng và không thêm business logic mới.
- Compatibility wrapper phải có comment TODO rõ owner thật của use case.

## Data ownership hiện tại

| Bảng / aggregate | Module owner write | Ghi chú |
| --- | --- | --- |
| `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `issue_worklogs` | `Cis` | Canonical state và snapshot nguồn |
| `translation_queue` | `Translation` | `Cis` còn giữ storage primitive tạm thời, không mở rộng thêm lifecycle ở đó |
| `sync_jobs`, `sync_journal` | `Sync` | Job state và audit trail |
| `anomaly_log` | `Anomaly` | Blocking hoặc health findings |
| `projects` | `Projects` | Project profile, config, env references |
| `mapping_rules` | `Mapping` | Mapping đã review hoặc approved |

## Read allowlist hiện tại

| Consumer | Tier | Được đọc | Mục đích |
| --- | --- | --- | --- |
| `Dashboard` | T2 | `issues`, `projects`, `sync_jobs`, `translation_queue`, `anomaly_log` | Reporting và vận hành |
| `Jira` | T3 | `issues`, `issue_revisions`, `issue_comments`, `issue_attachments`, `translation_queue`, `projects`, `sync_jobs` | Dry-run và outbound snapshot |
| `Translation` | T1 | Context issue/project tối thiểu | Đang hướng về public API owner rõ hơn |

Cross-module write mặc định bị cấm. Nếu module khác cần ghi, phải đi qua API public của owner.

## Quy ước riêng cho Translation và AI

- `Translation` sở hữu review lifecycle của `translation_queue`.
- `Cis` sở hữu canonical issue update.
- `src/modules/Translation` không tự gọi `fetch`, `child_process`, `spawn`, `spawnSync`.
- Prompt, parse output, review state, audit translation thuộc `Translation`.
- URL, auth header, timeout, protocol OpenAI-compatible hoặc process-exec thuộc `src/infrastructure/ai`.

Config canonical của repo cho translation:

- `translation_ai_provider`
- `translation_ai_transport`
- `translation_ai_model`

## Audit commands của repo

Khi sửa module hoặc boundary, dùng các lệnh sau để self-check:

```powershell
rg -n 'require\("\.\./\.\./[A-Za-z]+/(application|infrastructure|support)|require\("\.\./\.\./\.\./modules/[A-Za-z]+/(application|infrastructure|support)' src\modules -g '*.js'
rg -n 'UPDATE (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'INSERT INTO (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n 'DELETE FROM (issues|translation_queue|sync_jobs|sync_journal|anomaly_log|projects|mapping_rules)' src\modules -g '*.js'
rg -n "fetch\(|child_process|spawn\(|spawnSync\(" src\modules\Translation -g "*.js"
rg -n "TranslationProvider|DeepSeekTranslation|CodexExecTranslation|providerFor" src\modules\Translation src\infrastructure\ai -g "*.js"
```

## Nguồn đọc liên quan

- Flow áp dụng thực tế: [05-flow-template.md](05-flow-template.md)
- Kế hoạch cleanup boundary còn lại: [07-boundary-cleanup.md](07-boundary-cleanup.md)
