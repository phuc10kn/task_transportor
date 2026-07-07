# Phase 06 reference report

Report này ghi kết quả kiểm tra reference sau Phase 06.

## Legacy references before Phase 07 cutover

Các reference còn lại không phải reading path thường ngày. Tất cả đều là provenance hoặc negative guidance đã được xử lý trước Phase 07 cutover.

| Path | Reference | Reason | Owner phase | Deadline |
| --- | --- | --- | --- | --- |
| `AGENTS.md` | `docs_legacy/work` | Nhắc rõ legacy chỉ còn provenance, không phải source-of-truth thường ngày. | 06 | 07 |
| `docs/all.md` | `docs_legacy` | Migration note về root docs mới. | 06 | 07 |
| `docs/meta/README.md` | `docs_legacy` | Migration note về root docs mới. | 06 | 07 |
| `docs/README.md` | `docs_legacy/plan/import_theories/*` | Negative guidance: không mở import plan cũ như reading path thường ngày. | 06 | 07 |
| `docs/theories/governance.md:284` | `docs_legacy/explain/*` | Phase 05 provenance: theory system được materialize từ legacy explain synthesis. | 06 | 07 |
| `docs/theories/governance.md:284` | `docs_legacy/architecture/custom_modular_monolith_theory/*` | Phase 05 provenance: reusable modular reasoning được split sang theory/app/app_technical. | 06 | 07 |
| `docs/theories/governance.md:284` | `docs_legacy/plan/import_theories/*` | Phase 05 provenance: import plan cũ là lịch sử materialization theory. | 06 | 07 |
| `docs/theories/governance.md:289` | `docs_legacy/plan/import_theories/*` | Negative guidance: import plan cũ không còn là execution plan. | 06 | 07 |
| `docs/theories/governance.md:290` | `docs_legacy/explain/custom_modular_monolith.md` | Phase 05 provenance: reasoning đã được supersede bởi theory/app decision/app_technical. | 06 | 07 |
| `docs/theories/governance.md:290` | `docs_legacy/explain/missing_theories.md` | Phase 05 provenance: reasoning đã được supersede bởi root governance và 6 theory folders. | 06 | 07 |
| `docs/app/10-decisions/README.md` | `docs_legacy/plan/import_theories` | Decision provenance: import theory plan cũ không còn là execution source. | 06 | 07 |

## Broken references

- None after Phase 06 fixes.

## Broken markdown links

- None after Phase 06 fixes.

## Orphan theory IDs

- None after Phase 06 fixes.

## Validation result

```text
Broken markdown links: 0
Open matrix rows: 0
Old root/path refs outside migration plan: 0
Old meta path refs outside migration plan: 0
Orphan theory IDs: 0
```
