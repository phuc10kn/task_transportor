# Final migration report

File này là báo cáo bắt buộc cho quyết định xóa `docs_legacy/`.

Không dùng file này để thay thế `migration_matrix.md`. Matrix là bằng chứng cấp file/cụm; report này là bản tóm tắt để người review hiểu vì sao legacy tree đã được xóa và không cần khôi phục vào repo.

## Tóm tắt quyết định

| Nhóm legacy | Kết luận | Evidence |
| --- | --- | --- |
| `docs_legacy/work/` | MERGED/SUPERSEDED | Product truth, Lite scope, implementation, quality and operation notes moved into `docs/app/00-context`, `01-business`, `02-product`, `06-technical`, `07-implementation`, `08-quality`, `09-operation` and `10-decisions`. |
| `docs_legacy/architecture/` | MERGED/SUPERSEDED | Architecture truth moved into `docs/app/05-architecture`, `docs/app_technical/custom_modular_monolith`, `docs/theories/modular-architecture` and root theory governance. |
| `docs_legacy/business/` | MERGED | Business workflows, use cases, rules, states, glossary and governance moved into `docs/app/01-business`, `docs/app/04-domain`, `docs/app/10-decisions` and `docs/meta`. |
| `docs_legacy/explain/` | MERGED/SUPERSEDED | Phase 05 review-fix moved living theory reasoning into `docs/theories`, `docs/theories/governance.md`, `docs/app/10-decisions`, and `docs/app_technical/custom_modular_monolith`. |
| `docs_legacy/explain_b2j/` | DISCARDED | Legacy `backlog2jira` analysis is out of current Central Sync Hub scope and excluded by `AGENTS.md` unless explicitly requested. |
| `docs_legacy/plan/import_theories/` | SUPERSEDED AS PROVENANCE | Phase 05 review-fix confirms this folder is no longer an execution source; current source is `docs/theories/**`, with history kept in this report. |
| `docs_legacy/server/` | MERGED | Server/runtime note moved into `docs/app/06-technical` and `docs/app/09-operation`. |

## Nội dung đã migrate

| Source | Destination | Vai trò |
| --- | --- | --- |
| none | none | Không có nhóm cần giữ bằng status `migrated`; phần còn sống được merge vào docs hiện có để tránh tạo lại cây legacy. |

## Nội dung đã merge

| Source | Destination | Phần đã merge |
| --- | --- | --- |
| `docs_legacy/work/**` | `docs/app/00-context`; `docs/app/01-business`; `docs/app/02-product`; `docs/app/06-technical`; `docs/app/07-implementation`; `docs/app/08-quality`; `docs/app/09-operation`; `docs/app/10-decisions` | Product direction, Lite scope, implementation plan, API/runtime/config, acceptance and operation truth. |
| `docs_legacy/architecture/**` | `docs/app/05-architecture`; `docs/app_technical/custom_modular_monolith`; `docs/theories/modular-architecture`; `docs/theories/governance.md` | App architecture truth, module/boundary/flow structure, reusable template and modular theory split. |
| `docs_legacy/business/**` | `docs/app/01-business`; `docs/app/04-domain`; `docs/app/10-decisions`; `docs/meta` | Business workflows, use cases, glossary, rules, states and documentation governance. |
| `docs_legacy/explain/custom_modular_monolith.md` | `docs/theories/modular-architecture`; `docs/app_technical/custom_modular_monolith`; `docs/app/10-decisions` | Split pure modular reasoning, app-specific application and reusable template responsibility. |
| `docs_legacy/explain/missing_theories.md` | `docs/theories/governance.md`; `docs/theories/*`; `docs/app/10-decisions` | Confirmed 6 active theory core set and whole-app theory routing rationale. |
| `docs_legacy/business/governance/**` | `docs/meta/README.md`; `docs/app/10-decisions` | Merged documentation ownership/update/checklist rules as meta-governance and app decision policy. |
| `docs_legacy/server/readme.md` | `docs/app/06-technical`; `docs/app/09-operation` | Server runtime note and operation-facing runtime context. |

## Nội dung superseded hoặc discard

| Source | Status | Lý do |
| --- | --- | --- |
| `docs_legacy/explain_b2j/**` | discard | Legacy `backlog2jira` context is outside the current Central Sync Hub source-of-truth path. |
| `docs_legacy/work/plans/medium/**`; `docs_legacy/work/plans/full/**` | superseded | Medium/Full plans are not current Lite scope; future scope is represented as decisions/provenance, not execution source. |
| `docs_legacy/architecture/custom_modular_monolith_theory/p2_cleanup_plan.md` | superseded | Historical cleanup/debt context; current implementation/evolution truth lives in `docs/app/07-implementation` and migration matrix evidence. |
| `docs_legacy/plan/import_theories/**` | superseded as provenance | Import plan is no longer an execution source; current source is `docs/theories/README.md`, `docs/theories/governance.md` and each theory folder governance. |

## Reference còn lại

Sau phase 06, mọi reference còn lại tới legacy phải được liệt kê ở đây.

| Reference | Lý do giữ | Deadline |
| --- | --- | --- |
| none outside migration plan | Phase 07 removes legacy reading references from `AGENTS.md` and docs living tree. | complete |

Chi tiết kiểm tra nằm ở [reference_report.md](reference_report.md).

## Kết quả Phase 07

- `docs_legacy/` đã bị xóa trong Phase 07.
- `docs/` là source of truth duy nhất cho docs đang sống.
- Migration matrix vẫn giữ provenance theo path legacy để audit lịch sử.

## Verification cuối

```powershell
rg -n "docs_legacy|docs_native_theory_app|docs/work|docs/architecture" docs AGENTS.md -g "!docs/plans/migrate_new_docs/**"
Select-String -Path docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|[^|]+\|[^|]+\|[^|]+\|\s*(migrate|merge|defer|keep-temporary)\s*\|'
Select-String -Path docs/plans/migrate_new_docs/final_migration_report.md,docs/plans/migrate_new_docs/migration_matrix.md -Pattern '^\|.*__UNRESOLVED__.*\|'
Test-Path docs_legacy
```

Kỳ vọng Phase 07: `Test-Path docs_legacy` trả về `False`; các lệnh kiểm tra cột `status`, dòng bảng chứa `__UNRESOLVED__` và reference legacy ngoài migration plan không có output.

## Xác nhận review

- [x] `migration_matrix.md` không còn dòng có cột `status` bằng `migrate`, `merge`, `defer`, `keep-temporary`.
- [x] File này không còn dòng bảng chứa `__UNRESOLVED__`.
- [x] `docs/README.md` là entry point đủ dùng.
- [x] `AGENTS.md` không còn yêu cầu đọc legacy docs cho công việc thường ngày.
- [x] Không còn broken reference do rename hoặc xóa legacy.
- [x] `docs_legacy/` đã bị xóa trong Phase 07.
- [x] Người review xác nhận sau cutover rằng không cần khôi phục `docs_legacy/`.
