# Phase BIS-00 - Khóa baseline, contract và persistence preflight

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Mục tiêu, phạm vi và quyết định](../../00-overview/01-goals-scope-and-decisions.md)
- [Baseline và source of truth](../../00-overview/02-baseline-and-sources.md)
- [Thiết kế mục tiêu](../../00-overview/03-target-design/README.md)
- [Persistence và module boundaries](../../00-overview/03-target-design/06-persistence-and-boundaries.md)

Mục tiêu:

- Xác nhận source path, API contract, schema hiện có và data preflight trước khi bắt đầu code.

Target files/artifacts:

- docs/plans/backlog-issue-browser-and-cis-issue-linking/**
- src/db/migrations/002_cis_jobs.sql (verify-only)
- src/modules/Cis/**, src/modules/Backlog/**, src/modules/Jira/** (verify-only)
- public/admin/app.js (verify-only)
- scripts/verify/backlog-ingestion.js, scripts/verify/issue-editor-api.js, scripts/verify/admin-ui-acceptance.js (verify-only)

Điều kiện mở:

- Plan này đã được user/coordinator chấp nhận.
- Chưa có phase implementation BIS nào chạy.

Việc cần làm:

- Đọc lại đầy đủ 11 nguồn bắt buộc trong AGENTS.md trước khi bắt đầu implementation: Context, Business, Product, Quality, Decisions, bốn tài liệu Architecture của app, template modular-monolith và theory modular architecture. Ở **mỗi lượt** có sửa `src/modules`, executor phải đọc lại `docs/app/05-architecture/01-structure/README.md` và `docs/app/05-architecture/02-boundaries/README.md` trước khi code.
- Xác nhận schema hiện có đã có manual source, nullable external identity, revision source manual và unique constraint theo project.
- Chạy preflight query logical collision case-insensitive cho issues.backlog_issue_key và issues.jira_issue_key; chỉ ghi data debt, không tạo migration hoặc tự sửa data.
- Khóa request/response contract, error codes, date semantics, duplicate scope, candidate stop condition và test matrix trong plan.
- Xác nhận không có target file nào dưới backlog2jira.

## Checklist hoàn thành phase

- [ ] Mọi owner/module/API target của BIS-01 đến BIS-04 đã có path cụ thể.
- [ ] Preflight xác nhận schema hiện có đủ cho feature và logical collision legacy được phân loại rõ.
- [ ] Không còn ambiguity về date range, duplicate scope, limit, race behavior và immutability link.
- [ ] Không có scope Medium/Full hoặc direct Backlog -> Jira trong target plan.
- [x] Unit test check (Agent): verify:phase02, verify:phase03, verify:phase06 và verify:phase07 pass trên baseline trước implementation.
- [ ] Manual check (Người review): chỉ tick khi user/coordinator xác nhận contract và preflight evidence đã được review.

Kết quả thực hiện:

Status: Automated pass.

- Baseline phase02/03/06/07 pass trước implementation.
- Schema hiện có đủ; preflight DB thực tế có 0 collision case-insensitive cho cả Backlog/Jira key.
- Không tạo migration và không đụng `backlog2jira`.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
