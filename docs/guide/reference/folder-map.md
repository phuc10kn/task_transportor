# Folder Map

File này là cheat sheet route nhanh: có loại knowledge X thì mở folder nào trước.

File này không định nghĩa structure chuẩn, prefix số, concern hay entity type chi tiết. Khi cần các phần đó, đọc:

```text
docs/guide/reference/folder-structure.md
```

## Route Theo Loại Knowledge

| Knowledge cần ghi/đọc | Mở trước |
| --- | --- |
| App truth của Central Sync Hub | `docs/app/` |
| Scope, behavior, acceptance Lite | `docs/app/02-product/README.md` |
| Business flow, actor, rule | `docs/app/01-business/README.md` |
| Architecture/module/boundary thật của repo | `docs/app/05-architecture/README.md` |
| Technical mechanism, API, config, persistence | `docs/app/06-technical/README.md` |
| Source organization và code-level contract | `docs/app/07-implementation/README.md` |
| Quality gate, verification, release readiness | `docs/app/08-quality/README.md` |
| Runtime operation, backup, recovery, incident | `docs/app/09-operation/README.md` |
| Decision, alternative, superseded decision | `docs/app/10-decisions/README.md` |
| Documentation rule/schema/convention canonical | `docs/meta/` |
| Reusable reasoning foundation | `docs/theories/` |
| Reusable technical taxonomy/template | `docs/app_technical/` |
| Candidate chưa đủ chín | `docs/backlog-theories/` |
| Cách dùng docs system | `docs/guide/` |
| Agent checklist/skill | `docs/AGENT_SKILLS/` |
| Migration/plan/provenance | `docs/plans/` |

## Route Theo Câu Hỏi App

| Câu hỏi | Layer |
| --- | --- |
| App là gì, scope nền là gì? | `docs/app/00-context/` |
| Business cần gì và vận hành thế nào? | `docs/app/01-business/` |
| Product phải cung cấp gì? | `docs/app/02-product/` |
| Người dùng thao tác thế nào? | `docs/app/03-ui/` |
| Meaning/domain rule nội bộ là gì? | `docs/app/04-domain/` |
| System được tổ chức và chia boundary thế nào? | `docs/app/05-architecture/` |
| Mechanism kỹ thuật nào được chọn? | `docs/app/06-technical/` |
| Code hiện thực mechanism đó thế nào? | `docs/app/07-implementation/` |
| Chất lượng được kiểm tra và giữ thế nào? | `docs/app/08-quality/` |
| Runtime/operation/recovery vận hành ra sao? | `docs/app/09-operation/` |
| Vì sao project chọn hướng này? | `docs/app/10-decisions/` |
