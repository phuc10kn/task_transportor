# Baseline và source of truth

> [← Overview](./README.md) · [Plan index](../README.md)

## Baseline hiện tại

### UI và route hiện tại

- **public/admin/app.js** có một view Issues thực chất là CIS issue list đã lưu database; nó lọc theo project và mở Issue Editor.
- Navigation chưa phân biệt CIS Issues và Backlog Issues.
- **projectPullPanel** đang nằm trong Project Config. Nút Pull whole project hiện bị render disabled cố định; Pull one issue vẫn gọi inbound flow.
- Issue Editor hiển thị backlog_issue_key và jira_issue_key trong Overview nhưng không cho sửa; canonical PATCH chỉ nhận field canonical.
- Chưa có form tạo CIS issue, candidate list Backlog, filter created-at, fill thêm trang, duplicate preview hoặc UI feedback riêng cho external identity mapping.

### Module, API và persistence hiện tại

- **Cis** sở hữu write path của issues, issue_revisions, issue_comments, issue_attachments và canonical issue state.
- **BacklogClient** đã có getIssue, getProject và listIssues(params); Backlog manual pull đã normalize payload rồi gọi CisApi.upsertBacklogIssue.
- **JiraClient** đã có getIssue nhưng JiraApi chưa expose use case lookup identity cho CIS.
- **CisApi.createIssue** hiện là low-level repository wrapper; nó chưa validate input, tạo revision đầu tiên hay write journal nên không được expose trực tiếp cho Admin.
- Bảng issues đã có backlog_issue_key, jira_issue_key và unique constraint theo project cho từng column. Lookup Jira key, batch lookup Backlog key và case-insensitive integrity chưa là public behavior hoàn chỉnh.
- Backlog project pull hiện query theo updated và enqueue nhiều manual_pull job; nó không đáp ứng browse theo created-at/non-persistent candidate.
- sync_jobs, sync_journal và webhook_events là ba state khác nhau; candidate browse không được dùng bất kỳ bảng nào trong ba bảng này.

### Verification hiện tại

- package.json đã có verify:phase03 cho Backlog ingestion, verify:issue-editor cho Issue Editor API/dry-run, verify:phase06 cho Jira outbound, verify:phase07 cho Admin UI và npm test cho toàn bộ suite.
- scripts/verify/backlog-ingestion.js đã có fixture/flow manual pull nhưng fixture Backlog list hiện chưa mô phỏng filter và offset đủ cho candidate-browser test.
- scripts/verify/issue-editor-api.js và scripts/verify/admin-ui-acceptance.js là baseline phù hợp cho create/manual identity/UI acceptance.

## Source of truth

| Nguồn | Vai trò trong plan |
| --- | --- |
| docs/app/00-context/README.md | Khóa invariant System -> CIS -> System và vai trò Backlog/CIS/Jira trong Lite. |
| docs/app/01-business/README.md | Xác định Admin là operator; manual/project pull là inbound chính. |
| docs/app/02-product/README.md | Source of truth cho Lite scope và behavior; không mở Jira inbound hay direct sync. |
| docs/app/03-interface/README.md | Quy tắc Admin UI và cách trình bày flow không được làm sai product truth. |
| docs/app/04-domain/README.md | Phân biệt source snapshot, canonical CIS data, target preview, job và journal. |
| docs/app/05-architecture/README.md | Source of truth cho cách repo áp dụng custom modular monolith và System -> CIS -> System. |
| docs/app/05-architecture/01-structure/README.md | Module/public surface chuẩn. |
| docs/app/05-architecture/02-boundaries/README.md | CIS owner write và public-API-only cross-module boundary. |
| docs/app/05-architecture/03-interactions/README.md | Routing AF-001 manual pull, AF-002 project pull và AF-005 canonical edit. |
| docs/app/08-quality/README.md | Acceptance Lite và verify gate hiện hành. |
| docs/app/10-decisions/README.md | Decision còn hiệu lực: pull-first, SQLite, Admin UI, dry-run Jira. |
| docs/app/10-decisions/01-decision-making/01-decisions/DEC-002-app-graph-materialization-policy/README.md | Không materialize architecture relation mới khi chưa có trace need, evidence, valid triple và slot. |
| docs/guide/reference/entity-maps/packs/variants/modular-monolith/05-architecture/README.md | Template/taxonomy reusable cho modular monolith. |
| docs/theories/modular-architecture/README.md | Theory nền cho ownership, public surface và cross-module dependency. |
| AGENTS.md | Rule implementation, document UTF-8, phase checklist và distinction webhook_events/sync_jobs/sync_journal. |
| https://developer.nulab.com/docs/backlog/api/2/get-issue-list/ | Contract external cho createdSince, createdUntil, offset, count và sort của Backlog issue list. |
| src/modules/**, src/db/migrations/**, public/admin/**, scripts/verify/** | Evidence kỹ thuật hiện tại; không thay thế product/architecture docs làm source of truth. |
