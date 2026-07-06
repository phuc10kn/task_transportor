# Phase 03 - TH-CANON

## Mục tiêu

Materialize theory về canonical state, canonical branch, source snapshot và governance của operational truth.

Phase này là nền để:

- `04-domain`
- `05-architecture`
- `06-technical`
- `10-decisions`

không còn phải tự giải thích lại `canonical` theo nhiều cách khác nhau.

## Inputs bắt buộc

- `docs/work/02-central-issue-store.md`
- `docs/architecture/workflows/issue-editor-canonical-edit.md`
- `docs/architecture/workflows/jira-dry-run.md`
- `docs/business/entities/issue.md`
- `docs/business/entities/mapping.md`
- `docs/business/glossary/terms.md`
- `docs/explain/missing_theories.md`

## Làm trong phase này

- Tạo folder:
  - `docs_native_theory_app/theories/canonical-state-governance/`
- Viết 4 file theory chuẩn.
- Map boundary semantics của `TH-CANON` theo root governance:
  - `Owns`
  - `Excludes`
  - `Depends on`
  - `Typical impact areas`
- Chốt các position cấp canonical state, ví dụ:
  - canonical state là operational truth;
  - source snapshot phải tách khỏi canonical branch;
  - reviewed state và workflow state không thay cho canonical state;
  - canonical state phải có owner rõ;
  - projection/read model không được giả làm canonical state.
- Ghi rõ tensions:
  - source fidelity vs operational editability;
  - single source of truth vs multi-view workflows.
- Ghi rõ boundaries:
  - theory không nói `fields_json.*.cis` cụ thể;
  - không nói bảng `issues` cụ thể;
  - không nói editor UI cụ thể.

## Deliverables

- `docs_native_theory_app/theories/canonical-state-governance/README.md`
- `docs_native_theory_app/theories/canonical-state-governance/agent.md`
- `docs_native_theory_app/theories/canonical-state-governance/theory.md`
- `docs_native_theory_app/theories/canonical-state-governance/governance.md`
- Boundary contract của `TH-CANON` đã được encode trong theory group.

## Không làm trong phase này

- Không quyết định chi tiết schema table.
- Không chốt UI issue editor.
- Không nhét dry-run sync gate vào theory này.

## Chốt chặn

Phase này đạt khi:

- từ layer business tới technical đều có một nghĩa ổn định cho `canonical`;
- không còn nhầm canonical state với job state hoặc read model;
- boundary semantics đã được encode rõ theo root governance;
- owner của canonical truth được lý giải ở mức theory, không chỉ mức implementation.

Không qua phase 04 nếu:

- theory còn phụ thuộc quá mạnh vào schema hiện tại;
- còn lẫn canonical state với hub flow;
- boundary semantics chưa được encode rõ theo root governance;
- còn lẫn canonical state với reviewed translation hoặc sync journal.

## Rủi ro chính

- Biến canonical theory thành schema documentation.
- Trộn canonical state với `TH-HUBFLOW`.
- Trộn canonical state với quyết định UI/editor.

## Checklist hoàn thành phase

- [ ] Folder `canonical-state-governance/` đã tồn tại.
- [ ] Có đủ 4 file theory chuẩn.
- [ ] Có định nghĩa rõ canonical state, source snapshot, workflow state, read model.
- [ ] Có tensions và boundaries rõ.
- [ ] Đã encode rõ `Owns / Excludes / Depends on / Typical impact areas`.
- [ ] Có rule rõ về owner của canonical truth.
