# Phase BIS-05 - Documentation, full verification và handoff

> [← Phase index](../README.md) · [Overview](../../00-overview/README.md) · [Plan index](../../README.md)

Capability contracts bắt buộc:

- [Mục tiêu, phạm vi và quyết định](../../00-overview/01-goals-scope-and-decisions.md)
- [Thiết kế mục tiêu](../../00-overview/03-target-design/README.md)
- [Risks và acceptance tổng](../../02-coordination/03-risks-and-acceptance.md)

Mục tiêu:

- Đồng bộ docs/app với behavior thật, chạy quality gate và để lại handoff/acceptance có thể audit.

Target files/artifacts:

- docs/app/01-business/README.md
- docs/app/02-product/README.md
- docs/app/03-interface/README.md
- docs/app/04-domain/README.md
- docs/app/05-architecture/03-interactions/interaction-flows/AF-001-backlog-manual-pull/README.md
- docs/app/05-architecture/03-interactions/interaction-flows/AF-002-backlog-project-pull/README.md
- docs/app/05-architecture/03-interactions/interaction-flows/AF-005-canonical-issue-edit/README.md
- docs/app/05-architecture/03-interactions/interaction-flows/AF-006-jira-dry-run/README.md
- docs/app/05-architecture/03-interactions/interaction-flows/AF-007-cis-to-jira-sync/README.md
- docs/app/05-architecture/02-boundaries/module-boundaries/MB-002-public-api-only/README.md
- docs/app/06-technical/README.md
- docs/app/07-implementation/README.md
- docs/app/08-quality/README.md
- docs/app/09-operation/README.md
- package.json
- scripts/verify/**
- docs/plans/backlog-issue-browser-and-cis-issue-linking/**

Điều kiện mở:

- BIS-01 đến BIS-04 pass.
- Behavior/API/schema đã ổn định sau integration test.

Việc cần làm:

- Cập nhật Business, Product, Interface, Domain, Technical, Implementation, Quality và Operation đúng behavior đã ship; không ghi planned behavior chưa tồn tại.
- Cập nhật Operation: per-row candidate Sync yêu cầu background worker enabled; mô tả symptom/action khi worker off và không tuyên bố queued job đã hoàn thành.
- Cập nhật AF-001/AF-002/AF-005/AF-006/AF-007 prose/evidence nếu flow thực tế thay đổi materially; AF-007 phải phản ánh trace-link-before-write và H0/H1/H2 đã ship.
- Cập nhật MB-002 khi implementation evidence xác nhận các public capability mới giữa Backlog/CIS/Jira/Sync; đây là normal public API interaction, không phải ngoại lệ read allowlist của MB-003.
- Chỉ materialize architecture relation mới sau khi đọc DEC-002 và có trace need, evidence, relation type, valid triple, slot và target instance rõ.
- Chạy Type Contract Gate trước/sau chỉ khi sửa/tạo entity type hoặc entity instance trong docs/app.
- Xác nhận `verify:system-issues` đã được tạo từ BIS-01, được mở rộng ở BIS-02/BIS-03 và có trong `npm test`; BIS-05 không dồn việc tạo feature verifier về phase tài liệu.
- Chạy relevant verifies rồi npm test.
- Tick Unit test check (Agent) chỉ sau command pass thật. Giữ Manual check (Người review) unchecked khi user chưa xác nhận.
- Ghi result/handoff canonical vào plan.

## Checklist hoàn thành phase

- [ ] Docs nói đúng non-persistent browse, per-row Sync, manual CIS issue và immutable verified identity.
- [ ] Không có docs nào mô tả direct Backlog -> Jira hoặc Jira inbound mới.
- [ ] Entity contract/architecture trace chỉ chạy khi artifact tương ứng thực sự đổi.
- [x] Unit test check (Agent): verify:phase02, verify:phase03, verify:issue-editor, verify:phase06, verify:phase07, verify:system-issues và npm test pass thật.
- [ ] Manual check (Người review): còn unchecked nếu chưa có xác nhận.

Kết quả thực hiện:

Status: Automated implementation complete; manual acceptance pending.

- `docs/app` Business/Product/Interface/Domain/Architecture/Technical/Implementation/Quality/Operation/Decisions đã đồng bộ behavior thật.
- Type Contract Gate trước/sau pass cho architecture instances đã sửa; relation/frontmatter không đổi.
- `npm test` pass toàn bộ, gồm `verify:system-issues` và docs navigation 187 Markdown files.

---

[← Phase index](../README.md) · [Điều phối và handoff](../../02-coordination/README.md)
